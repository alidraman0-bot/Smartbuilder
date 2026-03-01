import asyncio
import logging
import json
from dotenv import load_dotenv

# Load env
load_dotenv()

from app.services.idea_service import idea_service

logging.basicConfig(level=logging.INFO)

async def test_live_generation():
    print("Starting Live Idea Generation Test...")
    # This will use the full production flow: fetching signals -> clustering -> AI synthesis
    ideas = await idea_service.generate_ideas(mode="discover")
    
    print(f"Generated {len(ideas)} ideas.")
    titles = [i.get("title") for i in ideas]
    print(f"Titles: {json.dumps(titles, indent=2)}")
    
    # Check if these are the mock ideas
    mock_titles = [
        "SmartLegal Audit AI", 
        "FleetMind Optimization", 
        "EduFlow AI", 
        "HealthSync Wellness",
        "RetailRadar AI",
        "CleanCurrents Monitoring",
        "TalentTrace AI",
        "RetailPulse Analytics",
        "FinGuard Compliance",
        "AgriTech Predictor"
    ]
    
    is_mock = all(title in mock_titles for title in titles)
    if is_mock:
        print("RESULT: STILL USING MOCK IDEAS. AI synthesis failed.")
    else:
        print("RESULT: SUCCESS! New ideas generated via AI.")

if __name__ == "__main__":
    asyncio.run(test_live_generation())
