"""
Advanced AI Client with multi-provider support and fallback capabilities.
Supports OpenAI, Anthropic Claude, and Google Gemini.

The AIRouter (app.core.ai_router) is now the preferred path for new code.
Existing callers continue to work via `chat_completion()` unchanged.
New callers should use `routed_completion(task, ...)` for task-aware routing.
"""
import logging
import json
import asyncio
import re
import random
import time

from typing import Optional, Dict, Any, List
from enum import Enum

from app.core.config import settings
from app.core.ai_limiter import ai_limiter
from app.core.ai_models import get_model_chain, FALLBACK_MODELS, MODEL_REGISTRY

logger = logging.getLogger(__name__)

# Circuit breaker state
FAILED_MODELS = {} # model_name -> {"count": int, "last_fail": float}
CIRCUIT_BREAKER_THRESHOLD = 5
CIRCUIT_BREAKER_COOLDOWN = 600 # 10 minutes


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


class AIProvider(str, Enum):
    """Supported AI providers."""
    OPENAI = "openai"
    GEMINI = "gemini"
    ANTHROPIC = "anthropic"
    DEEPSEEK = "deepseek"


class AIClient:
    """
    Unified AI client with multi-provider support and automatic fallback.
    """
    
    def __init__(self, provider: Optional[str] = None):
        """
        Initialize AI client with specified provider or use default from settings.
        """
        self.provider = provider or settings.AI_PROVIDER
        self.clients = {}
        self._initialize_clients()
    
    def _initialize_clients(self):
        """Initialize all available AI provider clients."""
        # OpenAI (Native)
        if self._is_valid_key(settings.OPENAI_API_KEY):
            try:
                from openai import AsyncOpenAI
                import httpx
                # Use default OpenAI base URL or custom if specified (not OpenRouter)
                base_url = settings.OPENAI_BASE_URL if settings.OPENAI_BASE_URL else "https://api.openai.com/v1"
                custom_client = httpx.AsyncClient(verify=False, timeout=60.0)
                self.clients[AIProvider.OPENAI] = AsyncOpenAI(
                    api_key=settings.OPENAI_API_KEY,
                    base_url=base_url,
                    http_client=custom_client,
                    max_retries=0
                )
                logger.info(f"OpenAI native client initialized at base_url={base_url}")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI client: {e}")

        # Google Gemini (via OpenAI compatibility endpoint)
        if self._is_valid_key(settings.GOOGLE_API_KEY) or self._is_valid_key(settings.GEMINI_API_KEY):
            try:
                from openai import AsyncOpenAI
                import httpx
                api_key = settings.GEMINI_API_KEY or settings.GOOGLE_API_KEY
                custom_client = httpx.AsyncClient(verify=False, timeout=60.0)
                self.clients[AIProvider.GEMINI] = AsyncOpenAI(
                    api_key=api_key,
                    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
                    http_client=custom_client,
                    max_retries=0
                )
                logger.info("Google Gemini native client initialized via OpenAI compatibility endpoint")
            except Exception as e:
                logger.warning(f"Failed to initialize Google Gemini client: {e}")

        # DeepSeek (via OpenAI compatibility endpoint)
        if self._is_valid_key(settings.DEEPSEEK_API_KEY):
            try:
                from openai import AsyncOpenAI
                import httpx
                custom_client = httpx.AsyncClient(verify=False, timeout=60.0)
                self.clients[AIProvider.DEEPSEEK] = AsyncOpenAI(
                    api_key=settings.DEEPSEEK_API_KEY,
                    base_url=settings.DEEPSEEK_BASE_URL if settings.DEEPSEEK_BASE_URL else "https://api.deepseek.com",
                    http_client=custom_client,
                    max_retries=0
                )
                logger.info("DeepSeek native client initialized via OpenAI compatibility endpoint")
            except Exception as e:
                logger.warning(f"Failed to initialize DeepSeek client: {e}")

        # Anthropic (Native SDK)
        if self._is_valid_key(settings.ANTHROPIC_API_KEY):
            try:
                from anthropic import AsyncAnthropic
                import httpx
                custom_client = httpx.AsyncClient(verify=False, timeout=60.0)
                self.clients[AIProvider.ANTHROPIC] = AsyncAnthropic(
                    api_key=settings.ANTHROPIC_API_KEY,
                    http_client=custom_client,
                    max_retries=0
                )
                logger.info("Anthropic native AsyncAnthropic client initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize Anthropic client: {e}")

        if not self.clients:
            logger.warning("No AI clients initialized. Please configure at least one VALID API key.")

    def _is_valid_key(self, key: Optional[str]) -> bool:
        """Check if an API key is valid and not a placeholder."""
        if not key:
            return False
        key = key.strip()
        if not key:
            return False
        # Check for common placeholders (e.g. "your_openai_key", "sk-proj-YOUR_KEY_HERE")
        placeholders = ["your_", "api_key", "sk-proj-your", "sk-ant-api03-your"]
        if any(p in key.lower() for p in placeholders) or len(key) < 15:
            return False
        return True
    
    def _get_provider_for_model(self, model: str) -> AIProvider:
        model_lower = model.lower()
        if model_lower.startswith("openai/") or model_lower.startswith("gpt-") or model_lower.startswith("o1-"):
            return AIProvider.OPENAI
        elif model_lower.startswith("anthropic/") or model_lower.startswith("claude-"):
            return AIProvider.ANTHROPIC
        elif model_lower.startswith("google/") or model_lower.startswith("gemini-") or model_lower.startswith("gemma-"):
            return AIProvider.GEMINI
        elif model_lower.startswith("deepseek/"):
            return AIProvider.DEEPSEEK
        return AIProvider.OPENAI

    def _clean_model_name(self, model: str) -> str:
        if "/" in model:
            parts = model.split("/", 1)
            if parts[0].lower() in ["openai", "anthropic", "google", "deepseek"]:
                model = parts[1]
        if model.endswith(":free"):
            model = model[:-5]
        return model

    def _is_provider_ready(self, provider: AIProvider) -> bool:
        if provider == AIProvider.OPENAI:
            return self._is_valid_key(settings.OPENAI_API_KEY)
        elif provider == AIProvider.GEMINI:
            return self._is_valid_key(settings.GOOGLE_API_KEY) or self._is_valid_key(settings.GEMINI_API_KEY)
        elif provider == AIProvider.DEEPSEEK:
            return self._is_valid_key(settings.DEEPSEEK_API_KEY)
        elif provider == AIProvider.ANTHROPIC:
            return self._is_valid_key(settings.ANTHROPIC_API_KEY)
        return False

    def _validate_output(self, content: Optional[str], response_format: Optional[Dict[str, Any]] = None) -> None:
        """
        Validate generated output to ensure it is not empty, does not contain placeholder text,
        and is valid JSON if requested. Raises ValueError if validation fails.
        """
        if not content or not content.strip():
            raise ValueError("AI returned empty content")

        content_lower = content.lower()
        
        # Detect typical placeholder phrases
        placeholders = [
            "lorem ipsum", "lorem_ipsum", "lorem-ipsum",
            "insert text here", "insert content here", "placeholder text",
            "fake data", "example text", "TODO:", "your content here",
            "your_openai_key", "sk-proj-"
        ]
        if any(p in content_lower for p in placeholders):
            raise ValueError(f"AI response contains placeholder or fake data: '{content[:50]}...'")

        # Validate JSON if requested
        if response_format and response_format.get("type") == "json_object":
            try:
                extracted = self._extract_json(content)
                json.loads(extracted)
            except Exception as e:
                raise ValueError(f"AI response is not valid JSON: {e}")

    async def _anthropic_completion(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str],
        model: str,
        temperature: Optional[float],
        max_tokens: Optional[int],
        response_format: Optional[Dict[str, Any]],
        **kwargs
    ) -> Dict[str, Any]:
        """Call Anthropic API using native AsyncAnthropic client."""
        client = self.clients.get(AIProvider.ANTHROPIC)
        if not client:
            raise Exception("Anthropic native client is not initialized")
        
        # Prepare formatted messages for Anthropic
        formatted_messages = []
        for msg in messages:
            role = msg.get("role")
            content = msg.get("content")
            if role in ["user", "assistant"]:
                formatted_messages.append({"role": role, "content": content})
            elif role == "system" and not system_prompt:
                system_prompt = content
                
        # Handle json_object response format instruction if requested
        if response_format and response_format.get("type") == "json_object":
            combined_content = (system_prompt or "").lower()
            for msg in messages:
                combined_content += " " + msg.get("content", "").lower()
            if "json" not in combined_content:
                json_instruction = "\n\nIMPORTANT: Return the response in valid JSON format only."
                if system_prompt:
                    system_prompt += json_instruction
                else:
                    system_prompt = "Return ONLY valid JSON."

        params = {
            "model": model or "claude-sonnet-4-20250514",
            "messages": formatted_messages,
            "max_tokens": max_tokens or settings.MAX_TOKENS or 4096,
        }
        if system_prompt:
            params["system"] = system_prompt
        if temperature is not None:
            params["temperature"] = temperature
            
        response = await client.messages.create(**params)
        
        content_text = ""
        if response.content and isinstance(response.content, list):
            content_text = response.content[0].text
        elif isinstance(response.content, str):
            content_text = response.content
            
        input_tokens = response.usage.input_tokens if response.usage else 0
        output_tokens = response.usage.output_tokens if response.usage else 0
        
        return {
            "content": content_text,
            "model": response.model or model,
            "usage": {
                "prompt_tokens": input_tokens,
                "completion_tokens": output_tokens,
                "total_tokens": input_tokens + output_tokens
            }
        }

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        response_format: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Unified chat completion with automatic failover across available models and providers.
        """
        primary_model = model or settings.OPENAI_MODEL

        # Find which task matches primary_model to get fallback list
        task_key = "default"
        for k, val in MODEL_REGISTRY.items():
            if val == primary_model:
                task_key = k
                break
        
        fallback_chain = get_model_chain(task_key)
        # Ensure primary_model is first in the list
        if primary_model not in fallback_chain:
            fallback_chain = [primary_model] + fallback_chain
        else:
            fallback_chain = [primary_model] + [m for m in fallback_chain if m != primary_model]
        
        # Check if all models in fallback chain are circuit-broken
        def is_model_broken(m):
            if m in FAILED_MODELS:
                fs = FAILED_MODELS[m]
                return fs["count"] >= CIRCUIT_BREAKER_THRESHOLD and (time.time() - fs["last_fail"] < CIRCUIT_BREAKER_COOLDOWN)
            return False
            
        all_broken = all(is_model_broken(m) for m in fallback_chain)
        if all_broken:
            logger.warning("All models in fallback chain are circuit-broken. Bypassing circuit breakers to attempt recovery.")

        last_error = None
        for current_model in fallback_chain:
            provider_name = self._get_provider_for_model(current_model)
            if not self._is_provider_ready(provider_name):
                logger.warning(f"Provider {provider_name} for model {current_model} is not ready/configured. Skipping...")
                continue

            # Circuit Breaker Check
            if not all_broken and current_model in FAILED_MODELS:
                fail_state = FAILED_MODELS[current_model]
                if fail_state["count"] >= CIRCUIT_BREAKER_THRESHOLD:
                    if time.time() - fail_state["last_fail"] < CIRCUIT_BREAKER_COOLDOWN:
                        logger.warning(f"Circuit breaker active for {current_model}. Skipping...")
                        continue
                    else:
                        FAILED_MODELS[current_model] = {"count": 0, "last_fail": 0}

            # Retry Loop with Exponential Backoff
            MAX_RETRIES = 2
            for attempt in range(MAX_RETRIES):
                try:
                    logger.info(f"Attempting AI request with model: {current_model} via provider {provider_name} (Attempt {attempt+1}/{MAX_RETRIES})")
                    
                    # Rate-limit aware call
                    await ai_limiter.acquire()
                    try:
                        clean_model = self._clean_model_name(current_model)
                        if provider_name == AIProvider.ANTHROPIC:
                            result = await asyncio.wait_for(
                                self._anthropic_completion(
                                    messages, system_prompt, clean_model, temperature, max_tokens, response_format, **kwargs
                                ),
                                timeout=90.0
                            )
                        else:
                            result = await asyncio.wait_for(
                                self._openai_completion(
                                    messages, system_prompt, clean_model, temperature, max_tokens, response_format, provider=provider_name, **kwargs
                                ),
                                timeout=90.0
                            )
                    finally:
                        ai_limiter.release()
                    
                    if not result or not isinstance(result, dict):
                        raise ValueError(f"Model {current_model} returned invalid result type: {type(result)}")

                    content = result.get("content")
                    # Output validation: rejects empty content, placeholder text, and invalid JSON
                    self._validate_output(content, response_format)

                    # Extract JSON if requested
                    if response_format and response_format.get("type") == "json_object":
                        if content:
                            result["content"] = self._extract_json(content)

                    result['provider'] = provider_name
                    result['model_used'] = current_model
                    
                    if current_model in FAILED_MODELS:
                        FAILED_MODELS[current_model]["count"] = 0
                        
                    return result

                except asyncio.TimeoutError:
                    logger.warning(f"Model {current_model} timed out. Attempt {attempt+1}")
                    if attempt == MAX_RETRIES - 1:
                        raise
                    await asyncio.sleep(2 ** attempt)

                except Exception as e:
                    error_str = str(e)
                    
                    if not _is_network_error(e):
                        if current_model not in FAILED_MODELS:
                            FAILED_MODELS[current_model] = {"count": 0, "last_fail": 0}
                        FAILED_MODELS[current_model]["count"] += 1
                        FAILED_MODELS[current_model]["last_fail"] = time.time()
                    else:
                        logger.debug(f"Not recording circuit breaker failure for {current_model} due to network/transport error: {e}")

                    # Handle 429 Rate Limits
                    if "429" in error_str:
                        wait_time = (2 ** attempt) + random.uniform(0.5, 1.5)
                        logger.warning(f"Rate limited (429) for {current_model}. Retrying in {wait_time:.2f}s...")
                        await asyncio.sleep(wait_time)
                        continue
                    
                    logger.warning(f"Model {current_model} failed on attempt {attempt+1}: {e}")
                    if attempt == MAX_RETRIES - 1:
                        logger.warning(f"All retries failed for {current_model}. Moving to next in chain.")
                        last_error = e
                        break
                    
                    await asyncio.sleep(1)

            try:
                last_error = e
                logger.error(f"{provider_name} execution failed: {e}")
            except: pass

        # Final fallback to Mock if enabled
        if settings.ENABLE_AI_MOCK:
             logger.warning("All AI models and providers failed. Falling back to MOCK response.")
             result = await self._mock_completion(messages, system_prompt, response_format)
             result['provider'] = 'mock'
             return result

        error_msg = f"All AI providers failed. Last error: {str(last_error)}"
        logger.error(error_msg)
        raise Exception(error_msg)



    async def _mock_completion(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        response_format: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generates a semi-intelligent mock response when all real AI providers fail.
        """
        logger.info("Generating Mock AI response...")
        
        # Simple heuristics based on system prompt and message content
        prompt_lower = (system_prompt or "").lower()
        for msg in messages:
            prompt_lower += " " + msg.get("content", "").lower()
            
        # Determine if we should return JSON (support auto-detection)
        is_json = (
            (response_format and response_format.get("type") == "json_object") or
            "json" in prompt_lower or
            "return only" in prompt_lower or
            "{" in prompt_lower or
            "structured json" in prompt_lower
        )
        
        if is_json:
            if "investment brief" in prompt_lower or "brief_data" in prompt_lower:
                content = json.dumps({
                    "title": "Synthetic Analysis (AI Offline)",
                    "confidence_score": 75,
                    "market_size": {
                        "estimate": "Market data unavailable",
                        "range": "N/A",
                        "source_logic": "Fallback mock due to provider credit exhaustion."
                    },
                    "complexity": {"score": 5, "level": "medium", "reason": "Default fallback"},
                    "problem": {"summary": "The requested problem space is currently being analyzed in offline mode.", "pain_points": ["Intelligence gateway depleted"]},
                    "target_customers": {"primary": "Undetermined", "secondary": [], "geography": "Global"},
                    "monetization": {"model": "Freemium / B2B SaaS", "pricing_examples": [], "revenue_streams": []},
                    "why_now": {"summary": "Market timing analysis requires active AI connections.", "trends": [], "timing_reason": "N/A"},
                    "market_gaps_today": [],
                    "mvp_scope": {"core_features": ["Offline Placeholder"], "tech_stack": ["Wait for AI"], "build_time_estimate": "3-5 weeks"},
                    "why_smartbuilder_confident": {"signals_used": [], "data_points": [], "reasoning": "This is a placeholder brief generated because all AI providers (OpenAI, Anthropic, Gemini) are currently out of credits."},
                    "risks_to_validate": [{"risk": "AI Connection Error", "type": "technical", "validation_method": "Check API Keys"}]
                })
            elif any(k in prompt_lower for k in ["market research", "market intelligence", "tam", "executive_summary", "swot", "competitor"]):
                content = json.dumps({
                    "executive_summary": "Offline high-quality market intelligence analysis. Smartbuilder has compiled this structural report because your API limits are currently reached.",
                    "market_size": {
                        "tam": "$12.5 Billion",
                        "sam": "$2.1 Billion",
                        "som": "$180 Million",
                        "cagr": "14.5%"
                    },
                    "industry_trends": [
                        "Accelerated shift toward autonomous B2B workflows and agentic interfaces.",
                        "Decoupling of heavyweight legacy enterprise software in favor of micro-APIs.",
                        "Mandatory ESG compliance reporting driving CleanTech tooling adoption globally."
                    ],
                    "competitors": [
                        {"name": "Legacy Enterprise Inc", "core_moat": "Established client footprint", "vulnerability": "Slow API cycles and high license cost"},
                        {"name": "Canva Systems", "core_moat": "Drag-and-drop ease", "vulnerability": "Lacks specialized functional tailwinds"}
                    ],
                    "customer_segments": [
                        {"name": "Fresh Graduates & Professionals", "pain_point": "Inefficient non-standard formatting templates", "adoption_barrier": "Lack of self-serve custom tools"}
                    ],
                    "pain_points": [
                        "High structural friction in configuring bespoke integration layers.",
                        "Severe revenue leakage due to inaccurate demand forecasting.",
                        "Sub-optimal action item accountability across distributed workspaces."
                    ],
                    "pricing_analysis": [
                        {"comparable_tool": "Legacy Enterprise System", "pricing": "$150-$500/month", "willingness_to_pay_signal": "Strong based on high pain index"}
                    ],
                    "market_gaps": [
                        "Hyper-local context modeling within standard career guidance portals.",
                        "Self-healing predictive scheduling pipelines for direct e-commerce brands."
                    ],
                    "growth_forecast": [
                        "15% global increase in automated data processing pipeline budgets.",
                        "Rapid integration of speech accountability systems inside operational suites."
                    ],
                    "investment_analysis": {
                        "attractiveness": "High due to clear product-market fit tailwinds",
                        "payback_period_months": 8
                    },
                    "swot": {
                        "strengths": ["Self-healing intelligence architecture", "Zero setup friction"],
                        "weaknesses": ["Dependence on third-party API reliability", "Initial brand awareness"],
                        "opportunities": ["Favorable international data privacy regulations", "Unserved mid-market compliance layers"],
                        "threats": ["Rapid feature imitation by major legacy vendors", "SaaS budget compression"]
                    },
                    "risk_analysis": [
                        {"description": "Longer enterprise procurement cycles", "mitigation": "Lead with a zero-friction self-serve free trial tier"}
                    ],
                    "strategic_recommendations": [
                        "Initiate target search/social demand validation immediately.",
                        "Focus developer velocity on building native 1-click schema migration wizard."
                    ],
                    "sources_used": [
                        "BrightData Search Analytics Group",
                        "Reddit/r/startups Feedback Signal Data",
                        "Gartner HR Technology Hype Cycle Report"
                    ],
                    "confidence_score": 85
                })
            elif "ideas" in prompt_lower or "startup" in prompt_lower or "discovery" in prompt_lower or "opportunities" in prompt_lower:
                import uuid
                content = json.dumps({
                    "ideas": [
                        {
                            "id": "quota-warning",
                            "title": "⚠️ AI Quota Exhausted (Mock Mode)",
                            "summary": "Your AI provider keys (Gemini, OpenAI, Anthropic) have reached their limits. Smartbuilder is currently using high-quality pre-modeled ideas to demonstrate functionality. Please top up your API credits to resume real-time discovery.",
                            "thesis": "AI Provider Quota Exhaustion Detected",
                            "industry": "System",
                            "problem": "Real-time generation disabled due to API limits",
                            "target_market": "Smartbuilder Developer",
                            "why_now": "Quota hit",
                            "monetization": "N/A",
                            "trend_strength": "high",
                            "competition_level": "low",
                            "validation_score": 99
                        },
                        {
                            "id": str(uuid.uuid4()),
                            "title": "AI-Powered Compliance Autopilot for SMBs",
                            "summary": "Automate regulatory compliance monitoring and reporting for small businesses using AI agents that track changes in local, state, and federal regulations.",
                            "thesis": "Small businesses waste 100+ hours/year on compliance. An AI agent that monitors regulations and auto-generates reports can save them time and reduce legal risk.",
                            "industry": "RegTech",
                            "problem": "SMBs lack in-house legal teams and struggle to keep up with constantly changing compliance requirements.",
                            "target_market": "Small businesses with 10-200 employees in regulated industries",
                            "why_now": "LLMs now capable of parsing legal documents with high accuracy; regulatory complexity increasing post-2024",
                            "monetization": "SaaS: $99-$499/mo based on company size",
                            "trend_strength": "high",
                            "competition_level": "medium",
                            "validation_score": 82,
                            "market_size": "$4.2B",
                            "target_customer": {"primary_user": "SMB founders & ops managers", "company_size": "10-200 employees", "industry_or_role": "RegTech / Legal"},
                            "problem_bullets": ["Compliance violations cost SMBs avg $15K/year", "Manual tracking across 3-5 regulatory bodies", "No affordable alternative to hiring compliance officers"],
                            "why_now_bullets": ["AI legal reasoning matured in 2025", "Post-pandemic regulatory surge across industries"],
                            "confidence_reasoning_bullets": ["Strong pain signal from SMB forums", "Adjacent tools raising significant funding"]
                        },
                        {
                            "id": str(uuid.uuid4()),
                            "title": "Intelligent Inventory Forecasting for D2C Brands",
                            "summary": "ML-powered demand forecasting that prevents stockouts and overstock for direct-to-consumer e-commerce brands, integrating with Shopify and WooCommerce.",
                            "thesis": "D2C brands lose 15-30% revenue to inventory mismanagement. Predictive AI that syncs with existing e-commerce platforms can capture this gap.",
                            "industry": "E-commerce / Supply Chain",
                            "problem": "D2C brands manually forecast demand using spreadsheets, leading to costly stockouts and dead inventory.",
                            "target_market": "D2C e-commerce brands doing $500K-$10M annual revenue",
                            "why_now": "Shopify ecosystem growing 25% YoY; affordable ML inference enables real-time forecasting",
                            "monetization": "Usage-based SaaS: $149-$799/mo based on SKU count",
                            "trend_strength": "high",
                            "competition_level": "medium",
                            "validation_score": 78,
                            "market_size": "$6.8B",
                            "target_customer": {"primary_user": "E-commerce ops managers", "company_size": "SMB D2C brands", "industry_or_role": "E-commerce / Retail"},
                            "problem_bullets": ["30% of D2C brands experience stockouts monthly", "Excess inventory ties up $50K+ in working capital", "Spreadsheet forecasting ignores seasonality and trends"],
                            "why_now_bullets": ["Shopify/WooCommerce API ecosystem mature", "ML inference costs dropped 90% in 2 years"],
                            "confidence_reasoning_bullets": ["Multiple Reddit threads from D2C founders seeking solutions", "Adjacent funding activity in supply chain AI"]
                        },
                        {
                            "id": str(uuid.uuid4()),
                            "title": "AI Meeting Intelligence for Remote Teams",
                            "summary": "Automatic meeting transcription, action item extraction, and follow-up tracking for distributed teams — replacing manual note-taking with AI-driven accountability.",
                            "thesis": "Remote workers spend 31 hours/month in meetings with poor follow-through. An AI copilot that captures decisions and tracks commitments fills this gap.",
                            "industry": "Productivity / Future of Work",
                            "problem": "Action items from meetings get lost, leading to repeated discussions and missed deadlines across remote teams.",
                            "target_market": "Remote-first companies with 20-500 employees",
                            "why_now": "Remote work now permanent for 40% of knowledge workers; Whisper/GPT-4o make real-time transcription viable",
                            "monetization": "Per-seat SaaS: $12-$25/user/mo",
                            "trend_strength": "high",
                            "competition_level": "high",
                            "validation_score": 75,
                            "market_size": "$3.9B",
                            "target_customer": {"primary_user": "Engineering & product managers", "company_size": "20-500 employees", "industry_or_role": "Productivity SaaS"},
                            "problem_bullets": ["67% of meetings have no documented outcomes", "Average worker re-discusses same topics 3x before action", "Existing tools transcribe but don't track accountability"],
                            "why_now_bullets": ["Real-time transcription accuracy now 95%+", "Remote work culture demands async accountability"],
                            "confidence_reasoning_bullets": ["Category leader Otter.ai raised $65M — market validated", "User complaints about existing tools signal feature gaps"]
                        },
                        {
                            "id": str(uuid.uuid4()),
                            "title": "Carbon Footprint API for SaaS Products",
                            "summary": "A developer-first API that calculates and reports the carbon footprint of cloud infrastructure, enabling SaaS companies to offer sustainability dashboards to their customers.",
                            "thesis": "ESG reporting becoming mandatory for enterprises. SaaS products embedding carbon tracking will gain competitive advantage and meet upcoming EU regulations.",
                            "industry": "CleanTech / Developer Tools",
                            "problem": "SaaS companies have no easy way to measure or report the environmental impact of their cloud usage to customers.",
                            "target_market": "SaaS companies serving enterprise clients with ESG requirements",
                            "why_now": "EU CSRD regulations effective 2025; enterprise procurement increasingly requires sustainability data from vendors",
                            "monetization": "API usage-based: $0.001/request + $299/mo base",
                            "trend_strength": "medium",
                            "competition_level": "low",
                            "validation_score": 71,
                            "market_size": "$2.1B",
                            "target_customer": {"primary_user": "DevOps & platform engineers", "company_size": "Mid-market SaaS", "industry_or_role": "CleanTech / Developer Tools"},
                            "problem_bullets": ["No standardized API for cloud carbon measurement", "Enterprise customers demanding ESG data from SaaS vendors", "Manual carbon accounting costs $50K+/year"],
                            "why_now_bullets": ["EU CSRD mandate creating regulatory urgency", "AWS/Azure releasing more granular carbon data APIs"],
                            "confidence_reasoning_bullets": ["Low competition in developer-first sustainability tools", "Regulatory tailwinds creating mandatory demand"]
                        }
                    ],
                    "market_gaps": ["SMB compliance automation", "D2C inventory intelligence", "Meeting accountability tools"],
                    "pain_points": ["Regulatory complexity overwhelming small teams", "Manual forecasting causing revenue loss", "Remote meeting fatigue without outcomes"],
                    "trends": ["AI agents for business operations", "Sustainability-as-a-service", "Developer-first APIs"]
                })
            else:
                content = json.dumps({"message": "AI services are currently unavailable. This is a fallback mock response.", "status": "mock"})
        else:
            content = "I apologize, but all associated AI providers (OpenAI, Claude, Gemini) are currently reporting a 'low balance' or 'quota exceeded' error. To continue with real analysis, please top up your API credits. In the meantime, I am responding in Offline Mock Mode."
            
        return {
            "content": content,
            "model": "smartbuilder-offline-fallback",
            "usage": {"total_tokens": 0}
        }
    
    async def generate_embedding(self, text: str, model: str = "text-embedding-3-small") -> List[float]:
        """Generate vector embedding for text."""
        if AIProvider.OPENAI in self.clients:
            try:
                return await self._openai_embedding(text, model)
            except Exception as e:
                logger.error(f"OpenAI embedding failed: {e}")
            
        raise Exception("No embedding provider available")

    async def _openai_embedding(self, text: str, model: str) -> List[float]:
        client = self.clients[AIProvider.OPENAI]
        response = await client.embeddings.create(input=text, model=model)
        if not response or not hasattr(response, 'data') or not response.data:
            logger.error("OpenAI embedding response has no data")
            raise Exception("Invalid embedding response")
        return response.data[0].embedding
    
    def _extract_json(self, text: str) -> str:
        """Extract JSON from text."""
        if not text:
            return text
            
        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
        if json_match:
            return json_match.group(1)
        
        try:
            start = text.find('{')
            end = text.rfind('}')
            if start != -1 and end != -1 and end > start:
                candidate = text[start:end+1]
                json.loads(candidate)
                return candidate
        except: pass
        
        try:
             start = text.find('[')
             end = text.rfind(']')
             if start != -1 and end != -1 and end > start:
                 candidate = text[start:end+1]
                 json.loads(candidate)
                 return candidate
        except: pass
            
        return text
    
    async def _openai_completion(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str],
        model: Optional[str],
        temperature: Optional[float],
        max_tokens: Optional[int],
        response_format: Optional[Dict[str, Any]],
        provider: str = AIProvider.OPENAI,
        **kwargs
    ) -> Dict[str, Any]:
        """Get completion from OpenAI/OpenRouter/Gemini."""
        client = self.clients.get(provider) or self.clients[AIProvider.OPENAI]
        logger.info(f"DEBUG: provider passed={provider}, using client with base_url={client.base_url}")
        
        # Prepare messages
        formatted_messages = []
        if system_prompt:
            formatted_messages.append({"role": "system", "content": system_prompt})
        formatted_messages.extend(messages)
        
        # Prepare parameters and clean/translate model name for native compatibility
        requested_model = model or settings.OPENAI_MODEL
        clean_model = self._clean_model_name(requested_model)
        
        if provider == AIProvider.GEMINI:
            if clean_model.startswith("gemini-1.5"):
                clean_model = clean_model.replace("gemini-1.5", "gemini-2.5")
            if not (clean_model.startswith("gemini-") or clean_model.startswith("gemma-")):
                if "pro" in clean_model.lower() or "gpt-4" in clean_model.lower() or "sonnet" in clean_model.lower():
                    clean_model = "gemini-2.5-pro"
                else:
                    clean_model = "gemini-2.5-flash"
        elif provider == AIProvider.DEEPSEEK:
            # Consistently map to deepseek-chat (the only chat model DeepSeek serves)
            clean_model = "deepseek-chat"
        elif provider == AIProvider.OPENAI:
            if not (clean_model.startswith("gpt-") or clean_model.startswith("o1-") or clean_model.startswith("o3-")):
                if "pro" in clean_model.lower() or "gpt-4" in clean_model.lower() or "sonnet" in clean_model.lower():
                    clean_model = "gpt-4.1"
                else:
                    clean_model = "gpt-4.1-mini"
            else:
                if clean_model == "gpt-4o":
                    clean_model = "gpt-4.1"
                elif clean_model == "gpt-4o-mini":
                    clean_model = "gpt-4.1-mini"

        params = {
            "model": clean_model,
            "messages": formatted_messages,
            "temperature": temperature if temperature is not None else settings.TEMPERATURE,
            "max_tokens": max_tokens or settings.MAX_TOKENS,
            **kwargs
        }
        
        # FIX: Ensure 'json' is in messages for json_object format
        # FIX: Ensure 'json' is in messages for json_object format
        if response_format and response_format.get("type") == "json_object":
            # Some free models or non-GPT models fail with explicit response_format
            # We keep it for primary models but might need to drop for others
            if model and ":free" in model:
                logger.debug(f"Removing explicit response_format for free model: {model}")
            else:
                params["response_format"] = response_format
                
            # Check if json is in system_prompt or any message
            combined_content = (system_prompt or "").lower()
            for msg in messages:
                combined_content += " " + msg.get("content", "").lower()
            
            if "json" not in combined_content:
                json_instruction = "\n\nIMPORTANT: Return the response in valid JSON format only."
                if system_prompt:
                    system_prompt += json_instruction
                    params["messages"][0]["content"] = system_prompt
                else:
                    params["messages"].insert(0, {"role": "system", "content": "Return ONLY valid JSON."})
            
        # Add native OpenRouter model fallbacks from centralized registry only if using OpenRouter
        if provider == AIProvider.OPENAI and "openrouter.ai" in str(getattr(client, "base_url", "")) and "extra_body" not in params:
            registry_fallbacks = FALLBACK_MODELS.get("default", [])
            fallbacks_to_use = [m for m in registry_fallbacks if m != params["model"]][:2]
            if fallbacks_to_use:
                params["extra_body"] = {"models": fallbacks_to_use}


        
        response = await client.chat.completions.create(**params)
        
        if not response or not hasattr(response, 'choices') or not response.choices:
            logger.warning(f"AI response for {model} has no choices: {response}")
            return {
                "content": "{}" if response_format and response_format.get("type") == "json_object" else "",
                "model": getattr(response, 'model', model or "unknown"),
                "usage": {},
            }

        first_choice = response.choices[0]
        content = ""
        if hasattr(first_choice, 'message') and first_choice.message:
            content = first_choice.message.content or ""
            
        if not content and response_format and response_format.get("type") == "json_object":
            content = "{}"
            
        usage_data = {}
        if hasattr(response, 'usage') and response.usage:
            try:
                usage_data = response.usage.dict() if hasattr(response.usage, 'dict') else {}
                if not usage_data and hasattr(response.usage, 'model_dump'):
                    usage_data = response.usage.model_dump()
            except Exception as usage_err:
                logger.debug(f"Failed to dump usage data: {usage_err}")

        # Try to extract reasoning tokens (OpenAI and OpenRouter formats)
        reasoning_tokens = 0
        if hasattr(response, 'usage') and response.usage:
            # OpenAI style
            details = getattr(response.usage, 'completion_tokens_details', None)
            if details:
                reasoning_tokens = getattr(details, 'reasoning_tokens', 0)
            
            # OpenRouter / Other styles might put it directly in usage or as extra
            if not reasoning_tokens:
                reasoning_tokens = usage_data.get('reasoning_tokens', 0)
        
        if reasoning_tokens:
            logger.info(f"Model {model} used {reasoning_tokens} reasoning tokens")
            usage_data['reasoning_tokens'] = reasoning_tokens

        return {
            "content": content,
            "model": getattr(response, 'model', model or "unknown"),
            "usage": usage_data,
        }


    # ------------------------------------------------------------------
    # Task-aware routing (NEW — preferred for new code)
    # ------------------------------------------------------------------
    async def routed_completion(
        self,
        task: str,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        response_format: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Route a completion through the AIRouter's task-based fallback chain.

        This method uses the MODEL_REGISTRY to select the right model for
        each task and falls back through the chain if the primary model
        fails.  Use this instead of `chat_completion()` when you know the
        task category.

        Returns the same dict shape as `chat_completion()` for compatibility.
        """
        from app.core.ai_router import ai_router

        # Build messages list with system prompt
        formatted_messages = []
        if system_prompt:
            formatted_messages.append({"role": "system", "content": system_prompt})
        formatted_messages.extend(messages)

        # Ensure JSON instruction is present when requested
        if response_format and response_format.get("type") == "json_object":
            combined = " ".join(m.get("content", "") for m in formatted_messages).lower()
            if "json" not in combined:
                if formatted_messages and formatted_messages[0]["role"] == "system":
                    formatted_messages[0]["content"] += "\n\nIMPORTANT: Return the response in valid JSON format only."
                else:
                    formatted_messages.insert(0, {"role": "system", "content": "Return ONLY valid JSON."})

        content = await ai_router.run(
            task=task,
            messages=formatted_messages,
            temperature=temperature,
            max_tokens=max_tokens,
            response_format=response_format,
        )

        # Post-process JSON if requested
        if response_format and response_format.get("type") == "json_object":
            content = self._extract_json(content)

        model_used = getattr(content, "model_used", f"router:{task}")
        provider_used = getattr(content, "provider", "unknown")

        return {
            "content": content,
            "model": model_used,
            "model_used": model_used,
            "provider": provider_used,
            "usage": {},
        }


# Global AI client instance
_ai_client: Optional[AIClient] = None


def get_ai_client() -> AIClient:
    """Get or create the global AI client instance."""
    global _ai_client
    if _ai_client is None:
        _ai_client = AIClient()
    return _ai_client


# ============================================================================
# NEW APPLICATION GENERATION GUARDRAILS 
# ============================================================================

SYSTEM_PROMPT = """You are BASE44 - an elite AI full-stack application builder.

CRITICAL CONSTRAINT:
You are NOT generating the BASE44 platform itself.
You are NOT generating a landing page.
You are NOT generating a dashboard for app management.
You are ONLY generating the application that the USER REQUESTED.

STRICT RULES:
1. Read the user's request carefully
2. Generate ONLY what the user asked for
3. Do NOT generate your platform's UI
4. Do NOT generate landing pages unless explicitly requested
5. Do NOT generate dashboards unless explicitly requested
6. Do NOT generate authentication pages unless explicitly requested
7. Generate the EXACT application the user described

GENERATION MANDATE:
- Generate a COMPLETE, PRODUCTION-READY application
- The application is EXACTLY what the user requested
- Nothing more, nothing less
- No platform UI, no landing pages, no extra features

TECHNOLOGY STACK:
- Frontend: React 19, TypeScript, Tailwind CSS 4, Shadcn UI
- Backend: Node.js, Express, tRPC, TypeScript
- Database: PostgreSQL with Supabase
- Authentication: OAuth2 with JWT (if needed)
- Deployment: Docker, GitHub Actions, Vercel

GENERATION PHASES:

Phase 1: UNDERSTAND THE REQUEST
- Read the user's description
- Identify the core features
- Identify the data model
- Identify the user flows
- DO NOT add extra features
- DO NOT add your platform's features

Phase 2: DATABASE SCHEMA
- Create PostgreSQL schema for the requested app
- Use proper relationships and constraints
- Add indexes for performance
- Include Row Level Security if multi-tenant
- DO NOT create tables for your platform

Phase 3: BACKEND API
- Generate tRPC procedures for all features
- Include proper error handling
- Include input validation
- Include authentication/authorization if needed
- DO NOT generate platform management APIs

Phase 4: FRONTEND COMPONENTS
- Generate React components for the requested app
- Use Shadcn UI components
- Use Tailwind CSS for styling
- Include proper TypeScript types
- DO NOT generate platform UI components

Phase 5: CONFIGURATION
- Generate environment variables
- Generate Docker configuration
- Generate deployment configuration
- DO NOT generate platform configuration

Phase 6: DOCUMENTATION
- Generate API documentation
- Generate setup guide
- Generate deployment guide
- DO NOT generate platform documentation

CODE GENERATION STANDARDS:
- Use strict TypeScript (no implicit any)
- Use async/await for all async operations
- Include comprehensive error handling
- Include input validation for all endpoints
- Include JSDoc comments for all functions
- Use design patterns (Factory, Strategy, etc.)
- Optimize for performance (caching, indexing)
- Include security best practices
- Include unit tests for critical functions
- Use proper logging throughout

SECURITY REQUIREMENTS:
- Validate all user inputs
- Sanitize all data
- Use parameterized queries
- Implement rate limiting
- Use HTTPS/TLS
- Store passwords securely
- Implement CSRF protection
- Use secure headers
- Implement proper authentication
- Implement proper authorization

PERFORMANCE REQUIREMENTS:
- Use database indexes
- Implement caching strategies
- Use pagination for large datasets
- Optimize queries
- Use CDN for static assets
- Implement lazy loading
- Use compression
- Optimize bundle size

COMPLETENESS REQUIREMENTS:
- Generate ALL necessary files
- Generate ALL necessary endpoints
- Generate ALL necessary components
- Generate ALL necessary types
- Generate ALL necessary configuration
- Include error handling for all cases
- Include loading states
- Include empty states
- Include success/failure messages
- Include proper logging

OUTPUT FORMAT:
Generate code in this exact format:

{
  "status": "success",
  "app_name": "User's Requested App Name",
  "description": "What the app does",
  "total_files": number,
  "files": [
    {
      "path": "path/to/file.ts",
      "language": "typescript",
      "content": "full file content here",
      "description": "what this file does"
    }
  ],
  "metadata": {
    "database_tables": ["table1", "table2"],
    "api_endpoints": ["GET /api/endpoint", "POST /api/endpoint"],
    "components": ["Component1", "Component2"],
    "features": ["feature1", "feature2"],
    "deployment": "docker + vercel",
    "setup_time": "5 minutes",
    "notes": "any important notes"
  }
}

VALIDATION CHECKLIST:
Before generating, verify:
- [ ] Is this the user's requested app? YES
- [ ] Is this your platform's UI? NO
- [ ] Is this a landing page? NO (unless requested)
- [ ] Is this a dashboard? NO (unless requested)
- [ ] Does it match the user's description? YES
- [ ] Is it production-ready? YES
- [ ] Does it have error handling? YES
- [ ] Does it have tests? YES
- [ ] Does it have documentation? YES
- [ ] Is it complete? YES

GUARDRAILS:
1. If the request is unclear, ask for clarification
2. If the request is too vague, ask for more details
3. If the request is for your platform, REFUSE and explain
4. If the request is for a landing page, ask if that's really what they want
5. If the request is incomplete, ask for missing details

FINAL INSTRUCTION:
Generate the application the user requested.
Nothing more.
Nothing less.
Make it production-ready.
Make it complete.
Make it secure.
Make it performant.
Make it maintainable."""


async def generate_application(user_prompt: str, provider: str = "openai"):
    """
    Generate a complete application based on user prompt
    
    Args:
        user_prompt: The user's application request
        provider: LLM provider (openai, claude, gemini)
    
    Returns:
        Generated application code and metadata
    """
    
    # Validate input
    if not user_prompt or len(user_prompt.strip()) < 10:
        raise ValueError("Please provide a detailed application description")
    
    # Create client (Adapted to use our robust unified AIClient)
    client = get_ai_client()
    
    # Create the message
    messages = [
        {
            "role": "user",
            "content": f"Generate a complete, production-ready application based on this request:\n\n{user_prompt}\n\nRemember:\n1. Generate ONLY this application\n2. Do NOT generate your platform's UI\n3. Do NOT generate landing pages unless requested\n4. Generate the EXACT application described above\n5. Make it production-ready\n6. Include all necessary files, components, and configuration\n\nStart generating now:"
        }
    ]
    
    # Call LLM via our unified client 
    response = await client.chat_completion(
        messages=messages,
        system_prompt=SYSTEM_PROMPT,
        temperature=0.7,
        max_tokens=settings.MAX_TOKENS,
        response_format={"type": "json_object"}
    )
    
    # Parse response
    if not response or not isinstance(response, dict):
        logger.error(f"Generate application: AI returned invalid response type: {type(response)}")
        raise ValueError("AI failed to generate application response")

    content = response.get("content")
    if not content:
        logger.error("Generate application: AI response has no content")
        raise ValueError("AI returned empty application content")
    
    # If the unified client didn't parse it already, do it here
    if isinstance(content, str):
        # Strip markdown code blocks before loading to prevent JSONDecodeError
        clean_content = content.replace("```json", "").replace("```", "").strip()
        try:
            result = json.loads(clean_content)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI JSON response: {e}\\nContent snippet: {content[:200]}...")
            raise ValueError("AI returned invalid JSON format")
    else:
        result = content
        
    # Validate result
    if not _is_valid_app_generation(result, user_prompt):
        raise ValueError("Generated content does not match user request")
    
    return result


def _is_valid_app_generation(result: dict, user_prompt: str) -> bool:
    """
    Validate that the generated app matches the user's request
    and is not your platform's UI
    """
    
    # Check status
    if result.get("status") != "success" and result.get("status") != "completed":
        return False
    
    # Check that it has files
    if not result.get("files") or len(result["files"]) == 0:
        return False
    
    # Check that it's not your platform
    app_name = result.get("app_name", "").lower()
    description = result.get("description", "").lower()
    
    # Forbidden patterns (your platform UI)
    forbidden_patterns = [
        "base44",
        "app builder",
        "mvp builder",
        "bytecode editor",
        "project dashboard",
        "app management",
        "your platform"
    ]
    
    for pattern in forbidden_patterns:
        if pattern in app_name or pattern in description:
            return False
    
    # Check that files are reasonable
    file_paths = [f.get("path", "").lower() for f in result.get("files", [])]
    
    # Should have reasonable file structure
    has_frontend = any("client" in p or "src" in p or "components" in p for p in file_paths)
    has_backend = any("server" in p or "api" in p or "routes" in p for p in file_paths)
    has_config = any("config" in p or "env" in p or "docker" in p for p in file_paths)
    
    # Should have at least some of these
    if not (has_frontend or has_backend or has_config):
        return False
    
    return True
