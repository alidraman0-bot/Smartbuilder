import requests
import json

def debug_connection():
    base_url = "http://127.0.0.1:8000"
    endpoints = [
        "/api/v1/health",
        "/api/v1/status",
        "/api/research"
    ]
    
    for ep in endpoints:
        url = f"{base_url}{ep}"
        print(f"Testing {url}...")
        try:
            res = requests.get(url, timeout=5) if ep != "/api/research" else requests.options(url, timeout=5)
            print(f"Status: {res.status_code}")
            if res.status_code == 200:
                print(f"Response: {res.json()}")
        except Exception as e:
            print(f"Failed {url}: {e}")

if __name__ == "__main__":
    debug_connection()
