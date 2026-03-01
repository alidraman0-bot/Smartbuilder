import asyncio
import json
from app.services.startup_verdict_engine import StartupVerdictEngine
from app.models.verdict import VerdictRequest

async def test_verdict_service():
    print("Testing Startup Verdict Engine Service directly...")
    
    engine = StartupVerdictEngine()
    data = VerdictRequest(
        opportunity_score=8.5,
        trend_growth=45.2,
        competitor_count=3,
        funding_activity="Rising",
        market_size="$10B TAM",
        idea="A platform for autonomous startup building using AI agents."
    )
    
    try:
        result = await engine.generate_verdict(data)
        
        print("\nSUCCESS! Verdict generated:")
        print(json.dumps(result.model_dump(), indent=2))
        
    except Exception as e:
        import traceback
        print(f"Failed to run service: {str(e)}")
        print(traceback.format_exc())

if __name__ == "__main__":
    # Ensure environment variables are loaded
    from dotenv import load_dotenv
    load_dotenv()
    
    asyncio.run(test_verdict_service())
