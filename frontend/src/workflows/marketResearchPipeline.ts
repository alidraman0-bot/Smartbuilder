import { getSearchIntelligence } from './serp';
import { getSocialIntelligence } from './social';
import { scrapeWebIntelligence } from './scraping';
import { getMonitoringSignals } from './monitoring';
import { analyzeMarketIntelligence } from '../services/ai/marketResearchModel';
import { validateMarketReport } from './validation';
import { supabase } from './supabase';
import { insertClickhouse } from './clickhouse';

export async function runMarketResearchPipeline(
    params: { idea: string; industry: string; region: string; depth: string }, 
    onProgress?: (msg: string) => void
) {
    const { idea, industry, region, depth } = params;

    if (onProgress) onProgress("Scanning the internet...");
    const scrapingPromise = scrapeWebIntelligence(industry).catch(e => {
        console.error("Scraping failed:", e);
        return { startups: [], pricingModels: [], features: [] };
    });
    
    if (onProgress) onProgress("Collecting market intelligence...");
    const serpPromise = getSearchIntelligence(idea, region).catch(e => {
        console.error("SERP failed:", e);
        return { trendingKeywords: [], regionalDemand: {}, growthSignals: [], emergingIndustries: [] };
    });
    
    if (onProgress) onProgress("Processing customer pain points...");
    const socialPromise = getSocialIntelligence(idea).catch(e => {
        console.error("Social failed:", e);
        return { painPoints: [], complaints: [], unmetDemand: [], customerFrustrations: [] };
    });

    const [webIntel, searchIntel, socialIntel] = await Promise.all([
        scrapingPromise,
        serpPromise,
        socialPromise
    ]);

    if (onProgress) onProgress("Analyzing competitors...");
    const monitoringIntel = await getMonitoringSignals(webIntel.startups || []).catch(e => {
        console.error("Monitoring failed:", e);
        return { pricingChanges: [], featureLaunches: [] };
    });

    const rawSignals = {
        webIntel,
        searchIntel,
        socialIntel,
        monitoringIntel,
        params
    };

    if (onProgress) onProgress("Building investor-grade report...");
    const report = await analyzeMarketIntelligence(rawSignals);

    validateMarketReport(report);

    // Ensure we handle supabase being potentially unconfigured or failing gracefully
    try {
        const { data: savedReport, error } = await supabase.from('research_reports').insert({
            idea,
            industry,
            region,
            depth,
            report_json: report,
            confidence_score: report.confidence_score || 0
        }).select().single();

        if (savedReport) {
            Promise.all([
                insertClickhouse('market_signals', { report_id: savedReport.id, ...searchIntel }),
                insertClickhouse('social_trends', { report_id: savedReport.id, ...socialIntel })
            ]).catch(e => console.error("Clickhouse insert failed", e));
        } else if (error) {
            console.error("Supabase insert error:", error);
        }
    } catch (dbError) {
        console.error("Database connection failed, returning report without saving.", dbError);
    }

    return report;
}
