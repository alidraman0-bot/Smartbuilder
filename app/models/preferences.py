from typing import Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

class SystemPreference(BaseModel):
    id: Optional[uuid.UUID] = None
    user_id: str
    key: str
    value: Any
    updated_at: Optional[datetime] = None

class PreferenceUpdate(BaseModel):
    key: str
    value: Any
