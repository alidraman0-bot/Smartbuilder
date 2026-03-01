from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime

class AICofounderAdvice(BaseModel):
    id: Optional[UUID] = None
    project_id: UUID
    health_score: float = Field(..., ge=0, le=100)
    key_insights: List[str]
    risks: List[str]
    next_actions: List[str]
    analysis_context: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DeeperAnalysisRequest(BaseModel):
    query: str
