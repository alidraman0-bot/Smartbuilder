import requests
import json

def reproduce_500():
    url = "http://127.0.0.1:8000/api/v1/ideas/generate"
    payload = {
        "mode": "discover",
        "user_input": "Test input",
        "project_id": None
    }
    
    print(f"Triggering {url}...")
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        try:
            print("Response Detail:")
            print(json.dumps(response.json(), indent=2))
        except:
            print("Response Text:")
            print(response.text)
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    reproduce_500()
