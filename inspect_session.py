
import asyncio
import json
import os
from app.core.supabase import supabase

async def inspect_latest_session():
    try:
        res = supabase.table("builder_sessions").select("*").order("updated_at", desc=True).limit(1).execute()
        if not res.data:
            print("No sessions found.")
            return
        
        session = res.data[0]
        print(f"Session ID: {session['session_id']}")
        print(f"Status: {session['status']}")
        print(f"Project Name: {session['project_name']}")
        
        print("\n--- PRD Snapshot ---")
        print(json.dumps(session.get("prd_snapshot"), indent=2)[:1000])
        
        print("\n--- Planner Snapshot ---")
        # Planner snapshot might be in a separate field or inside prd_snapshot in some versions
        # Let's check the database columns first
        print(f"Keys in session: {list(session.keys())}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(inspect_latest_session())
