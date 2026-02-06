import asyncio
import json
import os
import sys

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.research_service import research_service
from app.core.config import settings

async def verify_research():
    print("--- Starting Market Research Intelligence Engine Verification ---")
    
    test_idea = {
        "idea_id": "test-123",
        "title": "SmartLegal Audit AI",
        "problem": "Mid-sized law firms spend 30% of billable hours on manual contract auditing.",
        "target_user": "Legal Operations Managers"
    }
    
    print(f"\n- Testing Idea: {test_idea['title']}")
    
    # Check if we have OpenAI Key
    if not settings.OPENAI_API_KEY:
        print("- Warning: No OPENAI_API_KEY found. Testing with MOCK mode.")
    else:
        print("- OpenAI Key detected. Testing LIVE mode.")
        
    try:
        print("\n- Executing research (fetching data + AI analysis)...")
        result = await research_service.execute_research(test_idea)
        
        print("\n- Verification Results:")
        print(f"Status: {result.get('status')}")
        print(f"Confidence Score: {result.get('confidence_score')}%")
        
        modules = result.get("modules", [])
        print(f"Number of Sections: {len(modules)}")
        
        if "full_report" in result:
            print("\n- Full Report generated successfully.")
            # Print first 200 chars
            print(f"Report Preview: {result['full_report'][:300]}...")
        else:
            print("\n- Error: Full report missing from result.")
            
        if len(modules) >= 10:
            print("\n- Section parsing successful (10/10 sections found).")
        else:
            print(f"\n- Section parsing partial: {len(modules)}/10 sections found.")

        print("\n--- Verification Complete! ---")
        
    except Exception as e:
        print(f"\n❌ Verification failed with error: {e}")

if __name__ == "__main__":
    asyncio.run(verify_research())
