from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # AI Provider
    AI_PROVIDER: str = "openai"
    ENABLE_FALLBACK: bool = True
    ENABLE_AI_MOCK: bool = True
    FALLBACK_PROVIDERS_LIST: list[str] = ["openai", "google", "anthropic", "deepseek"]

    # OpenAI
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4.1"
    OPENAI_MINI_MODEL: str = "gpt-4.1-mini"
    # Backwards compatibility for MODEL_NAME
    MODEL_NAME: str = "gpt-4.1-mini"
    OPENAI_BASE_URL: Optional[str] = None

    # Anthropic
    ANTHROPIC_API_KEY: Optional[str] = None
    ANTHROPIC_MODEL: str = "claude-sonnet-4-20250514"

    # Google Gemini
    GOOGLE_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-pro"
    GEMINI_FLASH_MODEL: str = "gemini-2.5-flash"

    # Deepseek
    DEEPSEEK_API_KEY: Optional[str] = None
    DEEPSEEK_MODEL: str = "deepseek-chat"
    DEEPSEEK_BASE_URL: str = "https://api.deepseek.com"

    # Advanced
    TEMPERATURE: float = 0.7
    MAX_TOKENS: int = 4096
    TOP_P: float = 1.0

    # External APIs
    SERPAPI_API_KEY: Optional[str] = None
    BRIGHT_DATA_API_KEY: Optional[str] = None
    SCRAPERAPI_API_KEY: Optional[str] = None
    APIFY_API_TOKEN: Optional[str] = None
    DIFFBOT_TOKEN: Optional[str] = None
    VISUALPING_API_KEY: Optional[str] = None
    TESTSPRITE_API_KEY: Optional[str] = None
    E2B_API_KEY: Optional[str] = None
    BASE44_API_KEY: Optional[str] = None
    
    # Reddit
    REDDIT_CLIENT_ID: Optional[str] = None
    REDDIT_CLIENT_SECRET: Optional[str] = None
    REDDIT_USER_AGENT: str = "Smartbuilder/1.0"
    
    # RSS Feeds
    PRODUCT_HUNT_RSS_URL: str = "https://www.producthunt.com/feed"
    INDIE_HACKERS_RSS_URL: str = "https://www.indiehackers.com/feed"

    # Supabase
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    
    # Paystack (Billing & Payments)
    PAYSTACK_SECRET_KEY: Optional[str] = None
    PAYSTACK_PUBLIC_KEY: Optional[str] = None
    
    @property
    def has_ai_key(self) -> bool:
        return any([
            self.OPENAI_API_KEY, 
            self.ANTHROPIC_API_KEY, 
            self.GOOGLE_API_KEY,
            self.GEMINI_API_KEY,
            self.DEEPSEEK_API_KEY,
            self.TESTSPRITE_API_KEY
        ])

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()