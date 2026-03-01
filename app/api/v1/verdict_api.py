from fastapi import APIRouter, Depends, HTTPException
from app.models.verdict import VerdictRequest, VerdictResponse
from app.services.startup_verdict_engine import StartupVerdictEngine
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/verdict", response_model=VerdictResponse)
async def get_startup_verdict(
    payload: VerdictRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Analyzes market research data and provides a final VC-style verdict.
    """
    try:
        engine = StartupVerdictEngine()
        result = await engine.generate_verdict(payload)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
