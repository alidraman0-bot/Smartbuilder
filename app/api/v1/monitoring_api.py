from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services.monitoring_service import monitoring_service

router = APIRouter()

class MonitorAction(BaseModel):
    action: str  # iterate | shutdown

@router.get("/{deployment_id}/status")
async def get_monitoring_status(deployment_id: str):
    """
    Fetch real-time operational health and usage signals.
    """
    try:
        metrics = await monitoring_service.get_metrics(deployment_id)
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{deployment_id}/executive")
async def get_executive_summary(deployment_id: str):
    """
    Fetch high-level executive dashboard metrics.
    """
    try:
        summary = await monitoring_service.get_executive_summary(deployment_id)
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{deployment_id}/logs")
async def get_monitoring_logs(deployment_id: str):
    """
    Retrieve system event logs for debugging.
    """
    logs = await monitoring_service.get_logs(deployment_id)
    return logs

@router.post("/{deployment_id}/action")
async def trigger_monitor_action(deployment_id: str, action_req: MonitorAction):
    """
    Trigger operational decisions (Shutdown or Iterate).
    """
    result = await monitoring_service.handle_action(deployment_id, action_req.action)
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return result
