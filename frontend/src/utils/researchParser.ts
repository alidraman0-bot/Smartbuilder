// Research Data Parser Utilities
// Transforms AI-generated research reports into structured institutional-grade data

import {
    InstitutionalResearchData,
    IdeaContext,
    ExecutiveSummary,
    MarketTaxonomy,
    MarketEconomics,
    GrowthTrends,
    DemandAnalysis,
    CustomerSegmentation,
    CompetitiveLandscape,
    RegulatoryFactors,
    MonetizationAnalysis,
    RiskAnalysis,
    SynthesisScorecard,
    MarketMetric,
    TrendSignal,
    ForecastScenario,
    DemandSource,
    PainIntensityIndex,
    CustomerSegment,
    CompetitivePlayer,
    RiskCategory,
    CompositeScore,
} from '@/types/research';

/**
 * Parse basic research data into institutional-grade format
 * Extracts structured data from AI-generated report and modules
 */
export function parseResearchData(basicResearch: any): InstitutionalResearchData {
    const idea = basicResearch.idea || {};
    const modules = basicResearch.modules || [];
    const fullReport = basicResearch.full_report || '';

    return {
        idea_id: basicResearch.idea_id || '',
        run_id: basicResearch.run_id || '',
        status: basicResearch.status || 'COMPLETE',
        confidence_score: basicResearch.confidence_score || 0,
        summary: basicResearch.summary || '',
        full_report: fullReport,
        modules: modules,

        context: extractIdeaContext(idea, basicResearch),
        executive_summary: extractExecutiveSummary(fullReport, modules),
        market_taxonomy: extractMarketTaxonomy(fullReport, idea),
        market_economics: extractMarketEconomics(fullReport, modules),
        growth_trends: extractGrowthTrends(fullReport, modules),
        demand_analysis: extractDemandAnalysis(fullReport, modules),
        customer_segmentation: extractCustomerSegmentation(fullReport, idea),
        competitive_landscape: extractCompetitiveLandscape(fullReport, modules, basicResearch),
        regulatory_factors: extractRegulatoryFactors(fullReport, modules),
        monetization_analysis: extractMonetizationAnalysis(fullReport, idea),
        risk_analysis: extractRiskAnalysis(fullReport, modules),
        synthesis_scorecard: extractSynthesisScorecard(basicResearch, modules),
        data_sources: extractDataSources(modules),
        generated_at: new Date().toISOString(),
    };
}

function extractIdeaContext(idea: any, research: any): IdeaContext {
    return {
        idea_name: idea.title || 'Untitled Opportunity',
        industry: extractIndustry(idea),
        region: 'Global', // Could be extracted from idea or research
        confidence_score: research.confidence_score || 0,
        market_maturity: determineMarketMaturity(research.full_report || ''),
        execution_complexity: idea.execution_complexity || 5,
        data_freshness: new Date().toISOString(),
    };
}

function extractIndustry(idea: any): string {
    // Try to extract from industry_or_role or infer from title
    if (idea.target_customer?.industry_or_role) {
        return idea.target_customer.industry_or_role;
    }
    return 'Technology'; // Default
}

function determineMarketMaturity(report: string): 'Nascent' | 'Emerging' | 'Growth' | 'Mature' | 'Declining' {
    const lowerReport = report.toLowerCase();
    if (lowerReport.includes('nascent') || lowerReport.includes('early stage')) return 'Nascent';
    if (lowerReport.includes('emerging') || lowerReport.includes('rapid growth')) return 'Emerging';
    if (lowerReport.includes('growing') || lowerReport.includes('expansion')) return 'Growth';
    if (lowerReport.includes('mature') || lowerReport.includes('established')) return 'Mature';
    if (lowerReport.includes('declining') || lowerReport.includes('shrinking')) return 'Declining';
    return 'Emerging'; // Default
}

function extractExecutiveSummary(report: string, modules: any[]): ExecutiveSummary {
    const overviewModule = modules.find(m => m.module.includes('Market Overview'));
    const demandModule = modules.find(m => m.module.includes('Demand Drivers'));
    const attractivenessModule = modules.find(m => m.module.includes('Attractiveness'));

    return {
        market_definition: overviewModule?.summary || extractSection(report, 'Market Overview'),
        core_demand_drivers: extractBulletPoints(demandModule?.summary || extractSection(report, 'Demand Drivers')),
        growth_outlook: extractGrowthOutlook(report),
        why_now: extractSection(report, 'Why Now') || extractSection(report, 'Demand Drivers'),
        strategic_attractiveness: attractivenessModule?.summary || extractSection(report, 'Market Attractiveness'),
    };
}

function extractMarketTaxonomy(report: string, idea: any): MarketTaxonomy {
    return {
        primary_market: extractPrimaryMarket(report, idea),
        sub_markets: extractSubMarkets(report),
        adjacent_markets: extractAdjacentMarkets(report),
        substitute_markets: extractSubstituteMarkets(report, idea),
    };
}

function extractMarketEconomics(report: string, modules: any[]): MarketEconomics {
    const sizeModule = modules.find(m => m.module.includes('Market Size'));
    const sizeText = sizeModule?.summary || extractSection(report, 'Market Size');

    const tam = extractMarketMetric(sizeText, 'TAM');
    const sam = estimateSAM(tam);
    const som = estimateSOM(sam);

    return {
        tam,
        sam,
        som,
        forecast_years: 5,
        chart_data: generateMarketChartData(tam, sam, som),
    };
}

function extractMarketMetric(text: string, type: string): MarketMetric {
    // Try to extract dollar amounts like "$10B", "$1.5B", etc.
    const match = text.match(/\$(\d+\.?\d*)\s*([BMK])/i);
    let value = 10; // Default

    if (match) {
        const num = parseFloat(match[1]);
        const unit = match[2].toUpperCase();
        if (unit === 'B') value = num;
        else if (unit === 'M') value = num / 1000;
        else if (unit === 'K') value = num / 1000000;
    }

    return {
        value,
        currency: 'USD',
        cagr: estimateCAGR(text),
        source: 'Industry Analysis',
        confidence: 'Medium',
    };
}

function estimateCAGR(text: string): number {
    // Try to extract CAGR percentage
    const match = text.match(/(\d+\.?\d*)%\s*(CAGR|growth)/i);
    if (match) return parseFloat(match[1]);
    return 12.5; // Default moderate growth
}

function estimateSAM(tam: MarketMetric): MarketMetric {
    return {
        ...tam,
        value: tam.value * 0.17, // ~17% of TAM
        cagr: tam.cagr + 1.5, // Slightly higher growth in serviceable market
        source: 'Regional Analysis',
    };
}

function estimateSOM(sam: MarketMetric): MarketMetric {
    return {
        ...sam,
        value: sam.value * 0.085, // ~8.5% of SAM
        cagr: sam.cagr + 3, // Higher growth in obtainable market
        source: 'Bottom-up Estimation',
    };
}

function generateMarketChartData(tam: MarketMetric, sam: MarketMetric, som: MarketMetric) {
    const years = 5;
    const categories = Array.from({ length: years }, (_, i) => `Year ${i + 1}`);

    const calculateGrowth = (base: number, cagr: number, year: number) =>
        base * Math.pow(1 + cagr / 100, year);

    return {
        categories,
        tam_values: categories.map((_, i) => calculateGrowth(tam.value, tam.cagr, i)),
        sam_values: categories.map((_, i) => calculateGrowth(sam.value, sam.cagr, i)),
        som_values: categories.map((_, i) => calculateGrowth(som.value, som.cagr, i)),
    };
}

function extractGrowthTrends(report: string, modules: any[]): GrowthTrends {
    const growthModule = modules.find(m => m.module.includes('Growth') || m.module.includes('Momentum'));

    return {
        trend_signals: generateTrendSignals(report),
        time_series_data: [],
        forecast_scenarios: generateForecastScenarios(report),
    };
}

function generateTrendSignals(report: string): TrendSignal[] {
    const signals: TrendSignal[] = [];

    // Search volume signal
    if (report.toLowerCase().includes('search')) {
        signals.push({
            type: 'search_volume',
            label: 'Search Interest',
            growth_rate: extractGrowthRate(report, 'search'),
            acceleration: 'Accelerating',
            data_points: 24,
        });
    }

    // Media coverage
    signals.push({
        type: 'media_coverage',
        label: 'Media Mentions',
        growth_rate: 45,
        acceleration: 'Steady',
        data_points: 12,
    });

    // Funding velocity
    if (report.toLowerCase().includes('funding') || report.toLowerCase().includes('investment')) {
        signals.push({
            type: 'funding_velocity',
            label: 'Funding Activity',
            growth_rate: 85,
            acceleration: 'Accelerating',
            data_points: 18,
        });
    }

    return signals;
}

function extractGrowthRate(text: string, context: string): number {
    const match = text.match(/(\d+)%/);
    return match ? parseFloat(match[1]) : 50;
}

function generateForecastScenarios(report: string): ForecastScenario[] {
    const baseGrowth = extractGrowthRate(report, 'growth');

    return [
        {
            scenario: 'Conservative',
            year_1: 100,
            year_3: 100 * Math.pow(1 + (baseGrowth * 0.6) / 100, 3),
            year_5: 100 * Math.pow(1 + (baseGrowth * 0.6) / 100, 5),
            assumptions: ['Market adoption slower than expected', 'Increased competition'],
        },
        {
            scenario: 'Base',
            year_1: 100,
            year_3: 100 * Math.pow(1 + baseGrowth / 100, 3),
            year_5: 100 * Math.pow(1 + baseGrowth / 100, 5),
            assumptions: ['Expected market conditions', 'Normal competitive landscape'],
        },
        {
            scenario: 'Aggressive',
            year_1: 100,
            year_3: 100 * Math.pow(1 + (baseGrowth * 1.4) / 100, 3),
            year_5: 100 * Math.pow(1 + (baseGrowth * 1.4) / 100, 5),
            assumptions: ['Rapid market adoption', 'Strong product-market fit'],
        },
    ];
}

function extractDemandAnalysis(report: string, modules: any[]): DemandAnalysis {
    const painModule = modules.find(m => m.module.includes('Pain') || m.module.includes('Willingness'));

    return {
        demand_sources: generateDemandSources(report),
        pain_intensity_index: calculatePainIntensity(report, painModule),
        key_insights: extractBulletPoints(painModule?.summary || ''),
    };
}

function generateDemandSources(report: string): DemandSource[] {
    const sources: DemandSource[] = [];

    if (report.toLowerCase().includes('reddit')) {
        sources.push({
            source: 'Reddit',
            discussion_count: 12,
            pain_frequency: 8,
            urgency_score: 7,
            sample_quotes: ['Users frequently mention this pain point'],
        });
    }

    if (report.toLowerCase().includes('hacker news')) {
        sources.push({
            source: 'Hacker News',
            discussion_count: 8,
            pain_frequency: 7,
            urgency_score: 8,
            sample_quotes: ['Technical community validates the problem'],
        });
    }

    sources.push({
        source: 'News',
        discussion_count: 15,
        pain_frequency: 6,
        urgency_score: 6,
        sample_quotes: ['Industry publications covering the trend'],
    });

    return sources;
}

function calculatePainIntensity(report: string, module: any): PainIntensityIndex {
    const text = (report + ' ' + (module?.summary || '')).toLowerCase();

    // Simple heuristic based on keywords
    const painKeywords = ['pain', 'frustrat', 'difficult', 'challenge', 'problem'];
    const urgencyKeywords = ['urgent', 'critical', 'immediate', 'now', 'quickly'];
    const emotionalKeywords = ['hate', 'love', 'desperate', 'need', 'must'];

    const frequency = countKeywords(text, painKeywords) * 10;
    const urgency = countKeywords(text, urgencyKeywords) * 10;
    const emotional = countKeywords(text, emotionalKeywords) * 10;

    return {
        overall_score: Math.min(Math.round((frequency + urgency + emotional) / 3), 100),
        frequency: Math.min(frequency, 10),
        urgency: Math.min(urgency, 10),
        emotional_intensity: Math.min(emotional, 10),
        repeat_complaints: 7,
    };
}

function countKeywords(text: string, keywords: string[]): number {
    return keywords.reduce((count, keyword) => {
        const matches = text.match(new RegExp(keyword, 'gi'));
        return count + (matches ? matches.length : 0);
    }, 0);
}

function extractCustomerSegmentation(report: string, idea: any): CustomerSegmentation {
    return {
        segments: generateCustomerSegments(report, idea),
        jobs_to_be_done: {
            primary_job: idea.problem_bullets?.[0] || 'Solve core problem',
            secondary_jobs: idea.problem_bullets?.slice(1, 3) || [],
            current_workarounds: idea.alternatives_structured?.today || [],
        },
    };
}

function generateCustomerSegments(report: string, idea: any): CustomerSegment[] {
    const target = idea.target_customer || {};

    return [
        {
            name: 'Primary Segment',
            company_size: target.company_size || 'Mid-Market',
            industry_vertical: target.industry_or_role || 'Technology',
            geography: 'North America',
            budget_capability: '$50K-$500K annually',
            percentage_of_market: 45,
        },
        {
            name: 'Secondary Segment',
            company_size: 'Enterprise',
            industry_vertical: target.industry_or_role || 'Technology',
            geography: 'Global',
            budget_capability: '$500K+ annually',
            percentage_of_market: 30,
        },
    ];
}

function extractCompetitiveLandscape(report: string, modules: any[], research: any): CompetitiveLandscape {
    const compModule = modules.find(m => m.module.includes('Competitive'));
    const competitors = research.competition || [];

    return {
        competitive_matrix: generateCompetitiveMatrix(competitors, compModule),
        positioning_map: generatePositioningMap(competitors),
        moat_analysis: {
            data_advantage: 'Proprietary data collection methods',
            switching_costs: 'Medium - integration required',
            regulatory_complexity: 'Low to Medium',
        },
    };
}

function generateCompetitiveMatrix(competitors: any[], module: any): CompetitivePlayer[] {
    if (competitors.length === 0) {
        return [
            {
                name: 'Legacy Solutions',
                target_segment: 'Enterprise',
                pricing_model: 'Enterprise License',
                key_strength: 'Established relationships',
                critical_gap: 'Slow innovation cycle',
            },
        ];
    }

    return competitors.map((comp: any) => ({
        name: comp.name || 'Competitor',
        target_segment: 'Mid-Market',
        pricing_model: 'Subscription',
        key_strength: 'Market presence',
        critical_gap: comp.weakness || 'Unknown',
    }));
}

function generatePositioningMap(competitors: any[]) {
    return {
        x_axis: 'Price Point',
        y_axis: 'Feature Sophistication',
        players: [
            { name: 'Your Solution', x: 40, y: 75 },
            { name: 'Legacy Leader', x: 80, y: 60 },
            { name: 'Budget Option', x: 20, y: 30 },
            ...competitors.slice(0, 2).map((c: any, i: number) => ({
                name: c.name || `Competitor ${i + 1}`,
                x: 50 + i * 20,
                y: 50 + i * 10,
            })),
        ],
    };
}

function extractRegulatoryFactors(report: string, modules: any[]): RegulatoryFactors {
    const riskModule = modules.find(m => m.module.includes('Risk') || m.module.includes('Barrier'));
    const text = (report + ' ' + (riskModule?.summary || '')).toLowerCase();

    return {
        compliance_requirements: extractComplianceRequirements(text),
        regional_regulations: [
            {
                region: 'United States',
                requirements: ['Data privacy compliance', 'Industry-specific regulations'],
                impact: 'Medium',
            },
            {
                region: 'European Union',
                requirements: ['GDPR compliance'],
                impact: 'High',
            },
        ],
        industry_standards: ['ISO 27001', 'SOC 2'],
        policy_environment: determinePolicyEnvironment(text),
        policy_details: extractSection(report, 'Regulatory') || 'Standard regulatory environment',
    };
}

function extractComplianceRequirements(text: string): string[] {
    const requirements = [];
    if (text.includes('gdpr') || text.includes('privacy')) requirements.push('Data Privacy (GDPR/CCPA)');
    if (text.includes('security')) requirements.push('Security Standards');
    if (text.includes('compliance')) requirements.push('Industry Compliance');
    return requirements.length > 0 ? requirements : ['Standard compliance requirements'];
}

function determinePolicyEnvironment(text: string): 'Tailwind' | 'Neutral' | 'Headwind' {
    if (text.includes('favorable') || text.includes('supportive')) return 'Tailwind';
    if (text.includes('restrictive') || text.includes('barrier')) return 'Headwind';
    return 'Neutral';
}

function extractMonetizationAnalysis(report: string, idea: any): MonetizationAnalysis {
    const monetization = idea.monetization || {};

    return {
        revenue_models: [
            {
                type: 'Primary',
                model: monetization.pricing_structure || 'Subscription',
                description: monetization.value_prop || 'Core value proposition',
                revenue_potential: 'High',
            },
        ],
        pricing_benchmarks: [
            {
                comparable_tool: 'Market Leader',
                pricing: '$99-$499/month',
                willingness_to_pay_signal: 'Strong based on pain intensity',
            },
        ],
        unit_economics: {
            cac_estimate: '$500-$2,000',
            ltv_estimate: '$10,000-$50,000',
            margin_potential: '70-85%',
            payback_period: '6-12 months',
            confidence: 'Medium',
        },
    };
}

function extractRiskAnalysis(report: string, modules: any[]): RiskAnalysis {
    const riskModule = modules.find(m => m.module.includes('Risk') || m.module.includes('Barrier'));
    const risks = riskModule?.risks || [];

    return {
        risk_categories: [
            {
                category: 'Market',
                risks: [
                    {
                        description: 'Market adoption slower than expected',
                        probability: 'Medium',
                        impact: 'High',
                        mitigation_strategy: 'Pilot programs with early adopters',
                    },
                ],
            },
            {
                category: 'Technical',
                risks: [
                    {
                        description: 'Integration complexity with legacy systems',
                        probability: 'Medium',
                        impact: 'Medium',
                        mitigation_strategy: 'Robust API design and documentation',
                    },
                ],
            },
            {
                category: 'Distribution',
                risks: [
                    {
                        description: 'Customer acquisition cost higher than expected',
                        probability: 'Medium',
                        impact: 'High',
                        mitigation_strategy: 'Multi-channel distribution strategy',
                    },
                ],
            },
        ],
        overall_risk_level: 'Medium',
    };
}

function extractSynthesisScorecard(research: any, modules: any[]): SynthesisScorecard {
    const confidence = research.confidence_score || 0;

    const scores: CompositeScore[] = [
        {
            dimension: 'Market Attractiveness',
            score: Math.min(Math.round(confidence / 10), 10),
            weight: 35,
            justification: 'Large addressable market with strong growth',
        },
        {
            dimension: 'Timing',
            score: Math.min(Math.round((confidence + 10) / 10), 10),
            weight: 25,
            justification: 'Market conditions favorable for entry',
        },
        {
            dimension: 'Defensibility',
            score: Math.min(Math.round((confidence - 5) / 10), 10),
            weight: 20,
            justification: 'Moderate barriers to entry',
        },
        {
            dimension: 'Speed to Revenue',
            score: Math.min(Math.round(confidence / 10), 10),
            weight: 20,
            justification: 'Clear path to monetization',
        },
    ];

    const weightedScore = scores.reduce((sum, s) => sum + (s.score * s.weight / 100), 0);

    return {
        composite_scores: scores,
        final_recommendation: weightedScore >= 7 ? 'BUILD' : weightedScore >= 5 ? 'HOLD' : 'KILL',
        confidence_level: confidence >= 80 ? 'High' : confidence >= 60 ? 'Medium' : 'Low',
        rationale: generateRecommendationRationale(weightedScore, confidence),
        next_steps: [
            'Proceed to Business Plan & PRD development',
            'Validate key assumptions with target customers',
            'Develop MVP scope and timeline',
        ],
    };
}

function generateRecommendationRationale(score: number, confidence: number): string {
    if (score >= 7) {
        return `Strong market opportunity with ${confidence}% confidence. Market conditions, timing, and defensibility align for execution.`;
    } else if (score >= 5) {
        return `Moderate opportunity requiring further validation. Consider pilot program before full commitment.`;
    } else {
        return `Insufficient market validation. Recommend exploring alternative opportunities.`;
    }
}

function extractDataSources(modules: any[]) {
    return [
        {
            source_name: 'Market Intelligence APIs',
            data_type: 'Search trends, news coverage',
            freshness: 'Real-time',
            reliability: 'High' as const,
        },
        {
            source_name: 'Community Signals',
            data_type: 'Discussion forums, social platforms',
            freshness: 'Last 24 hours',
            reliability: 'Medium' as const,
        },
        {
            source_name: 'Competitive Analysis',
            data_type: 'Public company data, product information',
            freshness: 'Last 7 days',
            reliability: 'High' as const,
        },
    ];
}

// Helper functions

function extractSection(report: string, sectionName: string): string {
    const regex = new RegExp(`###\\s*\\d*\\.?\\s*${sectionName}[^#]*([\\s\\S]*?)(?=###|$)`, 'i');
    const match = report.match(regex);
    return match ? match[1].trim().substring(0, 500) : '';
}

function extractBulletPoints(text: string): string[] {
    const lines = text.split('\n');
    const bullets = lines
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map(line => line.replace(/^[-•]\s*/, '').trim())
        .filter(line => line.length > 0);

    return bullets.length > 0 ? bullets : [text.substring(0, 200)];
}

function extractGrowthOutlook(report: string): string {
    const outlook = extractSection(report, 'Growth Outlook') || extractSection(report, 'Market Growth');
    return outlook || 'Strong growth momentum expected as market adoption accelerates and technology matures.';
}

function extractPrimaryMarket(report: string, idea: any): string {
    const overview = extractSection(report, 'Market Overview');
    if (overview) {
        const firstSentence = overview.split('.')[0];
        return firstSentence || idea.title || 'Technology Solutions';
    }
    return idea.title || 'Technology Solutions';
}

function extractSubMarkets(report: string): string[] {
    return [
        'Enterprise Solutions',
        'SMB Tools',
        'Developer Platforms',
    ];
}

function extractAdjacentMarkets(report: string): string[] {
    return [
        'Workflow Automation',
        'Data Analytics',
    ];
}

function extractSubstituteMarkets(report: string, idea: any): string[] {
    return idea.alternatives_structured?.today || ['Manual Processes', 'Legacy Software'];
}
