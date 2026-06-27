from fastapi import APIRouter
from app.core.supabase import get_service_client
import time

router = APIRouter()

@router.get("/status")
async def get_status():
    """
    Returns the high-level status of the API and its connection to Supabase.
    """
    status = {
        "status": "healthy",
        "timestamp": time.time(),
        "services": {
            "api": "up",
            "supabase": "unknown"
        }
    }
    
    try:
        # Check Supabase connectivity
        client = get_service_client()
        # Simple query to check if we can reach Supabase
        client.table("projects").select("count", count="exact").limit(1).execute()
        status["services"]["supabase"] = "up"
    except Exception as e:
        status["services"]["supabase"] = f"down: {str(e)}"
        status["status"] = "degraded"
        
    return status

@router.get("/ping")
async def ping():
    return {"message": "pong"}
