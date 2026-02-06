import asyncio
import json
import os
from dotenv import load_dotenv

# Mocking the settings to avoid loading the whole app for a quick test
# if we are running this from the root
import sys
sys.path.append(os.getcwd())

load_dotenv()

from app.services.idea_service import idea_service

async def test_generation():
    print("Testing Idea Generation...")
    try:
        ideas = await idea_service.generate_ideas(user_input="Sustainable energy for urban areas")
        print(f"Generated {len(ideas)} ideas:")
        for idea in ideas:
            print(f"- {idea['title']} (Score: {idea['confidence_score']})")
            print(f"  Thesis: {idea['thesis']}")
            print(f"  Problem Bullets: {idea['problem_bullets']}")
            print(f"  Monetization: {idea['monetization']}")
            print("-" * 20)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_generation())
