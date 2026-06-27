import asyncio
import sys
from pathlib import Path

# Add the project root to sys.path to import app
project_root = str(Path(__file__).parent.parent.parent)
if project_root not in sys.path:
    sys.path.append(project_root)

from app.services.billing_service import billing_service

async def find_user_by_activity():
    supabase = billing_service.supabase_service
    
    print("--- Ideas ---")
    try:
        res = supabase.table("ideas").select("user_id, org_id").limit(20).execute()
        if res.data:
            user_ids = set()
            org_ids = set()
            for idea in res.data:
                if idea.get('user_id'): user_ids.add(idea.get('user_id'))
                if idea.get('org_id'): org_ids.add(idea.get('org_id'))
            
            print(f"User IDs found in 'ideas': {user_ids}")
            print(f"Org IDs found in 'ideas': {org_ids}")
            
            for uid in user_ids:
                print(f"Searching for ID {uid} in other tables...")
                # Check org_members
                res_mem = supabase.table("org_members").select("*").eq("user_id", uid).execute()
                print(f"  org_members: {res_mem.data}")
        else:
            print("No ideas found.")
    except Exception as e:
        print(f"Error querying ideas: {e}")

if __name__ == "__main__":
    asyncio.run(find_user_by_activity())
