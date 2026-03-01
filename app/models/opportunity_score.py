from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


# ── New numeric intelligence models ────────────────────────────────────────────

class OpportunityIntelligenceRequest(BaseModel):
    idea: str = Field(..., description="The startup idea to evaluate")
    research: Optional[Dict[str, Any]] = Field(None, description="Market research context")
    signals: Optional[List[Dict[str, Any]]] = Field(None, description="Market/trend signals")
    startup_id: Optional[str] = Field(None, description="Link result to a startup record")


class MarketEvidence(BaseModel):
    competitors_detected: int
    top_competitors: List[str]
    search_growth: str
    trend: str
    funding_activity: str
    num_startups_funded: int
    market_momentum: str


class OpportunityIntelligenceResponse(BaseModel):
    opportunity_score: float = Field(..., description="Composite score 1–10 (formula-based)")
    demand_score: float = Field(..., description="Market Demand 1–10")
    market_size_score: float = Field(..., description="Market Size 1–10")
    competition_score: float = Field(..., description="Competition Level 1–10")
    revenue_score: float = Field(..., description="Revenue Potential 1–10")
    trend_score: float = Field(..., description="Trend Momentum 1–10")
    difficulty_score: float = Field(..., description="Build Difficulty 1–10")
    summary: str = Field(..., description="VC-style narrative verdict")
    market_evidence: Optional[MarketEvidence] = Field(None, description="Real-world market data signals")


# ── Legacy qualitative models (kept for backward compat with engine service) ───

class ScoreData(BaseModel):
    score: float = Field(..., description="Overall opportunity score 0–10")
    market_demand: str = Field(..., description="High, Medium, or Low")
    competition: str = Field(..., description="High, Medium, or Low")
    revenue_potential: str = Field(..., description="High, Medium, or Low")
    build_difficulty: str = Field(..., description="High, Medium, or Low")
    trend: str = Field(..., description="Rising, Stable, or Declining")
    summary: str = Field(..., description="Brief qualitative evaluation")
    market_evidence: Optional[MarketEvidence] = Field(None, description="Aggregated market signals")


class OpportunityScoreRequest(BaseModel):
    idea: str
    idea_id: Optional[str] = None


class OpportunityScoreResponse(BaseModel):
    score_data: ScoreData


class OpportunityScoreDB(BaseModel):
    id: Optional[UUID] = None
    idea_id: str
    score: float
    market_demand: str
    competition: str
    revenue_potential: str
    build_difficulty: str
    trend: str
    summary: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
