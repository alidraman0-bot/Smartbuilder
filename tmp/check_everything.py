import asyncio
import json
import logging
from app.core.supabase import get_service_client
from app.core.ai_client import get_ai_client
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main():
    sb = get_service_client()
    
    # 1. Check market_signals
    try:
        res = sb.table('market_signals').select('count', count='exact').execute()
        print(f"Market Signals Count: {res.count}")
    except Exception as e:
        print(f"Error checking market_signals: {e}")

    # 2. Check opportunity_runs
    try:
        res = sb.table('opportunity_runs').select('*').order('created_at', desc=True).limit(3).execute()
        print(f"Recent Opportunity Runs: {json.dumps(res.data, indent=2)}")
    except Exception as e:
        print(f"Error checking opportunity_runs: {e}")

    # 3. Test AI Client
    try:
        ai = get_ai_client()
        print(f"AI Provider: {settings.AI_PROVIDER}")
        print(f"Gemini Model: {settings.GEMINI_MODEL}")
        
        response = await ai.chat_completion(
            messages=[{"role": "user", "content": "Say hello"}],
            max_tokens=10
        )
        print(f"AI Connectivity Test: Success! Content: {response['content']}")
    except Exception as e:
        print(f"AI Connectivity Test: FAILED! Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
