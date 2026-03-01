import os
import asyncio
import logging
from app.core.config import settings
from app.core.ai_client import AIClient, AIProvider

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_deepseek_initialization():
    logger.info("Testing DeepSeek initialization...")
    
    # Mock a valid-looking key for testing initialization
    # os.environ["DEEPSEEK_API_KEY"] = "sk-1234567890abcdef1234567890abcdef"
    
    # Reload settings and ai_client to pick up the env var
    from importlib import reload
    import app.core.config
    import app.core.ai_client
    reload(app.core.config)
    reload(app.core.ai_client)
    from app.core.config import settings
    from app.core.ai_client import AIClient, AIProvider
    
    logger.info(f"Current AI_PROVIDER: {settings.AI_PROVIDER}")
    logger.info(f"DEEPSEEK_API_KEY: {settings.DEEPSEEK_API_KEY}")
    
    client = AIClient()
    
    logger.info(f"Initialized providers: {list(client.clients.keys())}")
    
    if AIProvider.DEEPSEEK in client.clients:
        logger.info("✅ DeepSeek provider successfully initialized")
        
        # Test live completion
        try:
            logger.info("Testing live completion...")
            response = await client.chat_completion(
                messages=[{"role": "user", "content": "Say 'DeepSeek is ready'"}],
                max_tokens=20
            )
            logger.info(f"Response: {response['content']}")
            if "DeepSeek is ready" in response["content"]:
                logger.info("✅ Live completion successful!")
            else:
                logger.warning("⚠ Unexpected response content")
        except Exception as e:
            logger.error(f"❌ Live completion failed: {e}")
    else:
        logger.error("❌ DeepSeek provider NOT initialized")
        
    # Check fallback list
    logger.info(f"Fallback providers: {settings.FALLBACK_PROVIDERS_LIST}")
    if "deepseek" in settings.FALLBACK_PROVIDERS_LIST:
        logger.info("✅ DeepSeek present in fallback list")
    else:
        logger.error("❌ DeepSeek NOT present in fallback list")

if __name__ == "__main__":
    asyncio.run(test_deepseek_initialization())
