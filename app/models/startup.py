from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class StartupStage(BaseModel):
    stage: str = Field(..., description="Current stage of the startup (IDEA, RESEARCH, PRD, MVP, LAUNCH, MONITORING)")

class StartupCreate(BaseModel):
    name: str

class ProjectCreate(BaseModel):
    startup_name: str
    idea_id: Optional[UUID] = None

class ProjectUpdate(BaseModel):
    current_stage: Optional[str] = None
    research_id: Optional[UUID] = None
    prd_id: Optional[UUID] = None
    mvp_id: Optional[UUID] = None
    launch_id: Optional[UUID] = None

class ProjectResponse(BaseModel):
    id: UUID
    user_id: UUID
    startup_name: str
    current_stage: str
    idea_id: Optional[UUID] = None
    research_id: Optional[UUID] = None
    prd_id: Optional[UUID] = None
    mvp_id: Optional[UUID] = None
    launch_id: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True

class StartupUpdate(BaseModel):
    name: Optional[str] = None
    current_stage: Optional[str] = None

class StartupProgressResponse(BaseModel):
    id: UUID
    name: str
    current_stage: str

class StartupDB(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    current_stage: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
