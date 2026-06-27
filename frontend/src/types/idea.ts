export interface Idea {
    id: string;
    idea_id?: string;
    title: string;
    thesis?: string;
    description?: string; // Support both naming conventions
    market_size?: string;
    problem_bullets?: string[];
    target_customer?: {
        primary_user: string;
        company_size: string;
        industry_or_role: string;
    };
    monetization?: {
        pricing_structure: string;
        who_pays: string;
        value_prop: string;
    };
    why_now_bullets?: string[];
    alternatives_structured?: {
        today: string[];
        gaps: string[];
    };
    mvp_scope_bullets?: string[];
    confidence_reasoning_bullets?: string[];
    risks_structured?: {
        adoption: string;
        technical: string;
        market: string;
    };
    confidence_score?: number;
    market_score?: number;
    execution_complexity?: number;
    opportunity_score?: number;
    is_discovery_only?: boolean;

    // Scoring signals from IdeaCard context
    signals?: any;

    // Real Market Signals Engine
    market_signals?: {
        competitors_detected: number;
        top_competitor: string;
        search_growth: string;
        trend: string;
        funding_activity: string;
        market_momentum: string;
        keywords: string[];
    };
}
