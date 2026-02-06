export type ResourceType = 'playbook' | 'template' | 'benchmark' | 'guide';

export interface ResourceContent {
    // Playbook fields
    when_to_use?: string;
    problem_solves?: string;
    expected_outcome?: string;
    steps?: string[];
    features_involved?: string[];

    // Template fields
    structure?: string[];

    // Benchmark fields
    metric?: string;
    your_value?: string;
    industry_range?: string;
    percentile?: number;
    interpretation?: string;

    // Guide fields
    situation?: string;
    mistake?: string;
    truth?: string;
    support?: string;
}

export interface Resource {
    id: string;
    type: ResourceType;
    title: string;
    description: string;
    stage_relevance: string[];
    content: ResourceContent;
    last_updated: string;
}

export interface IntelligenceInsight {
    text: string;
    sentiment: 'positive' | 'neutral' | 'negative';
}

export interface SuggestedAction {
    text: string;
    resource_id: string;
}

export interface IntelligenceData {
    insights: IntelligenceInsight[];
    suggested_action: SuggestedAction;
}
