import requests
import json

url = "http://127.0.0.1:8000/api/v1/ideas/generate"
payload = {"mode": "discover"}

print(f"Testing {url}...")
try:
    response = requests.post(url, json=payload, timeout=10)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:500]}")
except Exception as e:
    print(f"Error: {e}")
