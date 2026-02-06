from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

class MemoryEventBase(BaseModel):
    project_id: uuid.UUID
    type: str
    title: str
    description: Optional[str] = None
    artifact_ref_type: Optional[str] = None
    artifact_ref_id: Optional[uuid.UUID] = None
    actor: str
    metadata: Dict[str, Any] = {}

class MemoryEvent(MemoryEventBase):
    id: uuid.UUID
    created_at: datetime

class IdeaMemory(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    title: str
    thesis: str
    source: str
    confidence_score: Optional[int] = None
    status: str = "draft"
    content: Dict[str, Any] = {}
    created_at: datetime
    updated_at: datetime

class ResearchSnapshot(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    idea_id: Optional[uuid.UUID] = None
    market_size: Dict[str, Any] = {}
    trends: List[Dict[str, Any]] = []
    charts: List[Dict[str, Any]] = []
    assumptions: List[Dict[str, Any]] = []
    sources: List[str] = []
    created_at: datetime

class BusinessPlanVersion(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    research_snapshot_id: Optional[uuid.UUID] = None
    content: Dict[str, Any]
    version_number: int
    created_at: datetime

class PRDVersion(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    business_plan_version_id: Optional[uuid.UUID] = None
    content: Dict[str, Any]
    status: str = "draft"
    created_at: datetime

class UserEdit(BaseModel):
    id: uuid.UUID
    artifact_type: str
    artifact_id: uuid.UUID
    edit_type: str
    content: Dict[str, Any]
    user_id: Optional[str] = None
    created_at: datetime
