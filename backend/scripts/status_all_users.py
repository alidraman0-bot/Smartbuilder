import asyncio
import sys
from pathlib import Path

project_root = str(Path(__file__).parent.parent.parent)
if project_root not in sys.path:
    sys.path.append(project_root)

from app.services.billing_service import billing_service

async def check_all_and_upgrade():
    supabase = billing_service.supabase_service
    candidates = [
        ("alidraman10@gmail.com",    "2c94f282-191c-46bc-bd58-62a2fbfa5aab"),
        ("alidramani345@gmail.com",  "6fc076de-55b2-4c06-a831-2b0261212d77"),
        ("alidraman@gmail.com",      "589d9dc5-02c2-46b9-8f32-2db974f95d35"),
        ("alidraman0@gmail.com",     "d69d4df3-2681-4409-bc1d-29a5ca9cb801"),
    ]

    print("=" * 60)
    print(f"{'Email':<35} {'Plan':<12} {'Status'}")
    print("=" * 60)

    for email, user_id in candidates:
        # check org owner
        res_org = supabase.table("organizations").select("id,name").eq("owner_id", user_id).execute()
        if not res_org.data:
            print(f"{email:<35} {'-- no org --':<12}")
            continue
        for org in res_org.data:
            res_sub = supabase.table("subscriptions").select("plan,status").eq("org_id", org["id"]).execute()
            if res_sub.data:
                plan   = res_sub.data[0]["plan"]
                status = res_sub.data[0]["status"]
                print(f"{email:<35} {plan:<12} {status}")
            else:
                print(f"{email:<35} {'-- no sub --':<12}")

if __name__ == "__main__":
    asyncio.run(check_all_and_upgrade())
