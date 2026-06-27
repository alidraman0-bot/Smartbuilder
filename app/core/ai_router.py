"""
AI Router — production-grade routing layer with fallback chains, circuit
breaker, rate limiting, caching, and retry logic.

This module is the SINGLE entry point for all AI completions.  Services
should call `r.run(...)` instead of constructing their own
model / retry logic.
"""

import asyncio
import json
import random
import time
import logging
from typing import Optional, Dict, Any, List

from app.core.ai_models import get_model_chain, MODEL_REGISTRY
from app.core.ai_limiter import ai_limiter
from app.core.ai_cache import cache_key, get_cached, set_cached, get_ttl
from app.core.config import settings

logger = logging.getLogger(__name__)


class RoutedString(str):
    """A string subclass that holds routing metadata (model_used, provider)."""
    def __new__(cls, value, model_used=None, provider=None):
        obj = str.__new__(cls, value)
        obj.model_used = model_used
        obj.provider = provider
        return obj


# ---------------------------------------------------------------------------
# Circuit Breaker state (module-level, shared across requests)
# ---------------------------------------------------------------------------
_CIRCUIT_STATE: Dict[str, Dict[str, Any]] = {}
_CIRCUIT_THRESHOLD = 5          # failures before circuit opens
_CIRCUIT_COOLDOWN = 600         # seconds before half-open retry


def _is_network_error(exc: Exception) -> bool:
    """Check if the exception is due to a network / transport issue rather than the model itself."""
    import httpx
    if isinstance(exc, (httpx.NetworkError, httpx.TimeoutException, asyncio.TimeoutError)):
        return True
    
    err_str = str(exc).lower()
    network_patterns = [
        "connect", "timeout", "timed out", "handshake", "network", 
        "unreachable", "dns", "host", "connection", "socket", 
        "ssl", "tls", "remote end closed", "reset by peer"
    ]
    return any(p in err_str for p in network_patterns)


def _is_circuit_open(model: str) -> bool:
    """Check if a model's circuit breaker is open (too many recent failures)."""
    state = _CIRCUIT_STATE.get(model)
    if not state:
        return False
    if state["count"] >= _CIRCUIT_THRESHOLD:
        if time.time() - state["last_fail"] < _CIRCUIT_COOLDOWN:
            return True
        # Cooldown elapsed → half-open, allow a retry
        _CIRCUIT_STATE[model] = {"count": 0, "last_fail": 0}
    return False


def _record_failure(model: str, exc: Optional[Exception] = None):
    """Record a failure for the circuit breaker, ignoring general network errors."""
    if exc:
        # Do not count 429 rate-limit errors as circuit failures – treat as transient
        if "429" in str(exc):
            logger.debug(f"Not recording circuit breaker failure for {model} due to rate-limit (429).")
            return
        if _is_network_error(exc):
            logger.debug(f"Not recording circuit breaker failure for {model} due to network/transport error: {exc}")
            return
    
    if model not in _CIRCUIT_STATE:
        _CIRCUIT_STATE[model] = {"count": 0, "last_fail": 0}
    _CIRCUIT_STATE[model]["count"] += 1
    _CIRCUIT_STATE[model]["last_fail"] = time.time()


def _record_success(model: str):
    """Reset failure count on success."""
    _CIRCUIT_STATE[model] = {"count": 0, "last_fail": 0}


# ---------------------------------------------------------------------------
# AIRouter
# ---------------------------------------------------------------------------
class AIRouter:
    """
    Routes AI requests through the model registry with:
      - Task-based model selection
      - Ordered fallback chains
      - Circuit breaker per model
      - Global rate limiting
      - Exponential backoff with jitter on 429s
    """

    def __init__(self):
        self._client = None  # Lazy-initialised OpenAI client

    def _get_client(self):
        """Lazy-initialise the client wrapper via AIClient."""
        from app.core.ai_client import get_ai_client
        return get_ai_client()

    # ------------------------------------------------------------------
    # Low-level model call
    # ------------------------------------------------------------------
    async def _call_model(
        self,
        model: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        response_format: Optional[Dict[str, Any]] = None,
    ) -> RoutedString:
        """
        Make a single completion call via unified AIClient.
        Returns a RoutedString with content and routing metadata.
        Raises on any error.
        """
        ai_client = self._get_client()
        
        # We extract system prompt from messages if it exists
        system_prompt = None
        user_messages = []
        for msg in messages:
            if msg.get("role") == "system":
                system_prompt = msg.get("content")
            else:
                user_messages.append(msg)
                
        # Call the unified chat_completion directly for this specific model
        res = await ai_client.chat_completion(
            messages=user_messages,
            system_prompt=system_prompt,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            response_format=response_format
        )
        
        content = res.get("content", "")
        if not content:
            raise ValueError(f"Empty/invalid response from model: {model}")
            
        return RoutedString(
            content,
            model_used=res.get("model_used", model),
            provider=res.get("provider", "unknown")
        )

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    async def run(
        self,
        task: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        response_format: Optional[Dict[str, Any]] = None,
        use_cache: bool = True,
    ) -> RoutedString:
        """
        Execute an AI completion for the given *task* using the model
        registry's fallback chain.

        Returns a RoutedString containing content and routing metadata.
        Raises if the entire chain fails.
        """
        model_chain = get_model_chain(task)

        # ── Cache check ──────────────────────────────────────────────
        ck = None
        if use_cache:
            prompt_text = json.dumps(messages, default=str)
            ck = cache_key(task, prompt_text)
            cached_result = get_cached(ck)
            if cached_result is not None:
                # Validate cached JSON if json_object is requested (Fix 6)
                is_valid = True
                if response_format and response_format.get("type") == "json_object":
                    try:
                        json.loads(cached_result)
                    except (json.JSONDecodeError, TypeError):
                        logger.warning(f"Cache pollution detected for {ck} (invalid JSON). Purging.")
                        from app.core.ai_cache import invalidate
                        invalidate(ck)
                        is_valid = False
                
                if is_valid:
                    logger.info(f"AI router | task={task} | CACHE HIT")
                    primary_model = model_chain[0] if model_chain else "unknown"
                    return RoutedString(
                        cached_result,
                        model_used=primary_model,
                        provider="cache"
                    )

        # ── Model fallback chain ─────────────────────────────────────
        last_error: Optional[Exception] = None

        # If all models in the chain have open circuits, bypass the circuit breaker to avoid self-inflicted lockout
        all_broken = all(_is_circuit_open(m) for m in model_chain)
        if all_broken:
            logger.warning(f"All models in fallback chain for task={task} are circuit-broken. Bypassing circuit breakers to attempt recovery.")

        for model in model_chain:
            if not all_broken and _is_circuit_open(model):
                logger.warning(f"Circuit open for {model} — skipping")
                continue

            # Rate-limit aware call
            await ai_limiter.acquire()
            try:
                logger.info(f"AI router | task={task} | model={model}")
                result = await self._call_model(
                    model, messages, temperature, max_tokens, response_format,
                )
                _record_success(model)

                # ── Cache the result (with validation) ──────────────
                if ck and use_cache and result:
                    # Only cache valid responses — prevent cache poisoning
                    should_cache = True
                    if response_format and response_format.get("type") == "json_object":
                        try:
                            json.loads(result)  # Validate JSON before caching
                        except (json.JSONDecodeError, TypeError):
                            logger.warning(f"Skipping cache for malformed JSON response from {model}")
                            should_cache = False
                    if should_cache:
                        set_cached(ck, result, get_ttl(task))

                return result

            except Exception as e:
                error_str = str(e)
                logger.warning(f"Model {model} failed for task={task}: {error_str}")
                _record_failure(model, e)
                last_error = e

                # Backoff with explicit retry handling for 429
                if "429" in error_str:
                    wait = 2.0 + random.uniform(0.5, 2.0)
                    logger.warning(f"Rate limited (429) on {model}. Waiting {wait:.1f}s before retrying same model.")
                    await asyncio.sleep(wait)
                    # Retry the same model once more before falling back
                    try:
                        result = await self._call_model(
                            model, messages, temperature, max_tokens, response_format,
                        )
                        _record_success(model)
                        if ck and use_cache and result:
                            # Cache validation as before
                            should_cache = True
                            if response_format and response_format.get("type") == "json_object":
                                try:
                                    json.loads(result)
                                except (json.JSONDecodeError, TypeError):
                                    logger.warning(f"Skipping cache for malformed JSON response from {model}")
                                    should_cache = False
                            if should_cache:
                                set_cached(ck, result, get_ttl(task))
                        return result
                    except Exception as e2:
                        logger.warning(f"Retry of model {model} still failed: {e2}")
                        _record_failure(model, e2)
                        last_error = e2
                        # Proceed with normal backoff for next model
                        await asyncio.sleep(1.0 + random.random())
                else:
                    await asyncio.sleep(1.0 + random.random())
            finally:
                ai_limiter.release()

        # Final fallback to Mock if enabled
        if settings.ENABLE_AI_MOCK:
            logger.warning(f"All models failed for task={task}. Falling back to MOCK response.")
            try:
                from app.core.ai_client import get_ai_client
                ai_client = get_ai_client()
                system_prompt = None
                user_messages = []
                for msg in messages:
                    if msg["role"] == "system":
                        system_prompt = msg["content"]
                    else:
                        user_messages.append(msg)
                mock_res = await ai_client._mock_completion(user_messages, system_prompt, response_format)
                return RoutedString(
                    mock_res["content"],
                    model_used=mock_res.get("model", "smartbuilder-offline-fallback"),
                    provider=mock_res.get("provider", "mock")
                )
            except Exception as mock_err:
                logger.error(f"Failed to generate mock fallback response: {mock_err}")

        raise Exception(
            f"All models failed for task={task}. Last error: {last_error}"
        )


# ---------------------------------------------------------------------------
# Module-level singleton
# ---------------------------------------------------------------------------
r = AIRouter()
ai_router = r
