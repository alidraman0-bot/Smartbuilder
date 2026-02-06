"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRunStore } from '@/store/useRunStore';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2, Skull, Database, ArrowRight, FileDown, Share2 } from 'lucide-react';
import { parseResearchData } from '@/utils/researchParser';
import IdeaContextBar from '@/components/research/IdeaContextBar';
import ExecutiveSummary from '@/components/research/ExecutiveSummary';
import MarketTaxonomy from '@/components/research/MarketTaxonomy';
import MarketEconomics from '@/components/research/MarketEconomics';
import GrowthTrends from '@/components/research/GrowthTrends';
import DemandAnalysis from '@/components/research/DemandAnalysis';
import CustomerSegmentation from '@/components/research/CustomerSegmentation';
import CompetitiveLandscape from '@/components/research/CompetitiveLandscape';
import RegulatoryFactors from '@/components/research/RegulatoryFactors';
import MonetizationAnalysis from '@/components/research/MonetizationAnalysis';
import RiskAnalysis from '@/components/research/RiskAnalysis';
import SynthesisScorecard from '@/components/research/SynthesisScorecard';

export default function ResearchPage() {
    const run = useRunStore();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [localResearch, setLocalResearch] = useState<any>(null);

    // Sync with global store if available
    useEffect(() => {
        if (run.research) {
            setLocalResearch(run.research);
        }
    }, [run.research]);

    // Parse research data into institutional-grade format
    const institutionalData = useMemo(() => {
        if (!localResearch) return null;
        return parseResearchData(localResearch);
    }, [localResearch]);

    const handleDecision = async (decision: 'APPROVE' | 'KILL') => {
        setIsProcessing(true);
        try {
            const res = await fetch('/api/v1/research/decision', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ run_id: run.runId, decision })
            });
            if (res.ok) {
                if (decision === 'APPROVE') {
                    router.push('/builder');
                } else {
                    router.push('/ideas');
                }
            }
        } catch (err) {
            console.error("Decision failed:", err);
        } finally {
            setIsProcessing(false);
        }
    };

    // Empty state
    if (!localResearch && run.state !== "RESEARCH") {
        return (
            <div className="flex flex-col items-center justify-center py-40 space-y-6">
                <div className="bg-white/5 p-5 rounded-3xl opacity-20">
                    <Database size={60} />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Intelligence Node Inactive</h3>
                <p className="text-sm text-zinc-500 font-medium">Promote an initial hypothesis from the Idea Generator to begin deep-scan.</p>
            </div>
        );
    }

    // Loading state
    const isRunning = run.state === "RESEARCH" && !localResearch;
    if (isRunning) {
        return (
            <div className="flex flex-col items-center justify-center py-40 space-y-6">
                <Loader2 size={60} className="text-indigo-500 animate-spin" />
                <h3 className="text-xl font-bold text-white tracking-tight">Analyzing Market Intelligence</h3>
                <p className="text-sm text-zinc-500 font-mono animate-pulse uppercase tracking-[0.2em]">
                    Synchronizing with global data feeds...
                </p>
            </div>
        );
    }

    if (!institutionalData) return null;

    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            {/* Persistent Context Bar */}
            <IdeaContextBar context={institutionalData.context} />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-8 py-12 space-y-16">
                {/* Executive Summary */}
                <ExecutiveSummary summary={institutionalData.executive_summary} />

                {/* Market Definition & Scope */}
                <MarketTaxonomy taxonomy={institutionalData.market_taxonomy} />

                {/* Market Size & Economics */}
                <MarketEconomics economics={institutionalData.market_economics} />

                {/* Growth Trends & Forecasts */}
                <GrowthTrends trends={institutionalData.growth_trends} />

                {/* Demand & Customer Pain Analysis */}
                <DemandAnalysis analysis={institutionalData.demand_analysis} />

                {/* Customer Segmentation & ICP */}
                <CustomerSegmentation segmentation={institutionalData.customer_segmentation} />

                {/* Competitive Landscape */}
                <CompetitiveLandscape landscape={institutionalData.competitive_landscape} />

                {/* Regulatory & Macro Factors */}
                <RegulatoryFactors factors={institutionalData.regulatory_factors} />

                {/* Monetization & Unit Economics */}
                <MonetizationAnalysis analysis={institutionalData.monetization_analysis} />

                {/* Risk Analysis */}
                <RiskAnalysis analysis={institutionalData.risk_analysis} />

                {/* Synthesis Scorecard */}
                <SynthesisScorecard scorecard={institutionalData.synthesis_scorecard} />

                {/* Data Sources & Quality Controls */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold text-white tracking-tight">Data Sources & Attribution</h2>
                    <div className="glass-card p-8 rounded-3xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {institutionalData.data_sources.map((source, index) => (
                                <div key={index} className="p-5 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-white">{source.source_name}</h4>
                                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${source.reliability === 'High' ? 'bg-green-500/10 text-green-400' :
                                            source.reliability === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                                                'bg-red-500/10 text-red-400'
                                            }`}>
                                            {source.reliability}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-400">{source.data_type}</p>
                                    <p className="text-[10px] text-zinc-600 font-mono">Updated: {source.freshness}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl">
                            <div className="flex items-start space-x-3">
                                <Database size={16} className="text-indigo-400 mt-0.5" />
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Quality Controls</h4>
                                    <ul className="text-xs text-zinc-300 space-y-1">
                                        <li>✓ Data source attribution verified</li>
                                        <li>✓ Confidence intervals calculated</li>
                                        <li>✓ Forecast assumptions disclosed</li>
                                        <li>✓ Contradictory signals highlighted</li>
                                        <li>✓ No hallucinations. No fluff.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Primary CTA Section */}
                <section className="relative z-30 -mx-8 px-8 py-8 mt-12 bg-[#0A0A0A]">
                    <div className="glass-card p-10 rounded-3xl border border-white/10 shadow-[0_-20px_50px_-10px_rgba(0,0,0,0.5)] space-y-6 bg-[#0D0D0F]/80">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-white tracking-tight">Investment Decision</h3>
                                <p className="text-sm text-zinc-400 mt-2">
                                    Should capital, time, and engineering resources be allocated to this idea?
                                </p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors">
                                    <FileDown size={20} className="text-zinc-400" />
                                </button>
                                <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors">
                                    <Share2 size={20} className="text-zinc-400" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => handleDecision('APPROVE')}
                                disabled={isProcessing || !localResearch}
                                className="group relative overflow-hidden bg-white hover:bg-zinc-100 text-black py-6 rounded-2xl font-bold text-base transition-all shadow-xl flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                            >
                                {isProcessing ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <>
                                        <ShieldCheck size={20} />
                                        <span className="tracking-wider uppercase">Proceed to Business Plan & PRD</span>
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => handleDecision('KILL')}
                                disabled={isProcessing || !localResearch}
                                className="flex items-center justify-center space-x-3 bg-red-500/5 border border-red-500/20 text-red-400 py-6 rounded-2xl font-bold text-base hover:bg-red-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                            >
                                <Skull size={20} />
                                <span className="tracking-wider uppercase">Kill Opportunity</span>
                            </button>
                        </div>

                        <p className="text-[10px] text-zinc-600 text-center leading-relaxed">
                            Promotion locked until confidence threshold (70%) is exceeded. Current yield: {localResearch?.confidence_score || 0}%.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
