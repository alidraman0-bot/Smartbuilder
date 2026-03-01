import sys
import os
import asyncio
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.opportunity_engine_service import OpportunityEngineService
from app.core.supabase import get_service_client

async def verify_pipeline():
    print("\n--- Verifying Opportunity Engine AI Pipeline ---")
    service = OpportunityEngineService()
    
    try:
        # We test ONLY the generation part to avoid FK errors in this test environment
        # We'll mock the supabase insert for this test
        original_insert = service.supabase.table("opportunity_runs").insert
        service.supabase.table("opportunity_runs").insert = lambda x: type('obj', (object,), {'execute': lambda: None})
        
        result = await service.generate_opportunities(user_id=None)
        
        if "ideas" in result and len(result["ideas"]) == 5:
            print(f"✅ SUCCESS: Generated 5 Venture Opportunities")
            for i, idea in enumerate(result["ideas"]):
                print(f"   {i+1}. {idea['title']} - {idea['problem'][:60]}...")
        else:
            print(f"❌ FAIL: Unexpected result format: {result}")

    except Exception as e:
        print(f"❌ ERROR: Pipeline failed: {e}")

if __name__ == "__main__":
    asyncio.run(verify_pipeline())
