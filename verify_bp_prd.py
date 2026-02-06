import asyncio
import uuid
import json
import logging
from app.services.business_plan_service import business_plan_service
from app.services.prd_service import prd_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def verify_bp_prd():
    print("\n--- Verifying Business Plan & PRD Generation ---")
    
    # 1. Create dummy input data
    dummy_idea = {
        "idea_id": str(uuid.uuid4()),
        "title": "Test AI Platform",
        "description": "An AI platform for testing.",
        "target_user": "Developers",
        "problem": "Testing is hard."
    }
    
    dummy_research = {
        "market_size": "Large",
        "competitors": ["None"],
        "user_interviews": []
    }
    
    # 2. Test Business Plan Generation
    print("\n[1/2] Generating Business Plan...")
    try:
        bp_result = await business_plan_service.generate_business_plan(
            idea=dummy_idea,
            research=dummy_research,
            run_id=f"test-bp-{uuid.uuid4().hex[:8]}"
        )
        
        if bp_result.get("status") == "COMPLETE" and bp_result.get("business_plan"):
            print("PASS: Business Plan generated successfully.")
            # print(json.dumps(bp_result["business_plan"], indent=2)[:500] + "...")
        else:
            print("FAIL: Business Plan generation failed or returned incomplete data.")
            print(bp_result)
            return

        business_plan = bp_result["business_plan"]
        
    except Exception as e:
        print(f"FAIL: Exception during Business Plan generation: {e}")
        return

    # 3. Test PRD Generation
    print("\n[2/2] Generating PRD...")
    try:
        prd_result = await prd_service.generate_prd(
            idea=dummy_idea,
            business_plan=business_plan,
            run_id=f"test-prd-{uuid.uuid4().hex[:8]}"
        )
        
        if prd_result.get("status") == "COMPLETE" and prd_result.get("prd"):
            print("PASS: PRD generated successfully.")
            # print(json.dumps(prd_result["prd"], indent=2)[:500] + "...")
        else:
            print("FAIL: PRD generation failed or returned incomplete data.")
            print(prd_result)
            return
            
    except Exception as e:
        print(f"FAIL: Exception during PRD generation: {e}")
        return

    print("\n--- Verification Complete: ALL PASS ---")

if __name__ == "__main__":
    asyncio.run(verify_bp_prd())
