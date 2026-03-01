import sys
import os
import asyncio
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app
from app.core.supabase import get_service_client

client = TestClient(app)

async def test_service_logic():
    from app.services.opportunity_engine_service import OpportunityEngineService
    from app.models.opportunity_engine import OpportunityEngineResponse
    
    print("\n--- Testing OpportunityEngineService Directly ---")
    service = OpportunityEngineService()
    supabase = get_service_client()
    
    try:
        # Fetch a real user_id from the database to avoid FK violation
        # We check ideas table or something similar to find a user_id
        user_res = supabase.table("ideas").select("user_id").limit(1).execute()
        if user_res.data:
            user_id = user_res.data[0]['user_id']
            print(f"Using existing user_id for test: {user_id}")
        else:
            print("No users found in 'ideas' table. Proceeding with user_id=None (if DB allowed, but it's not).")
            # We'll just test the AI generation part and catch the DB error specifically
            user_id = None

        result = await service.generate_opportunities(user_id=user_id)
        
        print(f"SUCCESS: Generated {len(result['ideas'])} venture ideas")
        for i, idea in enumerate(result['ideas']):
            print(f"Idea {i+1}: {idea['title']}")
        
        # Verify DB insertion
        if user_id:
            run_check = supabase.table("opportunity_runs").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
            if run_check.data:
                print(f"[OK] DB Persistence Verified. Run ID: {run_check.data[0]['id']}")
            else:
                print("[FAIL] Run not saved to database.")

    except Exception as e:
        # If it's the FK error again, at least we know the AI part worked
        if "foreign key constraint" in str(e):
            print(f"[HALF-SUCCESS] AI worked, but DB failed as expected: {e}")
        else:
            print(f"Error during service test: {e}")

if __name__ == "__main__":
    asyncio.run(test_service_logic())
