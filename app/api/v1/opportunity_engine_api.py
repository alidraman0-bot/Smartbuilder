import logging
from fastapi import APIRouter, Depends, HTTPException, Body
from app.models.opportunity_engine import OpportunityEngineResponse
from app.services.opportunity_engine_service import OpportunityEngineService
from app.api.deps import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/opportunity-engine", response_model=OpportunityEngineResponse)
async def trigger_opportunity_engine(
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
        result = await service.generate_opportunities(user_id=current_user.get('id'))
        return result
    except Exception as e:
        logger.error(f"Opportunity Engine API failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
