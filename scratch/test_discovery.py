import asyncio
import httpx
import time
import traceback
import sys

# Reconfigure stdout to use UTF-8 to avoid CP1252 errors on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

async def test_discovery():
    print("Testing POST /api/v1/ideas/discovery (should be INSTANT cache hit)...")
    start = time.time()
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                "http://127.0.0.1:8000/api/v1/ideas/discovery",
                json={"project_id": "test_project"},
                timeout=60.0
            )
            print(f"Status Code: {resp.status_code}")
            print(f"Duration: {time.time() - start:.2f}s")
            print("Response:")
            # Safe print replacing non-encodable characters
            print(resp.text[:1200].encode('utf-8', errors='replace').decode('utf-8'))
        except Exception as e:
            print("Request failed:")
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_discovery())
