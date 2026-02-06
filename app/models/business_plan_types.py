"""
Business Plan & PRD Intelligence Layer - Python Type Definitions
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any
from datetime import datetime


# ==================== CORE TYPES ====================

class EvidenceLink(BaseModel):
    data_source: str
    market_signal: Optional[str] = None
    assumption_confidence: Literal['Low', 'Medium', 'High']
    assumption_id: Optional[str] = None


class IdeaContextBarData(BaseModel):
    idea_name: str
    market_category: str
    confidence_score: float = Field(ge=0, le=100)
    research_depth: float = Field(ge=0, le=100)
    last_updated: str


# ==================== BUSINESS PLAN TYPES ====================

class AssertionWithEvidence(BaseModel):
    text: str
    evidence: EvidenceLink


class ExecutiveSummary(BaseModel):
    """A1. Executive Summary — Decision Narrative"""
    assertions: List[AssertionWithEvidence]
    hidden_system: Dict[str, Any] = Field(default_factory=dict)


class PainEconomics(BaseModel):
    frequency_of_pain: Literal['Daily', 'Weekly', 'Monthly', 'Rare']
    cost_per_user: Dict[str, Any]  # {amount, currency, breakdown}
    aggregate_market_loss: Dict[str, Any]  # {amount, currency}
    behavioral_inertia_score: float = Field(ge=0, le=100)
    why_tolerated: str


class ProblemStatement(BaseModel):
    """A2. Problem Statement — Pain Quantification Engine"""
    pain_economics: PainEconomics
    investor_insight: str


class ReplacementMap(BaseModel):
    replaces: List[str]
    augments: List[str]
    eliminates: List[str]


class SolutionOverview(BaseModel):
    """A3. Solution Overview — Positioning Compiler"""
    positioning_sentence: str
    replacement_map: ReplacementMap


class InflectionPoint(BaseModel):
    year: int
    event: str
    impact: Literal['Positive', 'Negative', 'Neutral']


class RegionalAsymmetry(BaseModel):
    region: str
    readiness_score: float = Field(ge=0, le=100)
    works_first: bool


class MarketOpportunity(BaseModel):
    """A4. Market Opportunity — Capital Justification Engine"""
    tam_sam_som: Dict[str, Any]
    velocity_of_market_creation: Literal['Accelerating', 'Steady', 'Decelerating']
    demand_inflection_points: List[InflectionPoint]
    regulatory_environment: Literal['Tailwinds', 'Neutral', 'Headwinds']
    regulatory_details: str
    regional_asymmetry: List[RegionalAsymmetry]
    market_trajectory: str


class FrictionPoint(BaseModel):
    stage: str
    friction_level: Literal['Low', 'Medium', 'High']
    description: str


class CustomerGTM(BaseModel):
    """A5. Customer & GTM — Distribution Reality Check"""
    primary_acquisition_channel: str
    feasibility_score: float = Field(ge=0, le=100)
    cost_realism_index: float = Field(ge=0, le=100)
    adoption_friction_map: List[FrictionPoint]
    is_weak: bool
    weakness_explanation: Optional[str] = None
    suggested_alternatives: Optional[List[str]] = None


class DefensibilitySimulation(BaseModel):
    scenario: Literal['Big Tech Copies', 'Pricing Collapses', 'Better UX Appears']
    outcome: str
    likelihood: Literal['Low', 'Medium', 'High']


class CompetitionMoat(BaseModel):
    """A6. Competition & Moat — Defensibility Simulator"""
    simulations: List[DefensibilitySimulation]
    survivability_score: float = Field(ge=0, le=100)
    moat_durability_timeline: str
    required_reinvestment_cycles: int


class WTPSignal(BaseModel):
    source: str
    signal: str
    price_point: float
    currency: str


class PriceSensitivityBand(BaseModel):
    tier: str
    price_range_min: float
    price_range_max: float
    expected_conversion: float


class MonetizationEconomics(BaseModel):
    """A7. Monetization & Economics — Reality Economics"""
    willingness_to_pay_signals: List[WTPSignal]
    price_sensitivity_bands: List[PriceSensitivityBand]
    revenue_lag_vs_cost_curve: str
    reality_check_passed: bool


class RiskMitigation(BaseModel):
    strategy: str
    cost: str
    complexity: int = Field(ge=1, le=10)
    time: str


class RiskWithMitigation(BaseModel):
    description: str
    probability: Literal['Low', 'Medium', 'High']
    impact: Literal['Low', 'Medium', 'High']
    mitigation: RiskMitigation


class RiskCategory(BaseModel):
    category: Literal['Structural', 'Executional', 'External']
    risks: List[RiskWithMitigation]


class RisksMitigation(BaseModel):
    """A8. Risks & Mitigation — Founder Honesty Layer"""
    risk_categories: List[RiskCategory]


class InvestmentVerdict(BaseModel):
    """A9. Investment Readiness Verdict — System Judgment"""
    verdict: Literal['BUILD', 'ITERATE', 'ABANDON']
    confidence: float = Field(ge=0, le=100)
    reasoning_summary: Dict[str, List[str]]  # {strong_signals, weak_signals, unknowns}


class BusinessPlanData(BaseModel):
    """Complete Business Plan Intelligence Layer"""
    executive_summary: ExecutiveSummary
    problem_statement: ProblemStatement
    solution_overview: SolutionOverview
    market_opportunity: MarketOpportunity
    customer_gtm: CustomerGTM
    competition_moat: CompetitionMoat
    monetization_economics: MonetizationEconomics
    risks_mitigation: RisksMitigation
    investment_verdict: InvestmentVerdict
    metadata: Dict[str, str]


# ==================== PRD TYPES ====================

class ProductObjective(BaseModel):
    """B1. Product Objective — Single Source of Truth"""
    objective: str
    is_immutable: bool = True
    ripple_effects: Optional[List[str]] = None


class OperationalPersona(BaseModel):
    name: str
    trigger_moment: str
    job_to_be_done: str
    failure_consequence: str


class TargetUsers(BaseModel):
    """B2. Target Users — Operational Personas"""
    personas: List[OperationalPersona]


class UseCase(BaseModel):
    use_case: str
    problem_id: str
    market_signal: str
    revenue_implication: str


class CoreUseCases(BaseModel):
    """B3. Core Use Cases — Demand-to-Feature Map"""
    use_cases: List[UseCase]


class ExecutableFeature(BaseModel):
    name: str
    description: str
    priority: Literal['P0', 'P1', 'P2']
    build_complexity: int = Field(ge=1, le=10)
    dependencies: List[str]
    kill_criteria: str


class MVPFeatureSet(BaseModel):
    """B4. MVP Feature Set — Execution Contract"""
    features: List[ExecutableFeature]


class ExplicitNonGoals(BaseModel):
    """B5. Explicit Non-Goals — Speed Protection"""
    non_goals: List[str]
    enforcement_enabled: bool = True


class UserFlow(BaseModel):
    flow_name: str
    steps: List[str]
    can_convert_to_ui: bool
    can_convert_to_api: bool
    can_convert_to_tests: bool


class UserFlows(BaseModel):
    """B6. User Flows — Pre-Code Blueprint"""
    flows: List[UserFlow]


class TechnicalAssumption(BaseModel):
    assumption: str
    feeds_into: List[str]
    includes: Dict[str, Any]


class TechnicalAssumptions(BaseModel):
    """B7. Technical Assumptions — Risk Surface"""
    assumptions: List[TechnicalAssumption]


class SuccessMetric(BaseModel):
    metric: str
    type: Literal['Minimal', 'Behavioral', 'Actionable']
    answers: str


class SuccessMetrics(BaseModel):
    """B8. Success Metrics — Post-Build Reality"""
    metrics: List[SuccessMetric]


class ReadinessGate(BaseModel):
    gate_name: Literal['Research Sufficient', 'Scope Constrained', 'Risks Known']
    passed: bool
    details: str


class PRDReadinessStatus(BaseModel):
    """B9. PRD Readiness Status — Execution Gate"""
    gates: List[ReadinessGate]
    is_ready: bool
    mvp_builder_unlocked: bool


class PRDData(BaseModel):
    """Complete PRD Intelligence Layer"""
    product_objective: ProductObjective
    target_users: TargetUsers
    core_use_cases: CoreUseCases
    mvp_feature_set: MVPFeatureSet
    explicit_non_goals: ExplicitNonGoals
    user_flows: UserFlows
    technical_assumptions: TechnicalAssumptions
    success_metrics: SuccessMetrics
    readiness_status: PRDReadinessStatus
    metadata: Dict[str, str]
