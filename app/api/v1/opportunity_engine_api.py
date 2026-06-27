import logging
from fastapi import APIRouter, Depends, HTTPException, Body
from app.models.opportunity_engine import OpportunityEngineResponse
from app.services.opportunity_engine_service import OpportunityEngineService
from app.api.deps import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/opportunity-engine", response_model=OpportunityEngineResponse)
async def trigger_opportunity_engine(
    project_id: str = Body(None),
    current_user: dict = Depends(get_current_user)
):
    """
    Triggers the deep analysis pipeline:
    1. Fetch signals
    2. Analyze patterns
    3. Generate 5 venture opportunities
    """
    try:
        service = OpportunityEngineService()
        result = await service.generate_opportunities(
            user_id=current_user.get('id'),
            project_id=project_id
        )
        return result
    except Exception as e:
        logger.error(f"Opportunity Engine API failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analyze-idea/{idea_id}")
async def analyze_idea(
    idea_id: str,
    current_user: dict = Depends(lambda: {"id": "test-user"})
):
    """
    Performs on-demand deep analysis for a specific idea.
    """
    try:
        service = OpportunityEngineService()
        result = await service.analyze_discovery_item(idea_id)
        return result
    except Exception as e:
        logger.error(f"Analysis API failed for idea {idea_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
