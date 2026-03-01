"""
Advanced AI Client with multi-provider support and fallback capabilities.
Supports OpenAI, Anthropic Claude, and Google Gemini.
"""
import logging
import json
import warnings
warnings.filterwarnings("ignore", category=FutureWarning, module="google.generativeai")
from typing import Optional, Dict, Any, List
from enum import Enum

from app.core.config import settings

logger = logging.getLogger(__name__)


class AIProvider(str, Enum):
    """Supported AI providers."""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GEMINI = "gemini"
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
        # OpenAI client
        if self._is_valid_key(settings.OPENAI_API_KEY):
            try:
                from openai import AsyncOpenAI
                self.clients[AIProvider.OPENAI] = AsyncOpenAI(
                    api_key=settings.OPENAI_API_KEY,
                    base_url=settings.OPENAI_BASE_URL
                )
                logger.info("OpenAI client initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI client: {e}")
        
        # Anthropic client
        if self._is_valid_key(settings.ANTHROPIC_API_KEY):
            try:
                import anthropic
                self.clients[AIProvider.ANTHROPIC] = anthropic.AsyncAnthropic(
                    api_key=settings.ANTHROPIC_API_KEY
                )
                logger.info("Anthropic client initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize Anthropic client: {e}")
        
        # Google Gemini client
        if self._is_valid_key(settings.GOOGLE_API_KEY):
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.GOOGLE_API_KEY)
                self.clients[AIProvider.GEMINI] = genai.GenerativeModel(settings.GEMINI_MODEL)
                logger.info("Gemini client initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini client: {e}")
        
        # DeepSeek client (using OpenAI-compatible SDK)
        if self._is_valid_key(settings.DEEPSEEK_API_KEY):
            try:
                from openai import AsyncOpenAI
                self.clients[AIProvider.DEEPSEEK] = AsyncOpenAI(
                    api_key=settings.DEEPSEEK_API_KEY,
                    base_url=settings.DEEPSEEK_BASE_URL
                )
                logger.info("DeepSeek client initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize DeepSeek client: {e}")
        
        if not self.clients:
            logger.warning("No AI clients initialized. Please configure at least one VALID API key.")

    def _is_valid_key(self, key: Optional[str]) -> bool:
        """Check if an API key is valid and not a placeholder."""
        if not key:
            return False
        key = key.strip()
        if not key:
            return False
        # Check for common placeholders
        if key.startswith("your_") or "api_key" in key.lower() or key.startswith("sk-proj-...") or len(key) < 10:
            return False
        return True
    
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
        Get chat completion from AI provider with automatic fallback.
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            system_prompt: Optional system prompt
            model: Optional model override
            temperature: Optional temperature override
            max_tokens: Optional max tokens override
            response_format: Optional response format (e.g., {"type": "json_object"})
            **kwargs: Additional provider-specific parameters
            
        Returns:
            Dict with 'content', 'model', 'provider', and metadata
            
        Raises:
            Exception: If all providers fail and fallback is disabled
        """
        if not settings.ENABLE_FALLBACK:
            providers_to_try = [self.provider]
        else:
            # Ensure primary provider is tried first
            fallback_list = settings.FALLBACK_PROVIDERS_LIST
            if self.provider in fallback_list:
                # Reorder so provider is first
                providers_to_try = [self.provider] + [p for p in fallback_list if p != self.provider]
            else:
                providers_to_try = [self.provider] + fallback_list
        
        logger.info(f"AI Selection: primary={self.provider}, providers_to_try={providers_to_try}")
        
        last_error = None
        
        
        for provider_name in providers_to_try:
            provider = AIProvider(provider_name)
            
            if provider not in self.clients:
                logger.warning(f"Provider {provider_name} not available, skipping...")
                continue
            
            # Filter out internal kwargs from being passed to SDKs
            filtered_kwargs = {k: v for k, v in kwargs.items() if k not in ["provider"]}

            try:
                if provider == AIProvider.OPENAI:
                    result = await self._openai_completion(
                        messages, system_prompt, model, temperature, max_tokens, response_format, **filtered_kwargs
                    )
                elif provider == AIProvider.ANTHROPIC:
                    result = await self._anthropic_completion(
                        messages, system_prompt, model, temperature, max_tokens, response_format, **filtered_kwargs
                    )
                elif provider == AIProvider.GEMINI:
                    result = await self._gemini_completion(
                        messages, system_prompt, model, temperature, max_tokens, response_format, **filtered_kwargs
                    )
                elif provider == AIProvider.DEEPSEEK:
                    result = await self._deepseek_completion(
                        messages, system_prompt, model, temperature, max_tokens, response_format, **filtered_kwargs
                    )
                else:
                    continue
                
                # Extract JSON if requested
                if response_format and response_format.get("type") == "json_object":
                    result["content"] = self._extract_json(result["content"])

                result['provider'] = provider_name
                logger.info(f"Successfully got response from {provider_name}")
                return result
                
            except Exception as e:
                last_error = e
                logger.warning(f"Provider {provider_name} failed: {e}")
                # Don't disable fallback check here, assuming user wants fallback if enable_fallback is True
                if not settings.ENABLE_FALLBACK:
                     raise e
                continue
        
        # All providers failed
        error_msg = f"All AI providers failed. Last exception: {str(last_error) if last_error else 'No active providers available'}"
        logger.error(error_msg)
        raise Exception(error_msg)
    
    def _extract_json(self, text: str) -> str:
        """Extract JSON from text which might contain markdown or conversational filler."""
        import re
        if not text:
            return text
            
        # 1. Try to find JSON block with markers
        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
        if json_match:
            return json_match.group(1)
        
        # 2. Try to find the first { and the last }
        # We use a greedy match for the outer-most braces to capture the largest possible JSON object
        try:
            # Find all matching brackets and find the widest pair
            start_index = text.find('{')
            end_index = text.rfind('}')
            
            if start_index != -1 and end_index != -1 and end_index > start_index:
                candidate = text[start_index:end_index+1]
                # Validate it's actually JSON before returning
                try:
                    import json
                    json.loads(candidate)
                    return candidate
                except:
                    # If widest pair isn't valid, try finding markers again or just return raw
                    pass
        except Exception as e:
            logger.debug(f"Regex/Index parsing failed for JSON extraction: {e}")
            
        return text
    
    async def _openai_completion(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str],
        model: Optional[str],
        temperature: Optional[float],
        max_tokens: Optional[int],
        response_format: Optional[Dict[str, Any]],
        **kwargs
    ) -> Dict[str, Any]:
        """Get completion from OpenAI."""
        client = self.clients[AIProvider.OPENAI]
        
        # Prepare messages
        formatted_messages = []
        if system_prompt:
            formatted_messages.append({"role": "system", "content": system_prompt})
        formatted_messages.extend(messages)
        
        # Prepare parameters
        params = {
            "model": model or settings.OPENAI_MODEL,
            "messages": formatted_messages,
            "temperature": temperature if temperature is not None else settings.TEMPERATURE,
            "max_tokens": max_tokens or settings.MAX_TOKENS,
            **kwargs
        }
        
        if response_format:
            params["response_format"] = response_format
        
        response = await client.chat.completions.create(**params)
        
        return {
            "content": response.choices[0].message.content,
            "model": response.model,
            "usage": {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens,
            } if response.usage else None,
        }
    
    async def _anthropic_completion(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str],
        model: Optional[str],
        temperature: Optional[float],
        max_tokens: Optional[int],
        response_format: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Get completion from Anthropic Claude."""
        client = self.clients[AIProvider.ANTHROPIC]
        
        # Anthropic uses different message format
        formatted_messages = []
        for msg in messages:
            if msg["role"] == "user":
                formatted_messages.append({"role": "user", "content": msg["content"]})
            elif msg["role"] == "assistant":
                formatted_messages.append({"role": "assistant", "content": msg["content"]})
        
        params = {
            "model": model or settings.ANTHROPIC_MODEL,
            "messages": formatted_messages,
            "temperature": temperature if temperature is not None else settings.TEMPERATURE,
            "max_tokens": max_tokens or settings.MAX_TOKENS,
            **kwargs
        }
        
        if system_prompt:
            params["system"] = system_prompt
        
        response = await client.messages.create(**params)
        
        content_text = ""
        if response.content:
            for content_block in response.content:
                if hasattr(content_block, 'text'):
                    content_text += content_block.text
                elif isinstance(content_block, str):
                    content_text += content_block
        
        return {
            "content": content_text,
            "model": response.model,
            "usage": {
                "input_tokens": response.usage.input_tokens,
                "output_tokens": response.usage.output_tokens,
            } if hasattr(response, 'usage') else None,
        }
    
    async def _gemini_completion(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str],
        model: Optional[str],
        temperature: Optional[float],
        max_tokens: Optional[int],
        response_format: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Get completion from Google Gemini."""
        # Gemini handles messages differently
        # Map OpenAI model names to Gemini if they are passed in error
        if model and (model.startswith("gpt-") or model.startswith("claude-")):
            logger.info(f"Mapping model {model} to Gemini default: {settings.GEMINI_MODEL}")
            model_name = settings.GEMINI_MODEL
        else:
            model_name = model or settings.GEMINI_MODEL
        
        import google.generativeai as genai
        
        # Prepare safety settings to avoid overly sensitive blocks for market research
        safety_settings = [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
        ]

        # Use system instruction if provided
        gemini_model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=system_prompt if system_prompt else None,
            safety_settings=safety_settings
        )
        
        # Build conversation (without system prompt in the user part)
        # Get the last user message
        user_message = None
        for msg in reversed(messages):
            if msg["role"] == "user":
                user_message = msg["content"]
                break
        
        if not user_message:
            user_message = messages[-1]["content"] if messages else ""
        
        full_prompt = user_message
        
        config = {
            "temperature": temperature if temperature is not None else settings.TEMPERATURE,
            "max_output_tokens": max_tokens or settings.MAX_TOKENS,
        }
        
        # Handle response format for Gemini
        if response_format and response_format.get("type") == "json_object":
            config["response_mime_type"] = "application/json"
            full_prompt += "\n\nIMPORTANT: Return ONLY a valid JSON object. No other text."
            
        # Add other kwargs (filter out internal ones)
        allowed_config_fields = {
            "temperature", "max_output_tokens", "top_p", "top_k", 
            "candidate_count", "stop_sequences", "response_mime_type"
        }
        for k, v in kwargs.items():
            if k in allowed_config_fields and k not in config:
                config[k] = v
        
        logger.info(f"Gemini prompt: {full_prompt[:100]}...")
        logger.info(f"Gemini config: {config}")
        if system_prompt:
            logger.info(f"Gemini system instruction: {system_prompt[:100]}...")
            
        import asyncio
        # Use synchronous generate_content in a thread with timeout
        def _sync_call():
            try:
                resp = gemini_model.generate_content(full_prompt, generation_config=config)
                # Check for safety blocks or empty candidates
                if not resp.candidates or not resp.candidates[0].content.parts:
                    logger.warning(f"Gemini returned empty response. Safety reasons: {resp.prompt_feedback}")
                    return "{ \"ideas\": [] }"
                return resp.text
            except Exception as e:
                logger.error(f"Gemini generate_content failed: {e}")
                raise e
        
        try:
             # Add 60s timeout to prevent hanging forever
             content = await asyncio.wait_for(asyncio.to_thread(_sync_call), timeout=60.0)
        except asyncio.TimeoutError:
             logger.error("Gemini request timed out after 60s")
             raise Exception("Gemini request timed out")
        
        # Extract JSON if requested
        if response_format and response_format.get("type") == "json_object":
            content = self._extract_json(content)
            
        return {
            "content": content,
            "model": model_name,
            "usage": None,
        }
    
    async def _deepseek_completion(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str],
        model: Optional[str],
        temperature: Optional[float],
        max_tokens: Optional[int],
        response_format: Optional[Dict[str, Any]],
        **kwargs
    ) -> Dict[str, Any]:
        """Get completion from DeepSeek (OpenAI-compatible)."""
        client = self.clients[AIProvider.DEEPSEEK]
        
        # Prepare messages
        formatted_messages = []
        if system_prompt:
            formatted_messages.append({"role": "system", "content": system_prompt})
        formatted_messages.extend(messages)
        
        # Prepare parameters
        params = {
            "model": model or settings.DEEPSEEK_MODEL,
            "messages": formatted_messages,
            "temperature": temperature if temperature is not None else settings.TEMPERATURE,
            "max_tokens": max_tokens or settings.MAX_TOKENS,
            **kwargs
        }
        
        if response_format:
            params["response_format"] = response_format
        
        response = await client.chat.completions.create(**params)
        
        return {
            "content": response.choices[0].message.content,
            "model": response.model,
            "usage": {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens,
            } if hasattr(response, 'usage') and response.usage else None,
        }


# Global AI client instance
_ai_client: Optional[AIClient] = None


def get_ai_client() -> AIClient:
    """Get or create the global AI client instance."""
    global _ai_client
    if _ai_client is None:
        _ai_client = AIClient()
    return _ai_client

