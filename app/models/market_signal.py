from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class MarketSignalBase(BaseModel):
    source: str = Field(..., description="Signal source, e.g., 'reddit', 'hn', 'news'")
    topic: str
    summary: str
    trend_score: int

class MarketSignalCreate(MarketSignalBase):
    pass

class MarketSignal(MarketSignalBase):
    id: Optional[UUID] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class IdeaFromSignalRequest(BaseModel):
    signal_id: Optional[UUID] = None
    title: str
    description: Optional[str] = None
    source: str
