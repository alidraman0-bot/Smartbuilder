import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.ai_client import get_ai_client
from app.core.config import settings

router = APIRouter()

class AIRequest(BaseModel):
    prompt: str
    mode: str = "basic"
    max_tokens: int | None = None

@router.post("/api/ai/generate")
async def generate(request: AIRequest):
    """FastAPI proxy that forwards to the central AIClient service.
    Returns the JSON result (or error dict) directly to the caller.
    """
    client = get_ai_client()
    try:
        # Map basic mode to appropriate model task
        task = request.mode if request.mode != "basic" else "default"
        
        # Call the unified fallback chat completion
        response = await client.chat_completion(
            messages=[{"role": "user", "content": request.prompt}],
            max_tokens=request.max_tokens
        )
        return {
            "success": True,
            "content": response.get("content", ""),
            "provider": response.get("provider", ""),
            "model": response.get("model_used", "")
        }
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
