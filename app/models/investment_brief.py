from pydantic import BaseModel, Field
from typing import List, Dict, Any, Literal, Optional

class MarketSize(BaseModel):
    estimate: str
    range: str
    source_logic: str

class Complexity(BaseModel):
    score: float = Field(..., ge=0, le=10)
    level: Literal["low", "medium", "high"]
    reason: str

class Problem(BaseModel):
    summary: str
    pain_points: List[Any]

class TargetCustomers(BaseModel):
    primary: str
    secondary: List[Any]
    geography: str

class Monetization(BaseModel):
    model: str
    pricing_examples: List[Any]
    revenue_streams: List[Any]

class WhyNow(BaseModel):
    summary: str
    trends: List[Any]  # Flexible to handle strings or dicts from AI
    timing_reason: str

class MVPScope(BaseModel):
    core_features: List[Any]
    tech_stack: List[Any]
    build_time_estimate: str

class Confidence(BaseModel):
    signals_used: List[Any]
    data_points: List[Any]
    reasoning: str

class Risk(BaseModel):
    risk: str
    type: str  # Flexible for AI-generated types
    validation_method: str

class InvestmentBriefResponse(BaseModel):
    title: str
    confidence_score: float = Field(..., ge=0, le=100)
    market_size: MarketSize
    complexity: Complexity
    problem: Problem
    target_customers: TargetCustomers
    monetization: Monetization
    why_now: WhyNow
    market_gaps_today: List[Any]
    mvp_scope: MVPScope
    why_smartbuilder_confident: Confidence
    risks_to_validate: List[Risk]

class IdeaDetailsRequest(BaseModel):
    idea: Dict[str, Any]
    mode: Literal["basic", "deep"] = "basic"
