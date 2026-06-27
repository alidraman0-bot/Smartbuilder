import asyncio
import sys
from pathlib import Path

# Add the project root to sys.path to import app
project_root = str(Path(__file__).parent.parent.parent)
if project_root not in sys.path:
    sys.path.append(project_root)

from app.services.billing_service import billing_service

async def final_check():
    supabase = billing_service.supabase_service
    user_id = "6fc076de-55b2-4c06-a831-2b0261212d77" # alidramani345@gmail.com
    
    print(f"Checking organizations for user_id: {user_id}")
    res_org = supabase.table("organizations").select("*").eq("owner_id", user_id).execute()
    if res_org.data:
        for org in res_org.data:
            print(f"Org: {org['name']} (ID: {org['id']})")
            res_sub = supabase.table("subscriptions").select("*").eq("org_id", org['id']).execute()
            if res_sub.data:
                print(f"  Plan: {res_sub.data[0]['plan']}, Status: {res_sub.data[0]['status']}")
            else:
                print("  No subscription record.")
    else:
        print("No organizations found for this user.")

    # Let's also check if they are in 'org_members' for any other orgs they don't own
    print(f"\nChecking memberships for user_id: {user_id}")
    res_mem = supabase.table("org_members").select("org_id").eq("user_id", user_id).execute()
    if res_mem.data:
        for mem in res_mem.data:
            oid = mem['org_id']
            res_sub = supabase.table("subscriptions").select("*").eq("org_id", oid).execute()
            if res_sub.data:
                 print(f"Member of Org ID: {oid}, Plan: {res_sub.data[0]['plan']}")
    else:
        print("No memberships found.")

if __name__ == "__main__":
    asyncio.run(final_check())
