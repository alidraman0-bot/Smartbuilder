import requests
import json

def test_research_api():
    url = "http://127.0.0.1:8000/api/research"
    payload = {
        "idea": "AI-powered sustainable fashion marketplace",
        "mode": "basic"
    }
    
    print(f"Testing {url} with payload: {payload}")
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("Success!")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"Failed: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_research_api()
