import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.opportunity_engine_service import OpportunityEngineService

async def verify_scoring():
    print("\n--- Verifying Opportunity Scoring Pipeline ---")
    service = OpportunityEngineService()
    
    # Mock supabase insert to avoid cleanup
    service.supabase.table("opportunity_runs").insert = lambda x: type('obj', (object,), {'execute': lambda: None})
    service.scoring.supabase.table("opportunity_scores").insert = lambda x: type('obj', (object,), {'execute': lambda: None})
    
    try:
        result = await service.generate_opportunities(user_id=None)
        
        print(f"\nSUCCESS: Generated {len(result['ideas'])} venture ideas with scores")
        for i, idea in enumerate(result['ideas']):
            score_data = idea.get('score_data', {})
            print(f"\n{i+1}. {idea['title']}")
            print(f"   Score: {score_data.get('score')}/10")
            print(f"   Dimensions: Demand={score_data.get('market_demand')}, Competition={score_data.get('competition')}, Trend={score_data.get('trend')}")
            print(f"   VC Verdict: {score_data.get('summary')}")

    except Exception as e:
        print(f"❌ Error during verification: {e}")

if __name__ == "__main__":
    asyncio.run(verify_scoring())
