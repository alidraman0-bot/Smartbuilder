import asyncio
import sys
import os
import json

# Ensure app is in path
sys.path.append(os.getcwd())

from app.services.signal_service import signal_service
from app.core.config import settings

async def main():
    print(f"Testing Signal Fetching...")
    print(f"SERPAPI_API_KEY Configured: {bool(settings.SERPAPI_API_KEY)}")
    
    signals = await signal_service.fetch_signals()
    
    print(f"\nFetched {len(signals)} signals.")
    for i, s in enumerate(signals):
        print(f"[{i+1}] Source: {s.get('source')} | Score: {s.get('frequency_score')}")
        print(f"    Pattern: {s.get('pattern')[:100]}...")

if __name__ == "__main__":
    asyncio.run(main())
