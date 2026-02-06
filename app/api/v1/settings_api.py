"""
API endpoints for managing application settings and API keys.
"""
import os
import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Security
from pydantic import BaseModel, Field
from app.core.config import settings
from app.core.ai_client import get_ai_client

logger = logging.getLogger(__name__)

router = APIRouter()


class APIKeysConfig(BaseModel):
    """API Keys configuration model."""
    openai_api_key: Optional[str] = Field(None, description="OpenAI API key")
    anthropic_api_key: Optional[str] = Field(None, description="Anthropic Claude API key")
    google_api_key: Optional[str] = Field(None, description="Google Gemini API key")
    testsprite_api_key: Optional[str] = Field(None, description="TestSprite API key")
    ai_provider: Optional[str] = Field(None, description="Primary AI provider (openai, anthropic, gemini)")
    openai_model: Optional[str] = Field(None, description="OpenAI model name")
    anthropic_model: Optional[str] = Field(None, description="Anthropic model name")
    gemini_model: Optional[str] = Field(None, description="Gemini model name")
    temperature: Optional[float] = Field(None, ge=0.0, le=1.0, description="Temperature (0.0-1.0)")
    max_tokens: Optional[int] = Field(None, ge=1, description="Maximum tokens")
    enable_fallback: Optional[bool] = Field(None, description="Enable fallback providers")


class APIKeysStatus(BaseModel):
    """API Keys status response."""
    has_openai: bool
    has_anthropic: bool
    has_google: bool
    has_testsprite: bool
    has_any_key: bool
    ai_provider: str
    openai_model: str
    anthropic_model: str
    gemini_model: str
    temperature: float
    max_tokens: int
    enable_fallback: bool
    clients_initialized: list[str]


@router.get("/keys/status", response_model=APIKeysStatus)
async def get_api_keys_status():
    """
    Get the current status of API key configuration.
    Does not expose the actual keys for security.
    """
    try:
        client = get_ai_client()
        initialized_providers = [str(p.value) for p in client.clients.keys()]
        
        return APIKeysStatus(
            has_openai=bool(settings.OPENAI_API_KEY),
            has_anthropic=bool(settings.ANTHROPIC_API_KEY),
            has_google=bool(settings.GOOGLE_API_KEY),
            has_testsprite=bool(settings.TESTSPRITE_API_KEY),
            has_any_key=settings.has_ai_key,
            ai_provider=settings.AI_PROVIDER,
            openai_model=settings.OPENAI_MODEL,
            anthropic_model=settings.ANTHROPIC_MODEL,
            gemini_model=settings.GEMINI_MODEL,
            temperature=settings.TEMPERATURE,
            max_tokens=settings.MAX_TOKENS,
            enable_fallback=settings.ENABLE_FALLBACK,
            clients_initialized=initialized_providers
        )
    except Exception as e:
        logger.error(f"Error getting API keys status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/keys/update")
async def update_api_keys(config: APIKeysConfig):
    """
    Update API keys and configuration.
    Keys are saved to the .env file.
    """
    try:
        env_file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), ".env")
        
        # Read existing .env file if it exists
        env_vars = {}
        if os.path.exists(env_file_path):
            with open(env_file_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        env_vars[key.strip()] = value.strip()
        
        # Update with new values (only if provided)
        if config.openai_api_key is not None:
            env_vars['OPENAI_API_KEY'] = config.openai_api_key
        if config.anthropic_api_key is not None:
            env_vars['ANTHROPIC_API_KEY'] = config.anthropic_api_key
        if config.google_api_key is not None:
            env_vars['GOOGLE_API_KEY'] = config.google_api_key
        if config.testsprite_api_key is not None:
            env_vars['TESTSPRITE_API_KEY'] = config.testsprite_api_key
        if config.ai_provider is not None:
            env_vars['AI_PROVIDER'] = config.ai_provider
        if config.openai_model is not None:
            env_vars['OPENAI_MODEL'] = config.openai_model
        if config.anthropic_model is not None:
            env_vars['ANTHROPIC_MODEL'] = config.anthropic_model
        if config.gemini_model is not None:
            env_vars['GEMINI_MODEL'] = config.gemini_model
        if config.temperature is not None:
            env_vars['TEMPERATURE'] = str(config.temperature)
        if config.max_tokens is not None:
            env_vars['MAX_TOKENS'] = str(config.max_tokens)
        if config.enable_fallback is not None:
            env_vars['ENABLE_FALLBACK'] = str(config.enable_fallback).lower()
        
        # Write back to .env file
        with open(env_file_path, 'w', encoding='utf-8') as f:
            # Write header comment
            f.write("# Smartbuilder MVP - Environment Configuration\n")
            f.write("# Auto-generated - Do not edit manually\n\n")
            
            # Write AI Provider section
            f.write("# AI Provider Configuration\n")
            f.write(f"AI_PROVIDER={env_vars.get('AI_PROVIDER', 'openai')}\n")
            f.write(f"ENABLE_FALLBACK={env_vars.get('ENABLE_FALLBACK', 'true')}\n\n")
            
            # Write OpenAI section
            f.write("# OpenAI Configuration\n")
            f.write(f"OPENAI_API_KEY={env_vars.get('OPENAI_API_KEY', '')}\n")
            f.write(f"OPENAI_MODEL={env_vars.get('OPENAI_MODEL', 'gpt-4-turbo-preview')}\n\n")
            
            # Write Anthropic section
            f.write("# Anthropic Claude Configuration\n")
            f.write(f"ANTHROPIC_API_KEY={env_vars.get('ANTHROPIC_API_KEY', '')}\n")
            f.write(f"ANTHROPIC_MODEL={env_vars.get('ANTHROPIC_MODEL', 'claude-3-5-sonnet-20241022')}\n\n")
            
            # Write Google section
            f.write("# Google Gemini Configuration\n")
            f.write(f"GOOGLE_API_KEY={env_vars.get('GOOGLE_API_KEY', '')}\n")
            f.write(f"GEMINI_MODEL={env_vars.get('GEMINI_MODEL', 'gemini-1.5-pro')}\n\n")
            
            # Write TestSprite section
            f.write("# TestSprite Configuration\n")
            f.write(f"TESTSPRITE_API_KEY={env_vars.get('TESTSPRITE_API_KEY', '')}\n\n")
            
            # Write Advanced Settings
            f.write("# Advanced AI Settings\n")
            f.write(f"TEMPERATURE={env_vars.get('TEMPERATURE', '0.7')}\n")
            f.write(f"MAX_TOKENS={env_vars.get('MAX_TOKENS', '4096')}\n")
            f.write(f"TOP_P={env_vars.get('TOP_P', '1.0')}\n")
        
        # Reload environment variables (requires server restart for full effect)
        from dotenv import load_dotenv
        load_dotenv(env_file_path, override=True)
        
        # Note: To fully apply changes, we would need to update the Settings instance
        # For now, we'll require a server restart. In production, you might want to
        # use a configuration service or database to store keys dynamically.
        
        return {
            "message": "API keys updated successfully",
            "note": "Please restart the server for changes to take full effect"
        }
    except Exception as e:
        logger.error(f"Error updating API keys: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update API keys: {str(e)}")


class TestKeyRequest(BaseModel):
    provider: str = Field(..., description="AI provider (openai, anthropic, gemini)")
    api_key: str = Field(..., description="API key to test")


@router.post("/keys/test")
async def test_api_key(request: TestKeyRequest):
    """
    Test an API key without saving it.
    """
    try:
        provider = request.provider
        api_key = request.api_key
        
        if provider == "openai":
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=api_key)
            # Simple test call - list models
            try:
                await client.models.list()
                return {"valid": True, "message": "OpenAI API key is valid"}
            except Exception as e:
                return {"valid": False, "message": f"OpenAI API key validation failed: {str(e)}"}
        elif provider == "anthropic":
            # Verify key format for Anthropic
            if api_key.startswith("sk-ant-") and len(api_key) > 20:
                return {"valid": True, "message": "Anthropic API key format is valid"}
            return {"valid": False, "message": "Invalid Anthropic API key format (should start with sk-ant-)"}
        elif provider == "gemini":
            # Google Gemini keys are simple strings
            if len(api_key) > 10:
                return {"valid": True, "message": "Google API key format appears valid"}
            return {"valid": False, "message": "Invalid Google API key format"}
        else:
            raise HTTPException(status_code=400, detail=f"Unknown provider: {provider}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error testing API key: {e}")
        return {"valid": False, "message": f"Error: {str(e)}"}

