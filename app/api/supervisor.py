from fastapi import APIRouter, BackgroundTasks
from app.services.runner import Runner
from pydantic import BaseModel

router = APIRouter()

class RunRequest(BaseModel):
    opportunity: str

runner = Runner()

@router.post("/run")
async def trigger_run(request: RunRequest):
    """
    Trigger a full autonomous run for a given opportunity.
    """
    result = await runner.run_autonomously(request.opportunity)
    return result

@router.get("/status")
def get_status():
    """
    Get current orchestrator state.
    """
    from app.services.fsm_service import orchestrator_singleton
    return orchestrator_singleton.get_full_status()
