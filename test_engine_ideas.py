import asyncio
import json
from app.services.opportunity_engine_service import OpportunityEngineService
from dotenv import load_dotenv

async def test_engine_ideas():
    print("Testing OpportunityEngineService idea count...")
    load_dotenv()
    
    try:
        service = OpportunityEngineService()
        result = await service.generate_opportunities()
        
        ideas = result.get('ideas', [])
        print(f"\nGenerated {len(ideas)} ideas.")
        
        for i, idea in enumerate(ideas):
            print(f"{i+1}. {idea.get('title')}")
            
        if len(ideas) == 5:
            print("\nSUCCESS: Generated exactly 5 ideas.")
        else:
            print(f"\nFAILURE: Generated {len(ideas)} ideas instead of 5.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_engine_ideas())
