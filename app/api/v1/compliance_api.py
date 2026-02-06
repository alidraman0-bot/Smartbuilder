from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from app.services.compliance_service import compliance_service

router = APIRouter()

@router.get("/readiness")
async def get_readiness_report():
    """
    Get the full compliance and readiness report.
    """
    try:
        report = await compliance_service.get_readiness_report("default")
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/logs/access")
async def get_access_logs():
    """
    Get immutable access logs.
    """
    try:
        logs = await compliance_service.get_access_logs()
        return logs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
