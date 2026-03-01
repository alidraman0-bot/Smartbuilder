import asyncio
import httpx
import json

async def trigger_generation():
    url = "http://localhost:8000/api/v1/builder/business-plan"
    data = {
        "idea": {
            "idea_id": "test-idea-123",
            "title": "Test AI App",
            "target_user": "Small Businesses",
            "market_category": "Automation"
        },
        "research": {
            "modules": [{"module": "Market", "summary": "Growth market"}],
            "confidence_score": 85
        },
        "run_id": "test-run-reproduction"
    }
    
    print(f"Triggering generation at {url}...")
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, json=data)
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    asyncio.run(trigger_generation())
