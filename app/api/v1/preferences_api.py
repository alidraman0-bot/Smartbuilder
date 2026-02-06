from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List
from app.services.preference_service import preference_service
from pydantic import BaseModel

router = APIRouter()

class PreferencesUpdate(BaseModel):
    preferences: Dict[str, Any]

@router.get("/")
async def get_preferences(user_id: str = "current_user"):
    """Get all system preferences for the current user."""
    return preference_service.get_all_preferences(user_id)

@router.post("/update")
async def update_preferences(payload: PreferencesUpdate, user_id: str = "current_user"):
    """Update multiple system preferences."""
    try:
        results = preference_service.set_preferences(user_id, payload.preferences)
        return {"status": "success", "updated": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{key}")
async def get_preference(key: str, user_id: str = "current_user"):
    """Get a specific preference by key."""
    value = preference_service.get_preference(user_id, key)
    return {"key": key, "value": value}

@router.post("/{key}")
async def set_preference(key: str, value: Any, user_id: str = "current_user"):
    """Set a specific preference."""
    try:
        result = preference_service.set_preference(user_id, key, value)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
