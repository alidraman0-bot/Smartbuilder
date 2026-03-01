import sys
import os
import asyncio

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app
from app.models.market_signal import MarketSignal, IdeaFromSignalRequest

client = TestClient(app)

def test_market_signals_api():
    print("Testing GET /api/market-signals...")
    # we don't need auth here because the TestClient hits it, wait, is there an auth dependency on /api/market-signals?
    # Let's check: the router doesn't have Dependencies! Wait, did I add `Depends(get_current_user)`?
    # No: `@router.get("/market-signals", response_model=List[MarketSignal])`
    
    response = client.get("/api/market-signals")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Retrieved {len(data)} signals")
        if data:
            print(f"Top signal: {data[0]['title']}")
            
            # Now let's test generate-from-signal
            signal_payload = {
                "source": data[0]['source'],
                "title": data[0]['title'],
                "description": data[0].get('description', '')
            }
            
            print("\nTesting POST /api/generate-from-signal...")
            gen_resp = client.post("/api/generate-from-signal", json=signal_payload)
            print(f"Status: {gen_resp.status_code}")
            if gen_resp.status_code == 200:
                print("Idea Generated Successfully:")
                print(gen_resp.json())
            else:
                print(f"Error: {gen_resp.text}")
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    test_market_signals_api()
