import logging
from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID
from typing import Optional, Dict
from app.models.ai_cofounder import AICofounderAdvice, DeeperAnalysisRequest
from app.services.ai_cofounder_service import ai_cofounder_service
from app.api.deps import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/{project_id}", response_model=Optional[AICofounderAdvice])
async def get_cofounder_advice(
    project_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """Fetches the latest AI Co-Founder advice for a project."""
    # Note: Ownership check happens inside the service via Supabase RLS 
    # but we could also do it explicitly here if needed.
    advice = await ai_cofounder_service.get_latest_advice(project_id)
    return advice

@router.post("/{project_id}/generate", response_model=AICofounderAdvice)
async def generate_cofounder_advice(
    project_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """Generates fresh AI Co-Founder advice for a project."""
    advice = await ai_cofounder_service.generate_advice(project_id)
    if not advice:
        raise HTTPException(status_code=500, detail="Failed to generate advice")
    return advice

@router.post("/{project_id}/analyze", response_model=Dict[str, str])
async def deeper_analysis(
    project_id: UUID,
    payload: DeeperAnalysisRequest,
    current_user: dict = Depends(get_current_user)
):
    """Provides a deeper analysis on a specific query."""
    response = await ai_cofounder_service.deeper_analysis(project_id, payload.query)
    return {"response": response}
