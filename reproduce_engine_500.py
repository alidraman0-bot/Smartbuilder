import requests
import json

def reproduce_opportunity_engine_500():
    # Use port 8001 since that's where uvicorn is running
    url = "http://127.0.0.1:8001/api/v1/opportunity-engine"
    
    # We need a valid session token? Or we can bypass auth if we mock get_current_user
    # But for a quick check, let's see if it even reaches the route
    
    print(f"Triggering {url}...")
    try:
        # Note: This will likely fail with 401 if we don't provide a token, 
        # but if it returns 500 even without a token, that's interesting (means auth middleware failed)
        # However, the user request showed a 500 AFTER "Analyzing Signals" which means auth PASSED.
        
        headers = {
            "Authorization": "Bearer mock_token" # We might need a real token or to mock auth
        }
        
        response = requests.post(url, headers=headers)
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
    reproduce_opportunity_engine_500()
