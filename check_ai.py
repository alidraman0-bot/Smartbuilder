
import asyncio
import logging
import json
from app.core.ai_client import get_ai_client
from app.core.config import settings

# Setup logging to see what AIClient is doing
logging.basicConfig(level=logging.INFO)

async def test_full_ai_client():
    print(f"--- AI Client Diagnostic ---")
    print(f"Primary Provider: {settings.AI_PROVIDER}")
    print(f"Enable Fallback: {settings.ENABLE_FALLBACK}")
    
    client = get_ai_client()
    print(f"Initialized providers: {list(client.clients.keys())}")
    
    test_messages = [{"role": "user", "content": "Return a JSON object with a single field 'test' set to 'success'."}]
    
    try:
        print("\nAttempting chat completion...")
        response = await client.chat_completion(
            messages=test_messages,
            response_format={"type": "json_object"}
        )
        print(f"Status: SUCCESS")
        print(f"Provider used: {response.get('provider')}")
        print(f"Model used: {response.get('model')}")
        print(f"Content: {response.get('content')}")
        
    except Exception as e:
        print(f"\nStatus: FAILED")
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_full_ai_client())
