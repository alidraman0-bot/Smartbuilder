from typing import List, Optional
from pydantic import BaseModel, Field, conint, HttpUrl
import uuid

# ==================== AGENT CONTRACT SCHEMAS ====================

class StartupIdea(BaseModel):
    idea_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    problem: str
    target_user: str
    monetization: str
    market_score: float = Field(..., ge=0, le=100)
    execution_complexity: float = Field(..., ge=0, le=100)
    confidence_score: float = Field(..., ge=0, le=100)
    reasoning: List[str]

class OpportunityInput(BaseModel):
    run_id: str
    sources: List[str] = ["google_news", "x", "reddit", "hacker_news", "indie_hackers", "bbc_tech", "forbes"]
    constraints: dict = {"ideas_required": 5, "min_confidence": 60}

class OpportunityOutput(BaseModel):
    ideas: List[StartupIdea] = Field(..., min_length=5, max_length=5)

class ResearchInput(BaseModel):
    idea: dict # Nested dict based on StartupIdea fields

class MarketSize(BaseModel):
    estimate: str
    confidence: float = Field(..., ge=0, le=100)

class CompetitionEntry(BaseModel):
    name: str
    weakness: str

class ResearchOutput(BaseModel):
    market_size: MarketSize
    competition: List[CompetitionEntry] = Field(..., min_length=1)
    timing_rationale: str
    validation_score: float = Field(..., ge=0, le=100)
    kill_flag: bool = False

class BusinessPlanPRDInput(BaseModel):
    validated_idea: dict
    research_summary: dict

class BP_BusinessPlan(BaseModel):
    value_proposition: str
    target_customer: str
    pricing_model: str
    go_to_market: str
    success_metrics: List[str]

class PRD_Feature(BaseModel):
    feature_id: str
    description: str

class BP_PRD(BaseModel):
    core_features: List[PRD_Feature] = Field(..., max_length=5)
    non_goals: List[str]
    constraints: dict = {"max_features": 5}

class BusinessPlanPRDOutput(BaseModel):
    business_plan: BP_BusinessPlan
    prd: BP_PRD
    confidence_score: float = Field(..., ge=0, le=100)

class BuildInput(BaseModel):
    prd: dict
    tech_constraints: dict = {"frontend": "Next.js", "backend": "FastAPI"}

class DataModel(BaseModel):
    name: str
    fields: List[str]

class APIEndpoint(BaseModel):
    method: str
    path: str

class PageRoute(BaseModel):
    route: str
    purpose: str

class BuildOutput(BaseModel):
    data_models: List[DataModel]
    api_endpoints: List[APIEndpoint]
    pages: List[PageRoute]

class DeploymentInput(BaseModel):
    build_artifacts: dict

class DeploymentOutput(BaseModel):
    url: str
    version_id: str
    health_check: str # pass | fail

# ==================== EXISTING SCHEMAS (LEGACY/UI SUPPORT) ====================

class ViabilityScore(BaseModel):
    score: conint(ge=0, le=100) = Field(..., description="0-100 score representing business viability")
    confidence: conint(ge=0, le=100) = Field(..., description="Confidence in the assessment")
    reasoning: List[str] = Field(..., description="List of reasons for the score")

class BusinessPlan(BaseModel):
    business_name: str
    one_sentence_summary: str
    target_customer: str
    customer_pain: str
    value_proposition: str
    revenue_model: str
    pricing_strategy: str
    go_to_market_strategy: str
    cost_structure: str
    expected_margins: str
    initial_success_metric: str
    viability_score: int = Field(..., ge=0, le=100)
    go_no_go_decision: bool = Field(..., description="True if the business should proceed to build")

class Feature(BaseModel):
    name: str
    description: str
    revenue_mapping: str = Field(..., description="How this feature supports the revenue model")
    customer_pain_mapping: str = Field(..., description="Which pain point this solves")
    success_metric: str
    
class PRD(BaseModel):
    app_name: str
    features: List[Feature] = Field(..., max_length=5, description="Max 5 features for MVP")
    out_of_scope: List[str] = Field(..., description="Explicitly excluded features")
    user_flow: List[str] = Field(..., description="Step-by-step user journey")
    tech_stack_requirements: List[str]
    
class AgentOutput(BaseModel):
    agent_name: str
    content: dict
    viability: Optional[ViabilityScore] = None


# ==================== DEPLOYMENT SCHEMAS ====================

class DeploymentStage(BaseModel):
    id: str
    label: str
    status: str  # pending | active | completed | failed
    timestamp: Optional[str] = None
    duration: Optional[str] = None
    error: Optional[str] = None


class DeploymentLog(BaseModel):
    time: str
    stage: str
    message: str
    type: str  # info | success | warning | error


class DeploymentInfo(BaseModel):
    deployment_id: str
    run_id: str
    build_id: str
    status: str
    version: str
    url: Optional[str] = None
    environment: str
    region: str
    stages: List[DeploymentStage]
    logs: List[DeploymentLog]
    errors: List[str]
    created_at: str
    completed_at: Optional[str] = None
    health_status: str
    rollback_available: bool

# ==================== MONITORING SCHEMAS ====================

class UsageMetrics(BaseModel):
    dau: int
    requests: int

class MonitoringStatus(BaseModel):
    health_status: str
    uptime: float
    error_rate: float
    response_time_ms: int
    usage: UsageMetrics

class StateRecord(BaseModel):
    run_id: str
    current_state: str
    previous_state: Optional[str] = None
    status: str  # active | failed | completed
    entered_at: str
    exited_at: Optional[str] = None
    metadata: dict = {}
    error: Optional[str] = None


