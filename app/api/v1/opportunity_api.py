from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.services.opportunity_service import opportunity_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class ScoreRequest(BaseModel):
    idea_title: str
    idea_description: str
    market_data: Optional[str] = None

@router.post("/score")
async def score_opportunity(request: ScoreRequest) -> Dict[str, Any]:
    """
    Analyzes an idea and returns structured signals and an opportunity score.
    """
    try:
        result = await opportunity_service.process_opportunity(
            idea_title=request.idea_title,
            idea_description=request.idea_description,
            market_data=request.market_data
        )
        return result
    except Exception as e:
        logger.error(f"Error scoring opportunity: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
