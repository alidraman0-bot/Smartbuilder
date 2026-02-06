from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.services.research_service import research_service
from app.api.supervisor import runner

router = APIRouter()

class ResearchDecisionRequest(BaseModel):
    run_id: str
    decision: str # "APPROVE" or "KILL"

@router.get("/{run_id}")
async def get_research(run_id: str):
    """
    Fetch the current research results for a given run.
    """
    if run_id not in research_service.research_store:
        # If not found, it might be in the orchestrator context or history
        # For now, return 404
        raise HTTPException(status_code=404, detail="Research not found")
    return research_service.research_store[run_id]

@router.post("/decision")
async def handle_decision(request: ResearchDecisionRequest):
    """
    Record the user's decision to approve or kill the idea.
    """
    from app.services.fsm_service import fsm_service
    from app.models.state import SystemState
    
    if request.decision == "APPROVE":
        # Formally transition the FSM to Business Plan & PRD stage
        success = await fsm_service.orchestrator.transition_to(SystemState.BUSINESS_PLAN_PRD)
        if success:
            # Map context for BP/PRD Agent explicitly
            payload = {
                "validated_idea": fsm_service.orchestrator.context.get("idea"),
                "research_summary": fsm_service.orchestrator.context.get("research")
            }
            import asyncio
            asyncio.create_task(fsm_service.orchestrator.execute_current_state(payload))
            return {"status": "success", "message": "Idea approved.", "next_stage": "PLAN"}
        return {"status": "error", "message": "Failed to transition FSM"}
    else:
        await fsm_service.force_fail("User rejected idea after research.")
        return {"status": "success", "message": "Idea discarded.", "next_stage": "HALTED"}
