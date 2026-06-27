import asyncio
import json
import logging
import os
import sys

# Add current directory to path
sys.path.append(os.getcwd())

from app.services.opportunity_engine_service import OpportunityEngineService
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_opportunity_engine():
    print("--- Opportunity Engine Verification ---")
    print(f"Primary Provider: {settings.AI_PROVIDER}")
    print(f"Fallback List: {settings.FALLBACK_PROVIDERS_LIST}")
    
    service = OpportunityEngineService()
    
    try:
        print("\nTriggering opportunity generation...")
        # Mock user_id
        result = await service.generate_opportunities(user_id="00000000-0000-0000-0000-000000000000")
        
        print("\n--- RESULTS ---")
        ideas = result.get('ideas', [])
        print(f"Generated {len(ideas)} ideas.")
        
        for i, idea in enumerate(ideas):
            print(f"{i+1}. {idea.get('title')} (Score: {idea.get('score_data', {}).get('score')})")
            
        if len(ideas) > 0:
            print("\nSUCCESS: Ideas generated successfully (likely via fallback).")
        else:
            print("\nFAILURE: No ideas generated.")
            
    except Exception as e:
        print(f"\nERROR: Opportunity Engine failed: {e}")
        print("Check if any AI provider has remaining quota/funds.")

if __name__ == "__main__":
    asyncio.run(test_opportunity_engine())
