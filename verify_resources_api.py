import requests
import json
import sys

BASE_URL = "http://localhost:8000/api/v1/resources"

def test_get_resources():
    print("Testing GET /resources ...")
    try:
        response = requests.get(BASE_URL)
        response.raise_for_status()
        resources = response.json()
        print(f"SUCCESS: Retrieved {len(resources)} resources.")
        # print(json.dumps(resources, indent=2))
        return True
    except requests.exceptions.ConnectionError:
        print("ERROR: Could not connect to backend. Is it running?")
        return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def test_get_intelligence():
    print("\nTesting GET /resources/intelligence ...")
    try:
        response = requests.get(f"{BASE_URL}/intelligence")
        response.raise_for_status()
        data = response.json()
        print("SUCCESS: Retrieved intelligence data.")
        # print(json.dumps(data, indent=2))
        return True
    except Exception as e:
        print(f"ERROR: {e}")
        return False

if __name__ == "__main__":
    if test_get_resources() and test_get_intelligence():
        print("\nAll tests passed!")
        sys.exit(0)
    else:
        print("\nSome tests failed.")
        sys.exit(1)
