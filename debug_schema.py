
import sys
import os
import asyncio
from dotenv import load_dotenv

# Ensure app is in path
sys.path.append(os.getcwd())

load_dotenv()

from app.core.supabase import get_service_client

async def check_schema():
    svc_client = get_service_client()
    print("--- Schema Check for ideas_v2 ---")
    try:
        # Try a select without columns to see what we get
        res = svc_client.table("ideas_v2").select("*").limit(0).execute()
        # This might fail too if schema cache is broken, but let's try
        print("Columns according to PostgREST:")
        # We can't easily get column names from an empty result in some versions of supabase-py
        # but we can try to insert a record with ONLY project_id and see what happens.
        
        # Alternative: Try to select a single row and see the keys
        res = svc_client.table("ideas_v2").select("*").limit(1).execute()
        if res.data:
            print(f"Found row keys: {list(res.data[0].keys())}")
        else:
            print("No data in ideas_v2, trying to probe columns via error messages...")
            try:
                svc_client.table("ideas_v2").insert({"garbage_column": 1}).execute()
            except Exception as e:
                print(f"Probe Error: {e}")

    except Exception as e:
        print(f"Failed to check schema: {e}")

if __name__ == "__main__":
    asyncio.run(check_schema())
