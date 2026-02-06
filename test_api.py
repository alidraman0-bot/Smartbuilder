import requests
import json

def test_api():
    print("Testing API /api/v1/ideas/generate...")
    try:
        response = requests.post(
            "http://127.0.0.1:8000/api/v1/ideas/generate",
            json={"mode": "discover"}
        )
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("Response:")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Connection Error: {e}")

if __name__ == "__main__":
    test_api()
