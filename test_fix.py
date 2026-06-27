import asyncio
import httpx

async def test_endpoint():
    url = "http://localhost:8000/api/v1/ideas/generate"
    payload = {"mode": "discover"}
    
    # We use a short timeout and expect a timeout if it actually tries to do AI, 
    # but we want to make sure it doesn't return 500 IMMEDIATELY like before.
    print(f"Testing {url}...")
    async with httpx.AsyncClient() as client:
        try:
            # We use a short timeout of 10s. If it's a 500, it usually happens fast.
            # If it times out, it means it passed the billing check and is waiting for AI.
            response = await client.post(url, json=payload, timeout=10.0)
            print(f"Status: {response.status_code}")
            print(f"Body: {response.text}")
        except httpx.ReadTimeout:
            print("Request timed out (this is GOOD, it means it didn't 500 immediately and is likely waiting for AI)")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_endpoint())
