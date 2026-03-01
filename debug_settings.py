from app.core.config import settings
print(f"AI_PROVIDER: {settings.AI_PROVIDER}")
print(f"HAS_AI_KEY: {settings.has_ai_key}")
print(f"OPENAI_API_KEY: {'[SET]' if settings.OPENAI_API_KEY else '[MISSING]'}")
print(f"ANTHROPIC_API_KEY: {'[SET]' if settings.ANTHROPIC_API_KEY else '[MISSING]'}")
print(f"GOOGLE_API_KEY: {'[SET]' if settings.GOOGLE_API_KEY else '[MISSING]'}")
print(f"SERPAPI_API_KEY: {'[SET]' if settings.SERPAPI_API_KEY else '[MISSING]'}")
