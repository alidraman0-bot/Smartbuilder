import asyncio
import logging
from app.core.ai_client import get_ai_client, AIProvider

logging.basicConfig(level=logging.INFO)

async def test_gemini():
    client = get_ai_client()
    print(f"Provider: {client.provider}")
    print(f"Available clients: {list(client.clients.keys())}")
    
    try:
        print("Testing Gemini completion...")
        response = await client.chat_completion(
            messages=[{"role": "user", "content": "Say hello"}],
            provider="gemini"
        )
        print(f"Success! Content: {response['content']}")
    except Exception as e:
        print(f"Gemini failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_gemini())
