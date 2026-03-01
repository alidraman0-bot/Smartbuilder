import requests
import json

def reproduce_bp_500():
    url = "http://127.0.0.1:8000/api/v1/builder/business-plan"
    payload = {
        "idea": {
            "idea_id": "test-idea",
            "title": "AI Cat Video Social Network",
            "target_user": "Cat Owners"
        },
        "research": {
            "report": "Sample research report content...",
            "full_report": "Full report content..."
        },
        "run_id": "test-run-123"
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
    reproduce_bp_500()
