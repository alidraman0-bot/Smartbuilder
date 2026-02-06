
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from app.services.analytics_service import analytics_service

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_summary():
    """
    Get aggregated dashboard statistics.
    """
    try:
        stats = await analytics_service.get_dashboard_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/activity")
async def get_activity_feed(limit: int = 20):
    """
    Get recent activity logs.
    """
    try:
        from app.core.supabase import supabase
        res = supabase.table("activity_logs")\
            .select("*")\
            .order("timestamp", desc=True)\
            .limit(limit)\
            .execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
