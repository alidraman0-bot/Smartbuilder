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


@intelligence_router.post("/opportunity-score", response_model=OpportunityIntelligenceResponse)

async def analyze_opportunity(
    payload: OpportunityIntelligenceRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Performs deep 6-factor numeric opportunity intelligence analysis.
    """
    try:
        service = OpportunityScoringService()
        result = await service.analyze_opportunity(
            idea=payload.idea,
            research=payload.research,
            signals=payload.signals,
            startup_id=payload.startup_id
        )
        return result
    except Exception as e:
        logger.error(f"Opportunity Intelligence API failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

