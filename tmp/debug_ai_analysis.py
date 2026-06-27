import asyncio
import sys
import os
from dotenv import load_dotenv

sys.path.append(os.path.abspath("backend"))
load_dotenv(".env")

from backend.services.market_research.ai_analysis import AIAnalysisService

async def main():
    service = AIAnalysisService()
    try:
        res = await service.analyze_market("AI SaaS", "basic", {"foo": "bar"})
        print("Market analyzed successfully")
    except Exception as e:
        print("Error in analyze_market:", e)
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    import logging
    logging.basicConfig(level=logging.ERROR)
    asyncio.run(main())
