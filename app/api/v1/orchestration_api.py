from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.services.fsm_service import fsm_service

router = APIRouter()

class StartRunRequest(BaseModel):
    opportunity: str

class ApprovalRequest(BaseModel):
    action: str # build | deploy

@router.post("/start")
async def start_run(request: StartRunRequest):
    result = await fsm_service.start_new_run(request.opportunity)
    if isinstance(result, str) and "Failed" in result:
        raise HTTPException(status_code=400, detail=result)
    return result

@router.get("/status")
async def get_status():
    return fsm_service.orchestrator.get_full_status()

@router.post("/approve")
async def approve_gate(request: ApprovalRequest):
    if request.action == "build":
        return await fsm_service.approve_build()
    elif request.action == "deploy":
        return await fsm_service.approve_deployment()
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use 'build' or 'deploy'.")

@router.post("/fail")
async def force_fail(reason: str):
    return await fsm_service.force_fail(reason)
