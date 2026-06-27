import os
import sys
import json
import asyncio
from dotenv import load_dotenv

# Add project root and backend to path
sys.path.append(os.path.abspath("."))
sys.path.append(os.path.abspath("backend"))

load_dotenv()

from backend.services.market_research.ai_analysis import AIAnalysisService

async def test_service():
    print("Initializing AIAnalysisService...")
    service = AIAnalysisService()
    
    print(f"Provider: {service.provider}")
    print(f"Fallbacks: {service.fallbacks}")
    
    idea = "AI-powered resume builder for African graduates"
    mode = "basic"
    raw_data = {"test": "data"}
    
    print("\nAttempting analyze_market...")
    try:
        result = await service.analyze_market(idea, mode, raw_data)
        print("Analysis successful!")
        # print(json.dumps(result, indent=2))
    except AttributeError as e:
        print(f"CAUGHT ATTRIBUTE ERROR: {e}")
    except Exception as e:
        print(f"Caught other error: {e}")

    print("\nAttempting extract_research_queries...")
    try:
        result = await service.extract_research_queries(idea)
        print("Extraction successful!")
        # print(json.dumps(result, indent=2))
    except AttributeError as e:
        print(f"CAUGHT ATTRIBUTE ERROR: {e}")
    except Exception as e:
        print(f"Caught other error: {e}")

if __name__ == "__main__":
    asyncio.run(test_service())
