import requests
import sys

def reproduce():
    url = "http://127.0.0.1:8000/api/v1/ideas/generate"
    payload = {
        "mode": "discover"
    }
    print(f"Testing {url} with payload {payload}...")
    try:
        resp = requests.post(url, json=payload, timeout=120) # Increased timeout as generation might be slow
        print(f"Status: {resp.status_code}")
        print(f"Headers: {resp.headers}")
        print(f"Content: {resp.text}")
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    reproduce()
