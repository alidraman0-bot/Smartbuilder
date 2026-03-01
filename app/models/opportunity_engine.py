from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class OpportunityIdea(BaseModel):
    title: str = Field(..., description="Short catchy name for the product")
    problem: str = Field(..., description="The main unsolved problem being addressed")
    target_customer: str = Field(..., description="Who this is for")
    market_hint: str = Field(..., description="Short insight into market potential or size")
    why_now: str = Field(..., description="Why this is a good idea right now based on signals")

class OpportunityEngineResponse(BaseModel):
    ideas: List[OpportunityIdea]

class OpportunityRun(BaseModel):
    id: Optional[UUID] = None
    user_id: Optional[UUID] = None
    signals_used: List[dict]
    ideas_generated: List[dict]
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
