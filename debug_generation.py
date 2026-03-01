import asyncio
import logging
from app.services.idea_service import idea_service

# Configure logging to see the error
logging.basicConfig(level=logging.INFO)

async def test_generation():
    print("Starting generation test...")
    try:
        ideas = await idea_service.generate_ideas(mode="discover")
        print(f"Successfully generated {len(ideas)} ideas.")
        print(ideas)
    except Exception as e:
        print(f"CRITICAL ERROR CAUGHT: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_generation())
