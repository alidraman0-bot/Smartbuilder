export interface AICofounderAdvice {
    id?: string;
    project_id: string;
    health_score: number;
    key_insights: string[];
    risks: string[];
    next_actions: string[];
    analysis_context?: any;
    created_at?: string;
    updated_at?: string;
    summary?: string; // Derived from AI response if not in DB directly
}

export interface DeeperAnalysisResponse {
    response: string;
}
