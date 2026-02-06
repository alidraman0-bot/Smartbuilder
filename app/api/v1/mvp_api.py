from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.services.mvp_service import mvp_service
from app.api.supervisor import runner

router = APIRouter()

@router.get("/{run_id}/status")
async def get_build_status(run_id: str):
    """
    Fetch the current build status, logs, and files for a run.
    """
    status = mvp_service.get_build_status(run_id)
    if not status:
        raise HTTPException(status_code=404, detail="Build not found")
    return status

@router.post("/{run_id}/start")
async def start_build(run_id: str):
    """
    Explicitly start a build from an approved PRD.
    """
    # Get PRD from orchestrator context
    prd = runner.orchestrator.context.get("prd")
    if not prd:
        raise HTTPException(status_code=400, detail="No PRD available. Approve a PRD first.")
    
    # Check if build already exists
    existing = mvp_service.get_build_status(run_id)
    if existing:
        return existing
    
    # Start new build
    return await mvp_service.start_build(run_id, prd)

@router.post("/{run_id}/abort")
async def abort_build(run_id: str):
    """
    Abort an ongoing build.
    """
    success = mvp_service.abort_build(run_id)
    if not success:
        raise HTTPException(status_code=400, detail="Build cannot be aborted (not found or already completed)")
    return {"status": "aborted", "message": "Build abortion initiated"}

@router.post("/deploy")
async def deploy_mvp(request: Dict[str, str]):
    """
    Final deployment trigger.
    """
    run_id = request.get("run_id")
    if not run_id:
        raise HTTPException(status_code=400, detail="run_id required")
    
    # In this prototype, we just transition the orchestrator to completed
    if runner.orchestrator.run_id == run_id:
        await runner.orchestrator.transition_to("COMPLETED")
        runner.orchestrator.log_event("DEPLOYMENT", "System deployed to production env.", "success")
        return {"status": "success", "message": "Deployment successful."}
    
    raise HTTPException(status_code=404, detail="Run not found")
