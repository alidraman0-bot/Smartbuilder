from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List
from app.services.founder_service import founder_service

router = APIRouter()

@router.get("/snapshot")
async def get_snapshot():
    return await founder_service.get_executive_snapshot()

@router.get("/infra")
async def get_infra():
    return await founder_service.get_system_infra_health()

@router.get("/ai-engine")
async def get_ai_engine():
    return await founder_service.get_ai_engine_status()

@router.get("/failures")
async def get_failures():
    return await founder_service.get_failure_intelligence()

@router.get("/revenue-risk")
async def get_revenue_risk():
    return await founder_service.get_revenue_risk_data()

@router.get("/vcs-health")
async def get_vcs_health():
    return await founder_service.get_vcs_metrics()

@router.post("/feature-flag")
async def update_flag(data: Dict[str, Any]):
    flag = data.get("flag")
    value = data.get("value")
    if flag is None or value is None:
        raise HTTPException(status_code=400, detail="Missing flag or value")
    return await founder_service.update_feature_flag(flag, value)

@router.post("/emergency")
async def trigger_emergency(data: Dict[str, Any]):
    action = data.get("action")
    if not action:
        raise HTTPException(status_code=400, detail="Missing action")
    return await founder_service.trigger_emergency_mode(action)

@router.post("/rollback-org-wide")
async def rollback_org_wide():
    # CEO level action
    return await vcs_service.trigger_rollback("all", "last_stable_global")

@router.post("/rollback-project")
async def rollback_project(data: Dict[str, Any]):
    project_id = data.get("project_id")
    target_sha = data.get("target_sha", "last_stable")
    if not project_id:
        raise HTTPException(status_code=400, detail="Missing project_id")
    return await vcs_service.trigger_rollback(project_id, target_sha)

@router.get("/status")
async def get_founder_status():
    return {
        "system_status": founder_service.system_status,
        "emergency_mode": founder_service.emergency_mode,
        "feature_flags": founder_service.feature_flags
    }
