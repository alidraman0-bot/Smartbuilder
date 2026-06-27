
import os
import httpx
import asyncio
from dotenv import load_dotenv

load_dotenv()

async def check_serpapi():
    key = os.getenv("SERPAPI_API_KEY")
    print(f"Checking SerpApi with key: {key[:5]}...")
    url = "https://serpapi.com/search"
    params = {
        "q": "coffee delivery startup",
        "api_key": key,
        "engine": "google"
    }
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url, params=params)
            print(f"SerpApi Status: {resp.status_code}")
            if resp.status_code == 200:
                results = resp.json()
                organic = results.get("organic_results", [])
                print(f"Found {len(organic)} organic results.")
                if organic:
                    print(f"First result: {organic[0].get('title')}")
            else:
                print(f"Error: {resp.text}")
        except Exception as e:
            print(f"SerpApi Exception: {e}")

async def check_brightdata():
    key = os.getenv("BRIGHTDATA_API_KEY")
    cust_id = os.getenv("BRIGHTDATA_CUSTOMER_ID")
    zone = os.getenv("BRIGHTDATA_ZONE") or "web_unlocker"
    
    print(f"Checking BrightData with key: {key[:5]}..., cust_id: {cust_id}, zone: {zone}")
    
    if not cust_id or not key:
        print("BrightData credentials incomplete.")
        return

    proxy_url = f"http://brd-customer-{cust_id}-zone-{zone}:{key}@brd.superproxy.io:22225"
    
    async with httpx.AsyncClient(proxies=proxy_url, timeout=30.0) as client:
        try:
            # Try a simple google search via proxy
            url = "https://www.google.com/search?q=test&brd_json=1"
            resp = await client.get(url)
            print(f"BrightData Status: {resp.status_code}")
            if resp.status_code == 200:
                print("BrightData Proxy Working!")
            else:
                print(f"BrightData Error: {resp.status_code}")
        except Exception as e:
            print(f"BrightData Exception: {e}")

if __name__ == "__main__":
    asyncio.run(check_serpapi())
    asyncio.run(check_brightdata())
