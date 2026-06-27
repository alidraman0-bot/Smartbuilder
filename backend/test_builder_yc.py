import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_high_fidelity_endpoints():
    idea_payload = {
        "idea": {
            "title": "Smart Talent Pipeline: African Graduate Edition",
            "market_category": "HR Tech"
        },
        "run_id": "test_run_yc"
    }

    print("Testing Business Plan Endpoint...")
    bp_res = requests.post(f"{BASE_URL}/builder/business-plan", json=idea_payload)
    if bp_res.status_code == 200:
        print("Business Plan Generated Successfully.")
        # print(json.dumps(bp_res.json(), indent=2))
    else:
        print(f"FAILED: {bp_res.status_code}")
        print(bp_res.text)

    print("\nTesting PRD Endpoint...")
    prd_res = requests.post(f"{BASE_URL}/builder/prd", json=idea_payload)
    if prd_res.status_code == 200:
        print("PRD Generated Successfully.")
        # print(json.dumps(prd_res.json(), indent=2))
    else:
        print(f"FAILED: {prd_res.status_code}")
        print(prd_res.text)

if __name__ == "__main__":
    test_high_fidelity_endpoints()
