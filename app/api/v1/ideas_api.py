from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any, Literal
from app.services.idea_service import idea_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class GenerateRequest(BaseModel):
    mode: Literal["validate_idea", "discover"]
    user_input: Optional[str] = None

class PromoteRequest(BaseModel):
    idea_id: str

@router.post("/generate")
async def generate_ideas(request: GenerateRequest):
    """
    Generate or validate startup ideas based on live signals.
    Mode: "validate_idea" (requires user_input) or "discover".
    """
    try:
        ideas = await idea_service.generate_ideas(
            mode=request.mode, 
            user_input=request.user_input
        )
        return {"ideas": ideas}
    except Exception as e:
        logger.error(f"Error in generate_ideas API: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

from app.api.supervisor import runner
import asyncio

@router.post("/promote")
async def promote_idea(request: PromoteRequest):
    """
    Promote an idea to the Research stage.
    """
    result = idea_service.promote_idea(request.idea_id)
    if result["status"] == "error":
        raise HTTPException(status_code=404, detail=result["message"])
    
    # Trigger the research and planning phase for the selected idea
    # We use create_task to run it in the background so the API returns immediately
    asyncio.create_task(runner.start_research_from_idea(result["idea"]))
    
    return result

@router.get("/debug/history")
async def debug_history():
    """
    Debug endpoint to see what's in the idea history.
    """
    return {
        "instance_id": idea_service.instance_id,
        "history_keys": list(idea_service.history.keys()),
        "history_count": len(idea_service.history)
    }
