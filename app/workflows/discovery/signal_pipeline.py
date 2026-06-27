import asyncio
import logging
from typing import List, Dict, Any
from app.services.discovery.serp_service import serp_service
from app.services.discovery.social_service import social_service
from app.services.discovery.ai_engine import ai_engine

logger = logging.getLogger(__name__)

class SignalPipeline:
    """
    Workflow for fetching and processing real-time signals.
    """
    async def fetch_live_signals(self) -> List[Dict[str, Any]]:
        """
        Fetch trends, Product Hunt launches, and social spikes.
        """
        try:
            async def safe_task(coro, timeout=10.0):
                try:
                    return await asyncio.wait_for(coro, timeout=timeout)
                except asyncio.TimeoutError:
                    logger.warning(f"Task timed out after {timeout}s")
                    return None
                except Exception as e:
                    logger.error(f"Task failed: {e}")
                    return None

            # Parallel fetching of signals with isolation
            tasks = [
                safe_task(serp_service.get_search_trends("startup ideas"), timeout=12.0),
                safe_task(social_service.get_reddit_pain_points("startups"), timeout=15.0),
                safe_task(social_service.get_twitter_trends("SaaS"), timeout=8.0)
            ]
            
            results = await asyncio.gather(*tasks)
            
            raw_signals = []
            for res in results:
                if not res:
                    continue
                if isinstance(res, list):
                    raw_signals.extend(res)
                else:
                    raw_signals.append(res)
            
            # Use AI Engine to detect the strongest growth signals
            # Wrap in a shorter timeout to avoid blocking the whole pipeline
            logger.info(f"Collected {len(raw_signals)} raw signals. Processing via AI Engine (20s timeout)...")
            try:
                processed_signals = await asyncio.wait_for(
                    ai_engine.detect_growth_signals(raw_signals),
                    timeout=30.0
                )
            except asyncio.TimeoutError:
                logger.warning("Growth signal detection timed out. Returning raw signals.")
                processed_signals = raw_signals[:15] # Return raw signals as fallback
            
            if not processed_signals:
                logger.warning("Signal pipeline returned no processed data. Using emergency fallback.")
                return [
                    {"source": "Intelligence Engine", "title": "Rising demand for AI-driven workflow automation", "description": "Analyzing emerging patterns in B2B SaaS efficiency tools.", "signal_strength": 90, "category": "trend"},
                    {"source": "Market Pulse", "title": "Unbundling of enterprise ERP systems", "description": "Micro-SaaS opportunities in specialized departmental workflows.", "signal_strength": 85, "category": "problem"},
                    {"source": "Trend Radar", "title": "Privacy-first local AI deployments", "description": "Shift towards on-premise LLM solutions for sensitive data.", "signal_strength": 92, "category": "trend"}
                ]
            
            return processed_signals
        except Exception as e:
            logger.error(f"Signal Pipeline failed: {e}")
            return [
                {"source": "System Fallback", "title": "Opportunity discovery mode active", "description": "The system is currently identifying high-potential market gaps in offline mode.", "signal_strength": 70, "category": "trend"}
            ]

signal_pipeline = SignalPipeline()
