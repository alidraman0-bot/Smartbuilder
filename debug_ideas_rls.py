
import sys
import os
import asyncio
from dotenv import load_dotenv

# Ensure app is in path
sys.path.append(os.getcwd())

load_dotenv()

from app.core.supabase import get_service_client

async def check_policies():
    svc_client = get_service_client()
    print("--- RLS Policy Check for ideas_v2 ---")
    try:
        # We can't directly read policies via public API, but we can check if service role can INSERT
        import uuid
        test_id = str(uuid.uuid4())
        record = {
            "id": test_id,
            "title": "RLS Test",
            "summary": "Checking if service role can insert",
            "project_id": str(uuid.uuid4()), # Non-existent project
            "status": "draft"
        }
        res = svc_client.table("ideas_v2").insert(record).execute()
        print("SUCCESS: Service role can insert into ideas_v2!")
        # Cleanup
        svc_client.table("ideas_v2").delete().eq("id", test_id).execute()
        print("Cleanup successful")
    except Exception as e:
        print(f"FAILED: Service role insert into ideas_v2: {e}")

if __name__ == "__main__":
    asyncio.run(check_policies())
