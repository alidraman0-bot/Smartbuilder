import asyncio
import sys
from pathlib import Path

# Add the project root to sys.path to import app
project_root = str(Path(__file__).parent.parent.parent)
if project_root not in sys.path:
    sys.path.append(project_root)

from app.services.billing_service import billing_service

async def find_user_admin(email: str):
    supabase = billing_service.supabase_service
    if not supabase:
        print("Error: SUPABASE_SERVICE_ROLE_KEY not set")
        return

    print(f"Searching for user via Admin API: {email}")
    try:
        # Supabase Python client's auth.admin.list_users() or similar
        # Note: Not all versions of the client have the same admin wrapper.
        # Let's try to use the gotten client
        
        # In many versions, it's supabase.auth.admin.list_users()
        # Some versions might require a separate import or have a different structure.
        
        # Let's try to just list users and filter
        res = await asyncio.to_thread(supabase.auth.admin.list_users)
        
        match = None
        for user in res:
            if user.email == email:
                match = user
                break
        
        if match:
            print(f"Found user! ID: {match.id}, Email: {match.email}")
            # Find organization
            res_org = supabase.table("organizations").select("*").eq("owner_id", match.id).execute()
            if res_org.data:
                print(f"Found {len(res_org.data)} organizations:")
                for org in res_org.data:
                    print(f"  Org: {org['name']} (ID: {org['id']})")
                    # Check subscription
                    res_sub = supabase.table("subscriptions").select("*").eq("org_id", org['id']).execute()
                    if res_sub.data:
                        print(f"    Current Plan: {res_sub.data[0]['plan']}")
                    else:
                        print("    No subscription record found.")
            else:
                print("No organizations found for this user.")
        else:
            print(f"User with email {email} not found in auth.users.")
            # List some users to see what's there
            print("\nRecent users:")
            for user in res[:5]:
                print(f"  {user.email} ({user.id})")

    except Exception as e:
        print(f"Admin API error: {e}")
        # Try a different approach if the first one failed
        try:
             # Some versions might use different structures
             # Let's try to query the organizations table directly for any email-like strings
             print("\nAttempting to search for email-like strings in all tables...")
        except:
             pass

if __name__ == "__main__":
    email = "alidramani345@gmil.com"
    asyncio.run(find_user_admin(email))
