import logging
from fastapi import APIRouter, Depends, HTTPException
from app.models.opportunity_score import (
    OpportunityScoreRequest,
    OpportunityScoreResponse,
    OpportunityIntelligenceRequest,
    OpportunityIntelligenceResponse
)
from app.services.opportunity_scoring_service import OpportunityScoringService
from app.api.deps import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()
intelligence_router = APIRouter()


@router.post("/opportunity-score", response_model=OpportunityScoreResponse)
async def get_opportunity_score(
    payload: OpportunityScoreRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Evaluates a startup idea across 5 venture dimensions.
    """
    try:
        service = OpportunityScoringService()
        result = await service.score_idea(
            idea_text=payload.idea,
            idea_id=payload.idea_id
        )
        return result
    except Exception as e:
        logger.error(f"Scoring API failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@intelligence_router.get("/opportunity-score")
async def get_opportunity_score_info():
    """
    Returns info about the Opportunity Intelligence API.
    Used mainly for browser-based health checks.
    """
    return {
        "status": "active",
        "message": "This is a POST-only endpoint. Please send a startup idea and signals via POST to analyze venture potential.",
        "usage": {
            "method": "POST",
            "body": {
                "idea": "string",
                "signals": "list (optional)",
                "research": "dict (optional)"
            }
        }
    }


@intelligence_router.post("/opportunity-score", response_model=OpportunityIntelligenceResponse)
async def analyze_opportunity(
    payload: OpportunityIntelligenceRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Performs deep 6-factor numeric opportunity intelligence analysis.
    """
    try:
        import asyncio
        service = OpportunityScoringService()
        
        # Use a generous timeout for deep intelligence analysis
        # If it takes too long, we return a graceful fallback rather than timing out the socket
        try:
            result = await asyncio.wait_for(
                service.analyze_opportunity(
                    idea=payload.idea,
                    research=payload.research,
                    signals=payload.signals,
                    startup_id=payload.startup_id
                ),
                timeout=60.0
            )
            return result
        except asyncio.TimeoutError:
            logger.warning(f"Opportunity Intelligence timed out for idea: {payload.idea[:50]}...")
            # Return a reasonable baseline/fallback response
            return OpportunityIntelligenceResponse(
                opportunity_score=5.0,
                demand_score=5.0,
                market_size_score=5.0,
                competition_score=5.0,
                revenue_score=5.0,
                trend_score=5.0,
                difficulty_score=5.0,
                summary="Intelligence engine is currently processing high volume. This is an estimated baseline analysis. Please try again in a moment for deeper signals.",
                market_evidence=None
            )
    except Exception as e:
        logger.error(f"Opportunity Intelligence API failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

