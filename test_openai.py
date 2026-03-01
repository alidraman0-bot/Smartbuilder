import asyncio
import logging
from app.core.ai_client import get_ai_client

logging.basicConfig(level=logging.INFO)

async def test_openai():
    client = get_ai_client()
    print(f"Primary Provider: {client.provider}")
    
    try:
        print("Testing OpenAI completion...")
        response = await client.chat_completion(
            messages=[{"role": "user", "content": "Say hello"}],
            provider="openai"
        )
        print(f"Success! Content: {response['content']}")
    except Exception as e:
        print(f"OpenAI failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_openai())
