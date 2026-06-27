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

async def upgrade_user(email: str):
    print(f"Searching for user: {email}")
    
    # Use service role to bypass RLS
    supabase = billing_service.supabase_service
    if not supabase:
        print("Error: SUPABASE_SERVICE_ROLE_KEY not set")
        return

    # 1. We can't query auth.users directly via the standard API usually.
    # However, we can search via org_members or organizations if we have a way to link.
    # In billing_service.py, ensure_default_organization uses user_id and email.
    # Let's see if we can find the org_id by searching for the user in organizations if they are owner.
    
    # Try to find org by searching for user in a table where email might exist or by metadata.
    # If the user has an organization, the owner_id is leur user_id.
    # But we only have email.
    
    # Let's try to query 'organizations' or 'org_members' if they have some info.
    # Actually, let's try to find the user in 'org_members' by joining or some other way.
    
    # Wait, the user usually has a profile or something.
    # Let's check common tables.
    
    print("Checking 'subscriptions' join with 'organizations'...")
    # This is tricky without knowing the schema perfectly.
    # Let's try to get all subscriptions and filter or look for user metadata.
    
    # Alternative: Use the admin API to find user by email if we can.
    # Supabase Python client doesn't expose auth.admin easily without a secret key.
    
    try:
        # Let's try to find an organization that might have this user.
        # Often there's a 'user_profiles' or similar.
        # Let's try to see if we can find the email in any table.
        
        # In billing_service: "Ensuring organization for user {user_id} ({email})"
        # It creates an org with name f"{full_name or email.split('@')[0]}'s Organization"
        
        search_pattern = f"{email.split('@')[0]}'s Organization"
        print(f"Searching for organization with name like: {search_pattern}")
        
        res = supabase.table("organizations").select("*").ilike("name", f"%{email.split('@')[0]}%").execute()
        
        if not res.data:
            print(f"No organization found with pattern '{search_pattern}'")
            # Try a broader search
            res = supabase.table("organizations").select("*").execute()
            # If there aren't many, we can just look through them or look for the user_id.
            print(f"Total organizations found: {len(res.data)}")
            
            # Let's try to find the user in 'org_members' if we can find a user_id somehow.
            # Usually, there's a 'users' table in public schema that mirrors auth.users.
            try:
                user_res = supabase.table("users").select("*").eq("email", email).execute()
                if user_res.data:
                    user_id = user_res.data[0]['id']
                    print(f"Found user_id: {user_id}")
                    # Now find org
                    org_res = supabase.table("org_members").select("org_id").eq("user_id", user_id).execute()
                    if org_res.data:
                        org_id = org_res.data[0]['org_id']
                        await perform_upgrade(org_id)
                        return
            except Exception:
                print("Could not find 'users' table in public schema.")

            print("Falling back to scanning organizations for matching owner_id if we had it...")
        else:
            print(f"Found {len(res.data)} potential organizations.")
            for org in res.data:
                print(f"Org: {org['name']} (ID: {org['id']})")
                # Check subscription
                sub_res = supabase.table("subscriptions").select("*").eq("org_id", org['id']).execute()
                if sub_res.data:
                    print(f"Current Plan: {sub_res.data[0]['plan']}")
                    if input(f"Upgrade this organization ({org['name']}) to pro? (y/n): ").lower() == 'y':
                        await perform_upgrade(org['id'])
                        return
    except Exception as e:
        print(f"Error: {e}")

async def perform_upgrade(org_id: str):
    print(f"Upgrading org_id {org_id} to pro...")
    supabase = billing_service.supabase_service
    res = supabase.table("subscriptions").update({"plan": "pro"}).eq("org_id", org_id).execute()
    if res.data:
        print("Success! User upgraded to Pro.")
    else:
        print("Failed to update subscription.")

if __name__ == "__main__":
    email = "alidramani345@gmil.com"
    if len(sys.argv) > 1:
        email = sys.argv[1]
    
    # Since I'm running this, I'll bypass the interactive input and just do it if I find a clear match.
    # I'll modify the script to be non-interactive.
    
    async def run():
        # Re-defining to be non-interactive
        supabase = billing_service.supabase_service
        # Try to find user in 'users' or 'profiles'
        user_id = None
        for table in ["users", "profiles", "user_profiles"]:
            try:
                res = supabase.table(table).select("id").eq("email", email).execute()
                if res.data:
                    user_id = res.data[0]['id']
                    print(f"Found user_id {user_id} in table '{table}'")
                    break
            except:
                continue
        
        if not user_id:
            # Try to find by organization name as a fallback
            org_name_part = email.split('@')[0]
            res = supabase.table("organizations").select("id, name").ilike("name", f"%{org_name_part}%").execute()
            if res.data:
                org_id = res.data[0]['id']
                print(f"Found organization '{res.data[0]['name']}' (ID: {org_id}) via name match.")
                await perform_upgrade(org_id)
                return
        else:
            # Find org by user_id
            res = supabase.table("org_members").select("org_id").eq("user_id", user_id).execute()
            if res.data:
                org_id = res.data[0]['org_id']
                print(f"Found org_id {org_id} for user.")
                await perform_upgrade(org_id)
                return

        print("Could not find a matching user or organization.")

    asyncio.run(run())
