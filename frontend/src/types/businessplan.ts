// Business Plan & PRD Intelligence Layer Type Definitions

// ==================== CORE TYPES ====================

export interface EvidenceLink {
    data_source: string;
    market_signal?: string;
    assumption_confidence: 'Low' | 'Medium' | 'High';
    assumption_id?: string;
}

export interface IdeaContextBarData {
    idea_name: string;
    market_category: string;
    confidence_score: number; // 0-100
    research_depth: number; // 0-100
    last_updated: string; // ISO timestamp
}

// ==================== BUSINESS PLAN TYPES ====================

export interface BusinessPlanData {
    executive_summary: ExecutiveSummary;
    problem_statement: ProblemStatement;
    solution_overview: SolutionOverview;
    market_opportunity: MarketOpportunity;
    customer_gtm: CustomerGTM;
    competition_moat: CompetitionMoat;
    monetization_economics: MonetizationEconomics;
    risks_mitigation: RisksMitigation;
    investment_verdict: InvestmentVerdict;
    metadata: {
        generated_at: string;
        model_version: string;
    };
}

// A1. Executive Summary — Decision Narrative
export interface ExecutiveSummary {
    assertions: AssertionWithEvidence[];
    hidden_system: {
        confidence_weighted_assertions: string[];
        reasoning_graph?: any;
        assumption_dependencies?: string[];
    };
}

export interface AssertionWithEvidence {
    text: string;
    evidence: EvidenceLink;
}

// A2. Problem Statement — Pain Quantification Engine
export interface ProblemStatement {
    pain_economics: PainEconomics;
    investor_insight: string; // "Is this pain strong enough to force behavior change?"
}

export interface PainEconomics {
    frequency_of_pain: 'Daily' | 'Weekly' | 'Monthly' | 'Rare';
    cost_per_user: {
        amount: number;
        currency: string;
        breakdown: string;
    };
    aggregate_market_loss: {
        amount: number;
        currency: string;
    };
    behavioral_inertia_score: number; // 0-100
    why_tolerated: string;
}

// A3. Solution Overview — Positioning Compiler
export interface SolutionOverview {
    positioning_sentence: string; // "This product wins by doing X instead of Y for Z users."
    replacement_map: ReplacementMap;
}

export interface ReplacementMap {
    replaces: string[];
    augments: string[];
    eliminates: string[];
}

// A4. Market Opportunity — Capital Justification Engine
export interface MarketOpportunity {
    tam_sam_som: {
        tam: number;
        sam: number;
        som: number;
        currency: string;
    };
    velocity_of_market_creation: 'Accelerating' | 'Steady' | 'Decelerating';
    demand_inflection_points: InflectionPoint[];
    regulatory_environment: 'Tailwinds' | 'Neutral' | 'Headwinds';
    regulatory_details: string;
    regional_asymmetry: RegionalAsymmetry[];
    market_trajectory: string; // Answer: "Is this market getting easier or harder to win?"
}

export interface InflectionPoint {
    year: number;
    event: string;
    impact: 'Positive' | 'Negative' | 'Neutral';
}

export interface RegionalAsymmetry {
    region: string;
    readiness_score: number; // 0-100
    works_first: boolean;
}

// A5. Customer & GTM — Distribution Reality Check
export interface CustomerGTM {
    primary_acquisition_channel: string;
    feasibility_score: number; // 0-100
    cost_realism_index: number; // 0-100
    adoption_friction_map: FrictionPoint[];
    is_weak: boolean; // If score < 60
    weakness_explanation?: string;
    suggested_alternatives?: string[];
}

export interface FrictionPoint {
    stage: string; // e.g., "Awareness", "Trial", "Adoption"
    friction_level: 'Low' | 'Medium' | 'High';
    description: string;
}

// A6. Competition & Moat — Defensibility Simulator
export interface CompetitionMoat {
    simulations: DefensibilitySimulation[];
    survivability_score: number; // 0-100
    moat_durability_timeline: string; // e.g., "18-24 months"
    required_reinvestment_cycles: number;
}

export interface DefensibilitySimulation {
    scenario: 'Big Tech Copies' | 'Pricing Collapses' | 'Better UX Appears';
    outcome: string;
    likelihood: 'Low' | 'Medium' | 'High';
}

// A7. Monetization & Economics — Reality Economics
export interface MonetizationEconomics {
    willingness_to_pay_signals: WTPSignal[];
    price_sensitivity_bands: PriceSensitivityBand[];
    revenue_lag_vs_cost_curve: string;
    reality_check_passed: boolean;
}

export interface WTPSignal {
    source: string;
    signal: string;
    price_point: number;
    currency: string;
}

export interface PriceSensitivityBand {
    tier: string; // e.g., "Starter", "Pro", "Enterprise"
    price_range_min: number;
    price_range_max: number;
    expected_conversion: number; // percentage
}

// A8. Risks & Mitigation — Founder Honesty Layer
export interface RisksMitigation {
    risk_categories: RiskCategory[];
}

export interface RiskCategory {
    category: 'Structural' | 'Executional' | 'External';
    risks: RiskWithMitigation[];
}

export interface RiskWithMitigation {
    description: string;
    probability: 'Low' | 'Medium' | 'High';
    impact: 'Low' | 'Medium' | 'High';
    mitigation: {
        strategy: string;
        cost: string; // e.g., "$10K-$50K"
        complexity: number; // 1-10
        time: string; // e.g., "2-4 weeks"
    };
}

// A9. Investment Readiness Verdict — System Judgment
export interface InvestmentVerdict {
    verdict: 'BUILD' | 'ITERATE' | 'ABANDON';
    confidence: number; // 0-100
    reasoning_summary: {
        strong_signals: string[];
        weak_signals: string[];
        unknowns: string[];
    };
}

// ==================== PRD TYPES ====================

export interface PRDData {
    product_objective: ProductObjective;
    target_users: TargetUsers;
    core_use_cases: CoreUseCases;
    mvp_feature_set: MVPFeatureSet;
    explicit_non_goals: ExplicitNonGoals;
    user_flows: UserFlows;
    technical_assumptions: TechnicalAssumptions;
    success_metrics: SuccessMetrics;
    readiness_status: PRDReadinessStatus;
    metadata: {
        generated_at: string;
        model_version: string;
    };
}

// B1. Product Objective — Single Source of Truth
export interface ProductObjective {
    objective: string; // One paragraph, immutable
    is_immutable: boolean;
    ripple_effects?: string[]; // If changed, what gets impacted
}

// B2. Target Users — Operational Personas
export interface TargetUsers {
    personas: OperationalPersona[];
}

export interface OperationalPersona {
    name: string;
    trigger_moment: string;
    job_to_be_done: string;
    failure_consequence: string;
}

// B3. Core Use Cases — Demand-to-Feature Map
export interface CoreUseCases {
    use_cases: UseCase[];
}

export interface UseCase {
    use_case: string;
    problem_id: string; // Links back to problem statement
    market_signal: string;
    revenue_implication: string;
}

// B4. MVP Feature Set — Execution Contract
export interface MVPFeatureSet {
    features: ExecutableFeature[];
}

export interface ExecutableFeature {
    name: string;
    description: string;
    priority: 'P0' | 'P1' | 'P2';
    build_complexity: number; // 1-10
    dependencies: string[]; // Feature names
    kill_criteria: string; // When to remove this feature
}

// B5. Explicit Non-Goals — Speed Protection
export interface ExplicitNonGoals {
    non_goals: string[];
    enforcement_enabled: boolean;
}

// B6. User Flows — Pre-Code Blueprint
export interface UserFlows {
    flows: UserFlow[];
}

export interface UserFlow {
    flow_name: string;
    steps: string[];
    can_convert_to_ui: boolean;
    can_convert_to_api: boolean;
    can_convert_to_tests: boolean;
}

// B7. Technical Assumptions — Risk Surface
export interface TechnicalAssumptions {
    assumptions: TechnicalAssumption[];
}

export interface TechnicalAssumption {
    assumption: string;
    feeds_into: string[]; // e.g., ["MVP Builder", "Base44 workflow"]
    includes: {
        stack_choices?: string[];
        infra_shortcuts?: string[];
        trade_offs?: string[];
    };
}

// B8. Success Metrics — Post-Build Reality
export interface SuccessMetrics {
    metrics: SuccessMetric[];
}

export interface SuccessMetric {
    metric: string;
    type: 'Minimal' | 'Behavioral' | 'Actionable';
    answers: string; // "Should we keep building?"
}

// B9. PRD Readiness Status — Execution Gate
export interface PRDReadinessStatus {
    gates: ReadinessGate[];
    is_ready: boolean;
    mvp_builder_unlocked: boolean;
}

export interface ReadinessGate {
    gate_name: 'Research Sufficient' | 'Scope Constrained' | 'Risks Known';
    passed: boolean;
    details: string;
}
