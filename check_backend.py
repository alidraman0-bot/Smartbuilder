import requests
import sys

def check_backend():
    url = "http://127.0.0.1:8000/api/v1/billing/ping"
    print(f"Checking {url}...")
    try:
        resp = requests.get(url, timeout=2)
        print(f"Status: {resp.status_code}")
        print(f"Content: {resp.text}")
    except Exception as e:
        print(f"FAILED to connect: {e}")

if __name__ == "__main__":
    check_backend()
