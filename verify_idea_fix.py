import asyncio
import os
import sys
import logging
from app.services.idea_service import idea_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def verify_idea_generation():
    print("Starting Idea Generation Verification...")
    
    # Test project ID
    project_id = "00000000-0000-0000-0000-000000000000"
    
    try:
        # Generate ideas (using mock or real depending on config, but logic is shared)
        print("Generating 5 ideas...")
        ideas = await idea_service.generate_ideas_with_seeds(
            project_id=project_id,
            mode="discover",
            count=5
        )
        
        print(f"\nGenerated {len(ideas)} ideas.")
        
        failed_count = 0
        for i, idea in enumerate(ideas):
            title = idea.get("title", "NO_TITLE")
            thesis = idea.get("thesis", "NO_THESIS")
            print(f"\nIdea {i+1}: {title}")
            print(f"Thesis: {thesis[:100]}...")
            
            if title.lower() in ["untitled opportunity", "untitled", "startup idea", "no_title"]:
                print(f"❌ FAILED: Weak title detected for Idea {i+1}")
                failed_count += 1
            else:
                print(f"✅ check passed")

        if failed_count > 0:
            print(f"\n❌ Verification FAILED: {failed_count} ideas had weak titles.")
            sys.exit(1)
        else:
            print("\n✅ Verification SUCCESS: All ideas have valid titles.")
            sys.exit(0)
            
    except Exception as e:
        print(f"\n❌ Error during verification: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(verify_idea_generation())
