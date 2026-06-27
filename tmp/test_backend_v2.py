import requests
import json
import time

def test_backend():
    base_url = "http://127.0.0.1:8000"
    
    # 1. Health check
    try:
        print(f"Testing {base_url}/api/v1/health...")
        res = requests.get(f"{base_url}/api/v1/health", timeout=5)
        print(f"Health status: {res.status_code}, {res.json()}")
    except Exception as e:
        print(f"Health check failed: {e}")

    # 2. Research API with longer timeout
    url = f"{base_url}/api/research"
    payload = {
        "idea": "Small-scale hydro-power generator for rural communities",
        "mode": "basic"
    }
    
    print(f"Testing {url} with payload: {payload} (timeout=30s)")
    try:
        response = requests.post(url, json=payload, timeout=30)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("Success!")
            # print(json.dumps(response.json(), indent=2))
        else:
            print(f"Failed: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_backend()
