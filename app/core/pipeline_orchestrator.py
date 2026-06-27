"""
Pipeline Orchestrator — coordinates multi-stage AI analysis workflows
as background jobs with caching, progress tracking, and fault isolation.

Each pipeline stage runs sequentially with rate-limit delays, caches
results independently, and reports failures without crashing the
entire pipeline.
"""

import asyncio
import json
import logging
import time
from typing import Any, Dict, Optional

from app.core.ai_cache import cache_key, get_cached, set_cached, get_ttl
from app.core.job_queue import job_queue, Job

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Pipeline Handlers (registered with the job queue)
# ---------------------------------------------------------------------------

async def _handle_investment_brief(job: Job, *, idea_data: dict, mode: str = "basic", user_id: Optional[str] = None, **kwargs) -> dict:
    """
    Full investment brief pipeline:
      1. Check cache
      2. Aggregate market signals (competitors, keywords, trends, funding)
      3. Generate AI brief
      4. Cache result
    """
    from app.services.investment_brief_service import InvestmentBriefService

    title = idea_data.get("title", "unknown")
    ck = cache_key("investment_brief", json.dumps(idea_data, sort_keys=True, default=str))

    # Cache check
    cached = get_cached(ck)
    if cached:
        job.progress = 1.0
        logger.info(f"Pipeline: investment_brief for '{title}' served from cache")
        return cached

    job.progress = 0.1

    service = InvestmentBriefService()
    result = await service.generate_brief(
        idea_data=idea_data,
        mode=mode,
        user_id=user_id,
    )

    job.progress = 0.9

    # Serialize for cache
    result_dict = result.model_dump() if hasattr(result, "model_dump") else dict(result)
    set_cached(ck, result_dict, get_ttl("investment_brief"))

    job.progress = 1.0
    return result_dict


async def _handle_market_evidence(job: Job, *, idea: str, idea_id: Optional[str] = None, **kwargs) -> dict:
    """
    Market evidence aggregation pipeline:
      1. Check cache
      2. Run competitors → keywords → trends → funding sequentially
      3. Cache result
    """
    from app.services.market_signal_aggregator import MarketSignalAggregator

    ck = cache_key("market_evidence", idea)

    cached = get_cached(ck)
    if cached:
        job.progress = 1.0
        logger.info(f"Pipeline: market_evidence served from cache")
        return cached

    job.progress = 0.1
    aggregator = MarketSignalAggregator()
    evidence = await aggregator.aggregate_market_data(idea, idea_id)

    job.progress = 0.9
    set_cached(ck, evidence, get_ttl("competitor_analysis"))

    job.progress = 1.0
    return evidence


async def _handle_opportunity_score(job: Job, *, idea: str, startup_id: Optional[str] = None, research: Optional[dict] = None, signals: Optional[list] = None, **kwargs) -> dict:
    """
    Opportunity scoring pipeline with caching.
    """
    from app.services.opportunity_scoring_service import OpportunityScoringService

    ck = cache_key("opportunity_score", idea)

    cached = get_cached(ck)
    if cached:
        job.progress = 1.0
        return cached

    job.progress = 0.1
    service = OpportunityScoringService()
    result = await service.analyze_opportunity(
        idea=idea,
        research=research,
        signals=signals,
        startup_id=startup_id,
    )

    job.progress = 0.9
    result_dict = result.model_dump() if hasattr(result, "model_dump") else dict(result)
    set_cached(ck, result_dict, get_ttl("default"))

    job.progress = 1.0
    return result_dict


async def _handle_idea_discovery(job: Job, *, seed_idea: str, mode: str = "deep", **kwargs) -> dict:
    """
    Idea discovery pipeline.
    """
    from app.workflows.discovery.idea_pipeline import idea_pipeline

    job.progress = 0.1
    result = await idea_pipeline.run_discovery(seed_idea=seed_idea, mode=mode)
    job.progress = 1.0
    return result


# ---------------------------------------------------------------------------
# Register all handlers at import time
# ---------------------------------------------------------------------------
def register_pipeline_handlers():
    """Register all pipeline task handlers with the job queue."""
    job_queue.register("investment_brief", _handle_investment_brief)
    job_queue.register("market_evidence", _handle_market_evidence)
    job_queue.register("opportunity_score", _handle_opportunity_score)
    job_queue.register("idea_discovery", _handle_idea_discovery)
    logger.info("Pipeline orchestrator: All handlers registered")


# Auto-register on import
register_pipeline_handlers()
