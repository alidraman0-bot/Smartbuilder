from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # AI Provider
    AI_PROVIDER: str = "openai"
    ENABLE_FALLBACK: bool = True
    FALLBACK_PROVIDERS_LIST: list[str] = ["openai", "anthropic", "gemini"]

    # OpenAI
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o"
    # Backwards compatibility for MODEL_NAME
    MODEL_NAME: str = "gpt-4-turbo-preview"
    OPENAI_BASE_URL: Optional[str] = None

    # Anthropic
    ANTHROPIC_API_KEY: Optional[str] = None
    ANTHROPIC_MODEL: str = "claude-3-5-sonnet-20241022"

    # Google
    GOOGLE_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-1.5-pro"

    # Deepseek
    DEEPSEEK_API_KEY: Optional[str] = None
    DEEPSEEK_MODEL: str = "deepseek-coder"

    # Advanced
    TEMPERATURE: float = 0.7
    MAX_TOKENS: int = 4096
    TOP_P: float = 1.0

    # External APIs
    SERPAPI_API_KEY: Optional[str] = None
    TESTSPRITE_API_KEY: Optional[str] = None
    
    # Supabase
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    
    @property
    def has_ai_key(self) -> bool:
        return any([
            self.OPENAI_API_KEY, 
            self.ANTHROPIC_API_KEY, 
            self.GOOGLE_API_KEY,
            self.TESTSPRITE_API_KEY
        ])

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()