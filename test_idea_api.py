import requests
import json
import time

def test_generate_api():
    url = "http://localhost:8000/api/v1/ideas/generate"
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "mode": "discover"
    }
    
    print(f"Sending POST request to {url}...")
    start_time = time.time()
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=60)
        end_time = time.time()
        print(f"Response status: {response.status_code}")
        print(f"Time taken: {end_time - start_time:.2f} seconds")
        
        if response.status_code == 200:
            print("Success! Response:")
            print(json.dumps(response.json(), indent=2))
        else:
            print("Failed! Response:")
            print(response.text)
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_generate_api()
