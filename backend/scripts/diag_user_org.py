import asyncio, sys
from pathlib import Path

project_root = str(Path(__file__).parent.parent.parent)
if project_root not in sys.path:
    sys.path.append(project_root)

from app.services.billing_service import billing_service

USER_ID = "6fc076de-55b2-4c06-a831-2b0261212d77"  # alidramani345@gmail.com
ORG_ID  = "d65976c8-c5ec-4129-a726-a66fea109f6b"  # systeme's Organization (Pro)

async def main():
    svc = billing_service.supabase_service

    # 1. Check org_members
    print("--- org_members for user ---")
    r = svc.table("org_members").select("*").eq("user_id", USER_ID).execute()
    print(r.data or "NONE")

    # 2. Check all orgs owned by user
    print("\n--- organizations owned by user ---")
    r2 = svc.table("organizations").select("id,name,plan").eq("owner_id", USER_ID).execute()
    print(r2.data or "NONE")

    # 3. Check all subscriptions for known org
    print("\n--- subscriptions for Pro org ---")
    r3 = svc.table("subscriptions").select("*").eq("org_id", ORG_ID).execute()
    print(r3.data or "NONE")

if __name__ == "__main__":
    asyncio.run(main())
