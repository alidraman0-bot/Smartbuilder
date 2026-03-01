import asyncio
import logging
import json
from app.services.signal_service import signal_service

logging.basicConfig(level=logging.INFO)

async def test_signals():
    print("Fetching signals...")
    signals = await signal_service.fetch_signals(force_refresh=True)
    print(f"Fetched {len(signals)} signals.")
    for i, s in enumerate(signals[:5]):
        print(f"Signal {i+1}: {s.get('source')} - {s.get('pattern')[:100]}...")
    
    # Check if they are mocks
    sources = [s.get('source') for s in signals]
    if "Hacker News (Mock)" in sources or "Google News (Mock)" in sources:
        print("WARNING: Falling back to mock signals!")

if __name__ == "__main__":
    asyncio.run(test_signals())
