import os
import asyncio
import httpx
from dotenv import load_dotenv

load_dotenv()

async def main():
    api_key = os.getenv("GOOGLE_API_KEY")
    print(f"Using Google API Key: {api_key[:10]}...")
    
    url = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Try different model names
    models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro", "gemini-2.5-flash"]
    
    async with httpx.AsyncClient(verify=False) as client:
        for model in models:
            print(f"\n--- Testing model: {model} ---")
            payload = {
                "model": model,
                "messages": [{"role": "user", "content": "Say hello in one word."}]
            }
            try:
                resp = await client.post(url, json=payload, headers=headers, timeout=10.0)
                print(f"Status Code: {resp.status_code}")
                print(f"Response: {resp.text}")
            except Exception as e:
                print(f"Exception: {e}")

if __name__ == "__main__":
    asyncio.run(main())
