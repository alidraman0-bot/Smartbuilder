// Institutional-Grade Market Research Type Definitions

export interface InstitutionalResearchData {
    idea_id: string;
    run_id: string;
    status: string;
    confidence_score: number;
    summary: string;
    full_report: string;
    modules: ResearchModule[];

    // Institutional-grade extensions
    context: IdeaContext;
    executive_summary: ExecutiveSummary;
    market_taxonomy: MarketTaxonomy;
    market_economics: MarketEconomics;
    growth_trends: GrowthTrends;
    demand_analysis: DemandAnalysis;
    customer_segmentation: CustomerSegmentation;
    competitive_landscape: CompetitiveLandscape;
    regulatory_factors: RegulatoryFactors;
    monetization_analysis: MonetizationAnalysis;
    risk_analysis: RiskAnalysis;
    synthesis_scorecard: SynthesisScorecard;
    data_sources: DataSource[];
    generated_at: string;
}

export interface IdeaContext {
    idea_name: string;
    industry: string;
    region: string;
    confidence_score: number;
    market_maturity: 'Nascent' | 'Emerging' | 'Growth' | 'Mature' | 'Declining';
    execution_complexity: number; // 1-10
    data_freshness: string; // ISO timestamp
}

export interface ExecutiveSummary {
    market_definition: string;
    core_demand_drivers: string[];
    growth_outlook: string;
    why_now: string;
    strategic_attractiveness: string;
}

export interface MarketTaxonomy {
    primary_market: string;
    sub_markets: string[];
    adjacent_markets: string[];
    substitute_markets: string[];
}

export interface MarketEconomics {
    tam: MarketMetric;
    sam: MarketMetric;
    som: MarketMetric;
    forecast_years: number;
    chart_data: {
        categories: string[];
        tam_values: number[];
        sam_values: number[];
        som_values: number[];
    };
}

export interface MarketMetric {
    value: number; // in billions
    currency: string;
    cagr: number; // percentage
    source: string;
    confidence: 'Low' | 'Medium' | 'High';
}

export interface GrowthTrends {
    trend_signals: TrendSignal[];
    time_series_data: TimeSeriesData[];
    forecast_scenarios: ForecastScenario[];
    seasonal_analysis?: string;
}

export interface TrendSignal {
    type: 'search_volume' | 'media_coverage' | 'product_launches' | 'funding_velocity';
    label: string;
    growth_rate: number; // percentage
    acceleration: 'Accelerating' | 'Steady' | 'Decelerating';
    data_points: number;
}

export interface TimeSeriesData {
    date: string;
    value: number;
    metric: string;
}

export interface ForecastScenario {
    scenario: 'Conservative' | 'Base' | 'Aggressive';
    year_1: number;
    year_3: number;
    year_5: number;
    assumptions: string[];
}

export interface DemandAnalysis {
    demand_sources: DemandSource[];
    pain_intensity_index: PainIntensityIndex;
    key_insights: string[];
}

export interface DemandSource {
    source: 'Reddit' | 'Hacker News' | 'News' | 'Founder Communities' | 'Other';
    discussion_count: number;
    pain_frequency: number; // 1-10
    urgency_score: number; // 1-10
    sample_quotes: string[];
}

export interface PainIntensityIndex {
    overall_score: number; // 1-100
    frequency: number;
    urgency: number;
    emotional_intensity: number;
    repeat_complaints: number;
}

export interface CustomerSegmentation {
    segments: CustomerSegment[];
    jobs_to_be_done: JobsToBeDone;
}

export interface CustomerSegment {
    name: string;
    company_size: string;
    industry_vertical: string;
    geography: string;
    budget_capability: string;
    percentage_of_market: number;
}

export interface JobsToBeDone {
    primary_job: string;
    secondary_jobs: string[];
    current_workarounds: string[];
}

export interface CompetitiveLandscape {
    competitive_matrix: CompetitivePlayer[];
    positioning_map: PositioningMap;
    moat_analysis: MoatAnalysis;
}

export interface CompetitivePlayer {
    name: string;
    target_segment: string;
    pricing_model: string;
    key_strength: string;
    critical_gap: string;
    market_share?: number;
}

export interface PositioningMap {
    x_axis: string; // e.g., "Price"
    y_axis: string; // e.g., "Sophistication"
    players: {
        name: string;
        x: number; // 0-100
        y: number; // 0-100
    }[];
}

export interface MoatAnalysis {
    data_advantage: string;
    switching_costs: string;
    regulatory_complexity: string;
    network_effects?: string;
}

export interface RegulatoryFactors {
    compliance_requirements: string[];
    regional_regulations: RegionalRegulation[];
    industry_standards: string[];
    policy_environment: 'Tailwind' | 'Neutral' | 'Headwind';
    policy_details: string;
}

export interface RegionalRegulation {
    region: string;
    requirements: string[];
    impact: 'Low' | 'Medium' | 'High';
}

export interface MonetizationAnalysis {
    revenue_models: RevenueModel[];
    pricing_benchmarks: PricingBenchmark[];
    unit_economics: UnitEconomics;
}

export interface RevenueModel {
    type: 'Primary' | 'Secondary' | 'Expansion';
    model: string;
    description: string;
    revenue_potential: string;
}

export interface PricingBenchmark {
    comparable_tool: string;
    pricing: string;
    willingness_to_pay_signal: string;
}

export interface UnitEconomics {
    cac_estimate: string;
    ltv_estimate: string;
    margin_potential: string;
    payback_period: string;
    confidence: 'Low' | 'Medium' | 'High';
}

export interface RiskAnalysis {
    risk_categories: RiskCategory[];
    overall_risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface RiskCategory {
    category: 'Market' | 'Technical' | 'Distribution' | 'Regulatory' | 'Financial' | 'Team';
    risks: Risk[];
}

export interface Risk {
    description: string;
    probability: 'Low' | 'Medium' | 'High';
    impact: 'Low' | 'Medium' | 'High';
    mitigation_strategy: string;
}

export interface SynthesisScorecard {
    composite_scores: CompositeScore[];
    final_recommendation: 'BUILD' | 'HOLD' | 'KILL';
    confidence_level: 'Low' | 'Medium' | 'High';
    rationale: string;
    next_steps: string[];
}

export interface CompositeScore {
    dimension: 'Market Attractiveness' | 'Timing' | 'Defensibility' | 'Speed to Revenue';
    score: number; // 1-10
    weight: number; // percentage
    justification: string;
}

export interface DataSource {
    source_name: string;
    data_type: string;
    freshness: string;
    reliability: 'Low' | 'Medium' | 'High';
}

export interface ResearchModule {
    module: string;
    summary: string;
    confidence_score: number;
    signals: string[];
    risks: string[];
}
