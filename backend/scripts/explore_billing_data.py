import os
import asyncio
import sys
from pathlib import Path

# Add the project root to sys.path to import app
project_root = str(Path(__file__).parent.parent.parent)
if project_root not in sys.path:
    sys.path.append(project_root)

from app.core.config import settings
from app.services.billing_service import billing_service

async def explore_data():
    supabase = billing_service.supabase_service
    if not supabase:
        print("Error: SUPABASE_SERVICE_ROLE_KEY not set")
        return

    # 1. List some organizations
    print("--- Organizations ---")
    try:
        res = supabase.table("organizations").select("*").limit(10).execute()
        if res.data:
            for org in res.data:
                print(f"Org: {org.get('name')} | ID: {org.get('id')} | Owner: {org.get('owner_id')}")
        else:
            print("No organizations found.")
    except Exception as e:
        print(f"Error querying organizations: {e}")

    # 2. List some subscriptions
    print("\n--- Subscriptions ---")
    try:
        res = supabase.table("subscriptions").select("*").limit(10).execute()
        if res.data:
            for sub in res.data:
                print(f"Sub: {sub.get('plan')} | Org: {sub.get('org_id')} | Status: {sub.get('status')}")
        else:
            print("No subscriptions found.")
    except Exception as e:
        print(f"Error querying subscriptions: {e}")

    # 3. List some users if the table exists
    for table in ["users", "profiles", "user_profiles"]:
        print(f"\n--- {table} ---")
        try:
            res = supabase.table(table).select("*").limit(5).execute()
            if res.data:
                for user in res.data:
                    print(f"User: {user.get('email', 'N/A')} | ID: {user.get('id')}")
            else:
                print(f"No data in {table}")
        except Exception as e:
            print(f"Error querying {table}: {e}")

if __name__ == "__main__":
    asyncio.run(explore_data())
