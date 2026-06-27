
import sys
import os
import asyncio
from dotenv import load_dotenv

# Ensure app is in path
sys.path.append(os.getcwd())

load_dotenv()

from app.core.supabase import get_service_client, supabase as anon_client

async def diagnose():
    print("--- Supabase Diagnostics ---")
    print(f"URL: {os.getenv('SUPABASE_URL')}")
    
    svc_client = get_service_client()
    
    print("\nListing ALL PROJECTS with SERVICE CLIENT...")
    try:
        res = svc_client.table("projects").select("project_id, name").execute()
        print(f"Projects found ({len(res.data)}):")
        for p in res.data:
            print(f" - {p['project_id']}: {p['name']}")
    except Exception as e:
        print(f"Listing failed: {e}")

    print("\nTesting ANON CLIENT...")
    try:
        # Try to read projects (might work if public policy exists)
        res = anon_client.table("projects").select("*").limit(1).execute()
        print(f"Anon client found {len(res.data)} projects")
    except Exception as e:
        print(f"Anon client failed: {e}")

    print("\nTesting INSERT with SERVICE CLIENT...")
    import uuid
    test_id = str(uuid.uuid4())
    try:
        res = svc_client.table("projects").insert({
            "project_id": test_id,
            "name": f"Diagnostic Test {test_id[:8]}",
            "framework": "Diagnostic",
            "status": "active"
        }).execute()
        print(f"SUCCESS: Inserted diagnostic project {test_id}")
        
        # Cleanup
        svc_client.table("projects").delete().eq("project_id", test_id).execute()
        print("Cleanup successful")
    except Exception as e:
        print(f"FAILED: Service client insert error: {e}")

if __name__ == "__main__":
    asyncio.run(diagnose())
