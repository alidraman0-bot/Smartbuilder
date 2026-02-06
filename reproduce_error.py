import asyncio
import os
import sys

# Add the project root to sys.path to allow imports from app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

async def reproduce():
    print("Initializing IdeaService...")
    try:
        from app.services.idea_service import idea_service
        print("IdeaService initialized.")
        
        print("Calling generate_ideas(mode='discover')...")
        ideas = await idea_service.generate_ideas(mode="discover")
        print(f"Success! Generated {len(ideas)} ideas.")
        for i, idea in enumerate(ideas):
            print(f"{i+1}. {idea.get('title')}")
            
    except Exception as e:
        print(f"\n[ERROR] Reproduction failed with: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(reproduce())
