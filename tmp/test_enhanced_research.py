import requests
import json

URL = "http://127.0.0.1:8000/api/research"

def test_research(mode="basic"):
    print(f"Testing {URL} with {mode.upper()} mode...")
    payload = {
        "idea": "AI-powered coffee shop optimizer",
        "mode": mode
    }
    try:
        # Increase timeout to 120s for deep research
        response = requests.post(URL, json=payload, timeout=120)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            report = response.json()
            print("Successfully retrieved report. Schema check:")
            for key in report.keys():
                print(f"- {key}")
            
            # Basic validation of content
            if "market_sizing" in report:
                print(f"Market Sizing Check: TAM={report['market_sizing'][:50]}...")
            if "swot_analysis" in report:
                print(f"SWOT Keys: {list(report['swot_analysis'].keys())}")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_research("basic")
    print("-" * 20)
    test_research("deep")
