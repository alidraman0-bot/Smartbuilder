import requests
import json

def probe_status():
    urls = [
        "http://127.0.0.1:8000/api/v1/status",
        "http://localhost:3000/api/v1/status"
    ]
    for url in urls:
        print(f"\nProbing URL: {url}")
        try:
            response = requests.get(url)
            print(f"Status Code: {response.status_code}")
            if response.status_code == 500:
                 print("Response Body:")
                 try:
                     print(json.dumps(response.json(), indent=2))
                 except:
                     print(response.text)
        except Exception as e:
            print(f"Error connecting to {url}: {e}")

if __name__ == "__main__":
    probe_status()
