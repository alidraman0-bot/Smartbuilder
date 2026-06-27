import asyncio
import httpx
import logging
from app.core.ai_client import get_ai_client
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("test_native_ai")

async def test_completions_api():
    print("\n=== Testing Backend Completions API Proxy ===")
    url = "http://127.0.0.1:8000/api/v1/chat/completions"
    
    payload = {
        "model": "openai/gpt-4o-mini",
        "messages": [
            {"role": "user", "content": "Return the word 'SUCCESS' in all caps."}
        ],
        "temperature": 0.5
    }
    
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, timeout=10.0)
            print(f"API HTTP Status: {resp.status_code}")
            if resp.status_code == 200:
                data = resp.json()
                print("API Response successful:")
                print(f"Content: {data['choices'][0]['message']['content'].strip()}")
            else:
                print(f"API Response failed: {resp.text}")
    except Exception as e:
        print(f"API Call Connection Error: {e} (Is the FastAPI server running?)")

async def test_fallback_routing():
    print("\n=== Testing AIClient Task-aware Fallback Routing ===")
    client = get_ai_client()
    
    # We will test using the default routing which uses fallback models
    print("Sending chat completion using primary + fallback routing...")
    try:
        response = await client.chat_completion(
            messages=[{"role": "user", "content": "Say hello in one word."}],
            model="openai/gpt-4o-mini"
        )
        print("Fallback Routing SUCCESS:")
        print(f"Provider: {response.get('provider')}")
        print(f"Model: {response.get('model')}")
        print(f"Content: {response.get('content')}")
    except Exception as e:
        print(f"Fallback Routing FAILED: {e}")

async def main():
    print("Starting Native AI integration verification...")
    print(f"Has AI Keys: {settings.has_ai_key}")
    await test_fallback_routing()
    # Note: completions API test requires backend server running on port 8000
    await test_completions_api()

if __name__ == "__main__":
    asyncio.run(main())
