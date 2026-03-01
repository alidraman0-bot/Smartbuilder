import asyncio
import httpx
import json
import traceback

async def debug_api():
    print("Sending enhanced request to /api/v1/ideas/generate...")
    url = "http://localhost:8000/api/v1/ideas/generate"
    payload = {"mode": "discover"}
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            # Try both localhost and 127.0.0.1
            for host in ["localhost", "127.0.0.1"]:
                url = f"http://{host}:8000/api/v1/ideas/generate"
                print(f"\nTrying {url}...")
                
                try:
                    response = await client.post(url, json=payload)
                    print(f"Status Code: {response.status_code}")
                    print(f"Headers: {dict(response.headers)}")
                    
                    try:
                        data = response.json()
                        print(f"Response JSON: {json.dumps(data, indent=2)}")
                    except:
                        print(f"Response Text (non-JSON): {response.text}")
                    
                    if response.status_code == 500:
                        print("BACKEND RETURNED 500!")
                    
                except Exception as e:
                    print(f"Connection to {host} failed: {repr(e)}")

        except Exception as e:
            print(f"Request failed with error: {repr(e)}")
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_api())
