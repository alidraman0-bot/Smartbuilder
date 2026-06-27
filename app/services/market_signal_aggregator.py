import logging
import asyncio
from typing import List, Dict, Any, Optional
from app.services.market_signal_service import MarketSignalService
from app.services.trend_signal_service import TrendSignalService
from app.services.funding_signal_service import FundingSignalService

logger = logging.getLogger(__name__)

class MarketSignalAggregator:
    def __init__(self):
        self.market_signal_service = MarketSignalService()
        self.trend_service = TrendSignalService()
        self.funding_service = FundingSignalService()
    async def aggregate_market_data(self, startup_idea: str, idea_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Coordinates all signals services to build a comprehensive market evidence object.
        """
        try:
            # 1. Startup Sequential Baseline Tasks (FIX 3)
            # Competitor detection
            try:
                competitors = await self.market_signal_service.detect_competitors(startup_idea, idea_id)
            except Exception as e:
                logger.error(f"Competitor service failed: {e}")
                competitors = []

            await asyncio.sleep(1.0) # Rate limit protection

            # 2. Extract Keywords (Checks DB cache first)
            keywords = await self.market_signal_service.extract_market_keywords(startup_idea, idea_id)

            await asyncio.sleep(1.0) # Rate limit protection

            # 3. Sequential fetch for Trends and Funding
            try:
                trend_signals = await self.trend_service.get_trend_signals(keywords[:5], idea_id)
            except Exception as e:
                logger.error(f"Trend service failed: {e}")
                trend_signals = []

            await asyncio.sleep(1.0) # Rate limit protection

            try:
                funding_data = await self.funding_service.get_funding_signals(keywords, idea_id)
            except Exception as e:
                logger.error(f"Funding service failed: {e}")
                funding_data = {}
            
            # Calculate aggregate search growth from trend signals
            avg_growth = 0
            count = 0
            if trend_signals:
                total_growth = 0
                for ts in trend_signals:
                    try:
                        growth_val = int(ts['growth'].replace('%', '').replace('+', ''))
                        total_growth += growth_val
                        count += 1
                    except:
                        continue
                if count > 0:
                    avg_growth = total_growth // count
            
            # Determine overall market momentum
            dominant_momentum = "stable"
            momentum_counts = {"rising": 0, "explosive": 0, "stable": 0, "declining": 0}
            for ts in trend_signals:
                momentum_counts[ts['momentum']] = momentum_counts.get(ts['momentum'], 0) + 1
            
            if momentum_counts["explosive"] > 0:
                dominant_momentum = "rising" # Or "High"
            elif count > 0 and momentum_counts["rising"] >= count / 2:
                dominant_momentum = "rising"

            return {
                "competitors_detected": len(competitors),
                "top_competitors": [c['company_name'] for c in competitors[:3]],
                "search_growth": f"{'+' if avg_growth >= 0 else ''}{avg_growth}%",
                "trend": dominant_momentum,
                "funding_activity": funding_data.get('total_estimated_funding', "N/A"),
                "num_startups_funded": funding_data.get('num_startups_funded', 0),
                "market_momentum": funding_data.get('recent_activity_score', "Medium"),
                "raw_signals": {
                    "keywords": keywords,
                    "trends": trend_signals,
                    "competitors": competitors,
                    "funding": funding_data
                }
            }
            
        except Exception as e:
            logger.error(f"Error in MarketSignalAggregator: {e}")
            return {
                "competitors_detected": 0,
                "search_growth": "0%",
                "trend": "stable",
                "funding_activity": "N/A",
                "market_momentum": "Medium"
            }
