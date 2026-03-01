import asyncio
import os
import sys
from dotenv import load_dotenv

# Add the project root to the python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

from app.services.market_signal_service import MarketSignalService

async def test_scraping():
    print("Testing MarketSignalService...")
    service = MarketSignalService()
    
    print("\n--- Testing Reddit ---")
    reddit_signals = await service.fetch_reddit_signals()
    print(f"Found {len(reddit_signals)} Reddit signals")
    if reddit_signals:
        print(f"Sample: {reddit_signals[0]['title']}")
        
    print("\n--- Testing Hacker News ---")
    hn_signals = await service.fetch_hn_signals()
    print(f"Found {len(hn_signals)} HN signals")
    if hn_signals:
        print(f"Sample: {hn_signals[0]['title']}")
        
    print("\n--- Testing Google News ---")
    news_signals = await service.fetch_news_signals()
    print(f"Found {len(news_signals)} News signals")
    if news_signals:
        print(f"Sample: {news_signals[0]['title']}")

    print("\n--- Testing Full get_market_signals ---")
    signals = await service.get_market_signals()
    print(f"Returned {len(signals)} top signals")
    for s in signals[:3]:
        print(f"[{s.source}] {s.signal_strength} - {s.title} ({s.category})")

def main():
    asyncio.run(test_scraping())

if __name__ == "__main__":
    main()
