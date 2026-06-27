import asyncio
import sys
from app.services.idea_service import IdeaService
from app.services.opportunity_engine_service import OpportunityEngineService

async def verify_universe():
    print("--- Verifying Idea Universe ---")
    idea_service = IdeaService()
    engine = OpportunityEngineService()
    
    project_id = "00000000-0000-0000-0000-000000000000"
    
    print("\n1. Testing Discovery Batch (Combinatorial + Deduplication)...")
    try:
        batch = await idea_service.generate_discovery_batch(project_id)
        print(f"✅ Generated {len(batch)} ideas.")
        for idea in batch:
            print(f" - {idea['title']} ({idea.get('industry', 'N/A')})")
        
        if batch:
            target_id = batch[0]['id']
            print(f"\n2. Testing Deep Analysis for Idea: {batch[0]['title']}...")
            analysis = await engine.analyze_discovery_item(target_id)
            print(f"✅ Analysis Score: {analysis['analysis']['opportunity_score']}/10")
            print(f"   Market: {analysis['analysis']['market_size_description']}")
            print(f"   Competitors: {len(analysis['analysis']['competitors'])}")
            
    except Exception as e:
        print(f"❌ Verification failed: {e}")

if __name__ == "__main__":
    asyncio.run(verify_universe())
