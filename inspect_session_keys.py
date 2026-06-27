
import asyncio
import json
import os
from app.core.supabase import supabase

async def inspect_latest_session_keys():
    try:
        # Avoid selecting all (which might include large blobs)
        res = supabase.table("builder_sessions").select("session_id, status, project_name, updated_at").order("updated_at", desc=True).limit(5).execute()
        if not res.data:
            print("No sessions found.")
            return
        
        for i, session in enumerate(res.data):
            print(f"\n[{i}] Session: {session['session_id']}")
            print(f"    Name: {session['project_name']}")
            print(f"    Status: {session['status']}")
            print(f"    Updated: {session['updated_at']}")
            
            # Try to fetch JUST the snapshot for the latest one
            if i == 0:
                full_res = supabase.table("builder_sessions").select("prd_snapshot").eq("session_id", session['session_id']).single().execute()
                if full_res.data:
                    prd = full_res.data.get("prd_snapshot")
                    print(f"    PRD Keys: {list(prd.keys()) if prd else 'EMPTY'}")
                    if prd and 'pages_content' in prd:
                         print(f"    Has pages_content")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(inspect_latest_session_keys())
