from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.services.builder_service import builder_service
from app.services.business_plan_service import business_plan_service
from app.services.prd_service import prd_service
from app.api.supervisor import runner

router = APIRouter()

class BuilderDecisionRequest(BaseModel):
    run_id: str
    decision: str # "APPROVE" or "KILL"

class BusinessPlanRequest(BaseModel):
    idea: Dict[str, Any]
    research: Dict[str, Any]
    run_id: Optional[str] = None

class PRDRequest(BaseModel):
    idea: Dict[str, Any]
    business_plan: Dict[str, Any]
    run_id: Optional[str] = None

@router.post("/business-plan")
async def generate_business_plan(request: BusinessPlanRequest):
    """
    Generate comprehensive, evidence-linked business plan.
    """
    try:
        result = await business_plan_service.generate_business_plan(
            idea=request.idea,
            research=request.research,
            run_id=request.run_id
        )
        return result
    except Exception as e:
        import traceback
        # Capture traceback
        tb_str = traceback.format_exc()
        import logging
        logging.getLogger(__name__).error(tb_str)
        raise HTTPException(status_code=500, detail=f"Business plan generation failed: {str(e)}\n\nTraceback:\n{tb_str}")

@router.post("/prd")
async def generate_prd(request: PRDRequest):
    """
    Generate comprehensive PRD with execution contracts.
    """
    try:
        result = await prd_service.generate_prd(
            idea=request.idea,
            business_plan=request.business_plan,
            run_id=request.run_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PRD generation failed: {str(e)}")

@router.get("/business-plan/{run_id}")
async def get_business_plan(run_id: str):
    """
    Retrieve stored business plan by run_id.
    """
    result = business_plan_service.get_business_plan(run_id)
    if not result:
        raise HTTPException(status_code=404, detail="Business plan not found")
    return result

@router.get("/prd/{run_id}")
async def get_prd(run_id: str):
    """
    Retrieve stored PRD by run_id.
    """
    result = prd_service.get_prd(run_id)
    if not result:
        raise HTTPException(status_code=404, detail="PRD not found")
    return result

@router.get("/{run_id}")
async def get_builder_artifacts(run_id: str):
    """
    Fetch the business plan and PRD for a given run.
    """
    # In a real system, we'd fetch this from a persistent store or the orchestrator context
    # For now, we'll check the runner's orchestrator context
    if runner.orchestrator.run_id == run_id:
        bp_prd = runner.orchestrator.context.get("business_plan_prd", {})
        return {
            "business_plan": bp_prd.get("business_plan"),
            "prd": bp_prd.get("prd")
        }
    
    raise HTTPException(status_code=404, detail="Run not found or artifacts not generated")

@router.post("/decision")
async def handle_decision(request: BuilderDecisionRequest):
    """
    Record user approval for the generated PRD.
    """
    from app.services.fsm_service import fsm_service
    
    if request.decision == "APPROVE":
        # Use the fsm_service's formal approval gate
        result = await fsm_service.approve_build()
        if result["status"] == "SUCCESS":
            # Fire and forget the build construction sequence
            import asyncio
            asyncio.create_task(fsm_service.runner.initiate_mvp_build())
            return {"status": "success", "message": "Build authorized."}
        return {"status": "error", "message": result["message"]}
    else:
        runner.orchestrator.log_event("BUILDER", "Project halted by user during planning stage.", "warning")
        return {"status": "success", "message": "Project halted.", "next_stage": "HALTED"}
