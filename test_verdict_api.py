import asyncio
import httpx
import json

async def test_verdict_api():
    url = "http://127.0.0.1:8000/api/v1/verdict"
    payload = {
        "opportunity_score": 8.5,
        "trend_growth": 45.2,
        "competitor_count": 3,
        "funding_activity": "Rising",
        "market_size": "$10B TAM",
        "idea": "A platform for autonomous startup building using AI agents."
    }
    
    print(f"Testing Verdict API at {url}...")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=30.0)
            
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("SUCCESS! Verdict generated:")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_verdict_api())
