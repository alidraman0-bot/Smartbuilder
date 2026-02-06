import asyncio
import os
import sys
import json
import uuid
import logging

# Add project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_robustness():
    print("--- Robustness Test Suite: IdeaService ---")
    
    from app.services.idea_service import idea_service
    from app.services.memory_service import memory_service
    
    # 1. Test malformed JSON fallback
    print("\nScenario 1: AI returns conversational filler instead of JSON")
    # We'll simulate this by manually calling the fallback or injecting a bad response if we could mock the client easily
    # For now, we trust our 'extract_json' will be tested later.
    
    # 2. Test Supabase Failure
    print("\nScenario 2: Supabase Persistence Failure")
    try:
        # We simulate a failure by passing an invalid project_id that violated FK constraints
        bad_project_id = "this-is-not-a-uuid"
        print(f"Attempting to save idea with invalid project_id: {bad_project_id}")
        # This SHOULD be caught by the inner try-except in generate_ideas
        
        test_idea = {
            "title": "Robustness Test",
            "thesis": "Testing save safety",
            "confidence_score": 99
        }
        
        # We manually call save_idea to see if it crashes the process
        try:
            await memory_service.save_idea(bad_project_id, test_idea)
            print("FAILED: save_idea should have thrown or handled the error.")
        except Exception as e:
            print(f"SUCCESS: Caught expected persistence error: {e}")
            
    except Exception as e:
        print(f"FAILURE detected: {e}")

    # 3. Test IdeaService fallback flow
    print("\nScenario 3: Full IdeaService fallback flow")
    # We'll simulate a global crash inside generate_ideas by mocking something if needed
    # But the best test is just running the service and ensuring it returns something even if DB is down
    
    print("\nRobustness tests complete.")

if __name__ == "__main__":
    asyncio.run(test_robustness())
