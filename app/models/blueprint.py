from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
from uuid import UUID


class BlueprintRequest(BaseModel):
    idea: str = Field(..., description="The startup idea to generate a blueprint for")
    research: Optional[Dict[str, Any]] = Field(None, description="Market research data")
    prd: Optional[Dict[str, Any]] = Field(None, description="Product Requirements Document data")
    project_id: Optional[str] = Field(None, description="If provided, blueprint will be linked to this startup project")


class BlueprintResponse(BaseModel):
    name: str = Field(..., description="Suggested startup name")
    problem: str = Field(..., description="The painful problem the startup solves")
    solution: str = Field(..., description="How the startup solves the problem")
    customers: str = Field(..., description="Specific target customers/users")
    market: str = Field(..., description="Market size estimate and opportunity")
    business_model: str = Field(..., description="How the company makes money")
    features: List[str] = Field(..., description="Top core product capabilities")
    tech_stack: str = Field(..., description="Suggested technology architecture")
    go_to_market: str = Field(..., description="How the product acquires first users")
    first_customers: str = Field(..., description="Tactical plan to land first 10 customers")
    build_complexity: str = Field(..., description="Build complexity: Low / Medium / High")
    opportunity_score: float = Field(..., description="1–10 opportunity score")

class BlueprintShareResponse(BaseModel):
    id: UUID
    project_id: UUID
    share_token: UUID
    is_public: bool
    share_url: str
