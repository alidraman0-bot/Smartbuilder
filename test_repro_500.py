
import httpx
import json

def test_repro():
    url = "http://127.0.0.1:8001/api/v1/ideas/discovery"
    # Use a valid project ID from the database to avoid FK errors
    payload = {"project_id": "e94f755d-063f-44da-9453-32a0e0b08503"} 
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    print(f"Calling {url}...")
    try:
        with httpx.Client(timeout=60.0) as client:
            response = client.post(url, json=payload, headers=headers)
            print(f"Status Code: {response.status_code}")
            try:
                data = response.json()
                print("Response JSON (first idea):")
                if data and isinstance(data, list):
                    print(json.dumps(data[0], indent=2))
                else:
                    print(json.dumps(data, indent=2))
            except:
                print(f"Response Text: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_repro()
