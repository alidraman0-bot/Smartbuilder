from fastapi import APIRouter, Body, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from backend.services.market_research.research_workflow import MarketResearchWorkflow

router = APIRouter()
workflow = MarketResearchWorkflow()

class ResearchRequest(BaseModel):
    idea: str
    mode: str = "basic" # "basic" | "deep"

@router.post("/research")
async def run_market_research(payload: ResearchRequest):
    """
    Triggers the AI market intelligence pipeline.
    """
    if not payload.idea:
        raise HTTPException(status_code=400, detail="Idea is required")
        
    try:
        # In a production system, we might run this as a background task 
        # But for this implementation, we run it and wait for the result
        report = await workflow.run_research(payload.idea, payload.mode)
        return report
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
@router.post("/idea-details")
async def get_idea_details(payload: ResearchRequest):
    """Fetch detailed research report for a given idea (deep mode)."""
    if not payload.idea:
        raise HTTPException(status_code=400, detail="Idea is required")
    try:
        report = await workflow.run_research(payload.idea, "deep")
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

