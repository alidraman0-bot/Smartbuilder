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
            # 1. Extract Keywords (Base for trends and funding news)
            keywords = await self.market_signal_service.extract_market_keywords(startup_idea, idea_id)
            
            # 2. Parallel fetch for Trends, Competitors, and Funding
            # Use return_exceptions=True to prevent one failure from killing the whole batch
            results = await asyncio.gather(
                self.trend_service.get_trend_signals(keywords[:5], idea_id),
                self.market_signal_service.detect_competitors(startup_idea, idea_id),
                self.funding_service.get_funding_signals(keywords, idea_id),
                return_exceptions=True
            )
            
            trend_signals = results[0] if not isinstance(results[0], Exception) else []
            competitors = results[1] if not isinstance(results[1], Exception) else []
            funding_data = results[2] if not isinstance(results[2], Exception) else {}
            
            if isinstance(results[0], Exception):
                logger.error(f"Trend service failed: {results[0]}")
            if isinstance(results[1], Exception):
                logger.error(f"Competitor service failed: {results[1]}")
            if isinstance(results[2], Exception):
                logger.error(f"Funding service failed: {results[2]}")
            
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
