"use client";

import React, { useState, useEffect } from 'react';
import { useRunStore } from '@/store/useRunStore';
import { useRouter } from 'next/navigation';
import { FileText, Code2, Loader2, CheckCircle, Ban, Sparkles } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Intelligence Layer Components
import IdeaContextBar from '@/components/builder/IdeaContextBar';
import ExecutiveSummary from '@/components/builder/ExecutiveSummary';
import InvestmentVerdict from '@/components/builder/InvestmentVerdict';
import ProductObjective from '@/components/builder/ProductObjective';
import MVPFeatureSet from '@/components/builder/MVPFeatureSet';
import ExplicitNonGoals from '@/components/builder/ExplicitNonGoals';

// Types
import {
    IdeaContextBarData,
    BusinessPlanData,
    PRDData
} from '@/types/businessplan';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type ViewMode = 'BUSINESS_PLAN' | 'PRD';

export default function IntelligenceLayerPage() {
    const run = useRunStore();
    const router = useRouter();
    const [viewMode, setViewMode] = useState<ViewMode>('BUSINESS_PLAN');
    const [isProcessing, setIsProcessing] = useState(false);
    const [businessPlan, setBusinessPlan] = useState<BusinessPlanData | null>(null);
    const [prd, setPrd] = useState<PRDData | null>(null);
    const [contextData, setContextData] = useState<IdeaContextBarData | null>(null);

    const isGenerating = React.useRef(false);

    // Sync with global store for background-generated data
    useEffect(() => {
        if (run.business_plan && !businessPlan) {
            setBusinessPlan(run.business_plan);
        }
        if (run.prd && !prd) {
            setPrd(run.prd);
        }
    }, [run.business_plan, run.prd]);

    // Fetch or generate Business Plan & PRD (Fallback logic)
    useEffect(() => {
        if (!run.research || !run.research.idea || isGenerating.current) return;

        // Set context bar data if not already set or if research changed
        if (!contextData || contextData.idea_name !== run.research.idea.title) {
            setContextData({
                idea_name: run.research.idea.title || 'Untitled Idea',
                market_category: run.research.idea.market_category || 'Technology',
                confidence_score: run.research.confidence_score || 0,
                research_depth: Math.min(100, run.research.modules?.length * 10 || 50),
                last_updated: new Date().toISOString()
            });
        }

        const initializeIntelligenceLayer = async () => {
            // Priority 1: Check if data is already in state or store
            const currentBP = businessPlan || run.business_plan;
            const currentPRD = prd || run.prd;

            // If we have everything, we're done
            if (currentBP && currentPRD) return;

            // If the background runner is already working (state is BUSINESS_PLAN_PRD),
            // wait for it to finish instead of triggering redundant POSTs.
            if (run.state === 'BUSINESS_PLAN_PRD' && (!currentBP || !currentPRD)) {
                // We'll wait for the next poll. 
                // But we add a small delay to prevent immediate re-trigger.
                return;
            }

            if (isGenerating.current) return;

            isGenerating.current = true;
            try {
                // Secondary Fallback: Manual trigger if background runner hasn't produced data
                if (!currentBP) {
                    const bpRes = await fetch('/api/v1/builder/business-plan', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            idea: run.research.idea,
                            research: run.research,
                            run_id: run.runId
                        })
                    });
                    if (bpRes.ok) {
                        const data = await bpRes.json();
                        setBusinessPlan(data.business_plan);

                        // Auto-generate PRD if missing and verdict is BUILD
                        if (data.business_plan?.investment_verdict?.verdict === 'BUILD' && !currentPRD) {
                            const prdRes = await fetch('/api/v1/builder/prd', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    idea: run.research.idea,
                                    business_plan: data.business_plan,
                                    run_id: run.runId
                                })
                            });
                            if (prdRes.ok) {
                                const prdData = await prdRes.json();
                                setPrd(prdData.prd);
                            }
                        }
                    }
                } else if (!currentPRD && currentBP.investment_verdict?.verdict === 'BUILD') {
                    // BP exists but PRD is missing
                    const prdRes = await fetch('/api/v1/builder/prd', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            idea: run.research.idea,
                            business_plan: currentBP,
                            run_id: run.runId
                        })
                    });
                    if (prdRes.ok) {
                        const prdData = await prdRes.json();
                        setPrd(prdData.prd);
                    }
                }
            } catch (err) {
                console.error('Intelligence Layer generation failed:', err);
            } finally {
                isGenerating.current = false;
            }
        };

        // Give the background runner 2 seconds to appear in the poll before manual trigger
        const timer = setTimeout(initializeIntelligenceLayer, 2000);
        return () => clearTimeout(timer);
    }, [run.research?.idea?.idea_id, run.runId, run.state]);

    const handleCompileToMVP = async () => {
        if (!prd?.readiness_status?.mvp_builder_unlocked) {
            alert('PRD is not ready for MVP compilation. Please review and resolve blockers.');
            return;
        }

        setIsProcessing(true);
        try {
            const res = await fetch('/api/v1/builder/decision', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ run_id: run.runId, decision: 'APPROVE' })
            });
            if (res.ok) {
                router.push('/mvp');
            }
        } catch (err) {
            console.error("MVP compilation failed:", err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAbandon = () => {
        if (confirm('Are you sure you want to abandon this idea? This action cannot be undone.')) {
            router.push('/ideas');
        }
    };

    // Loading state
    if (!contextData || !businessPlan) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                    <p className="text-gray-400 text-sm uppercase tracking-wider">
                        Generating Intelligence Report...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#09090b]">
            {/* Sticky Idea Context Bar */}
            <IdeaContextBar data={contextData} />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Tab Switcher */}
                <div className="flex items-center justify-center">
                    <div className="bg-[#18181b] p-1.5 rounded-2xl border border-[#27272a] flex backdrop-blur-xl shadow-xl">
                        <button
                            onClick={() => setViewMode('BUSINESS_PLAN')}
                            className={cn(
                                "flex items-center gap-3 px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                                viewMode === 'BUSINESS_PLAN'
                                    ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/20"
                                    : "text-gray-500 hover:text-white"
                            )}
                        >
                            <FileText size={16} />
                            <span>Business Plan & Strategy</span>
                        </button>
                        <button
                            onClick={() => setViewMode('PRD')}
                            disabled={!prd}
                            className={cn(
                                "flex items-center gap-3 px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                                viewMode === 'PRD'
                                    ? "bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/20"
                                    : "text-gray-500 hover:text-white disabled:opacity-30"
                            )}
                        >
                            <Code2 size={16} />
                            <span>Product Requirements (PRD)</span>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="min-h-[600px]">
                    {viewMode === 'BUSINESS_PLAN' && businessPlan && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Executive Summary */}
                            {businessPlan.executive_summary && (
                                <ExecutiveSummary data={businessPlan.executive_summary} />
                            )}

                            {/* Other Business Plan Sections */}
                            {businessPlan.problem_statement && (
                                <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-4">Problem Statement & Pain Economics</h3>
                                    <p className="text-gray-300 text-sm">{businessPlan.problem_statement.investor_insight}</p>
                                </div>
                            )}

                            {businessPlan.solution_overview && (
                                <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-4">Solution Positioning</h3>
                                    <p className="text-gray-300 text-base italic">"{businessPlan.solution_overview.positioning_sentence}"</p>
                                </div>
                            )}

                            {/* Investment Verdict */}
                            {businessPlan.investment_verdict && (
                                <InvestmentVerdict data={businessPlan.investment_verdict} />
                            )}
                        </div>
                    )}

                    {viewMode === 'PRD' && prd && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Product Objective */}
                            {prd.product_objective && (
                                <ProductObjective data={prd.product_objective} />
                            )}

                            {/* MVP Feature Set */}
                            {prd.mvp_feature_set && (
                                <MVPFeatureSet data={prd.mvp_feature_set} />
                            )}

                            {/* Explicit Non-Goals */}
                            {prd.explicit_non_goals && (
                                <ExplicitNonGoals data={prd.explicit_non_goals} />
                            )}

                            {/* PRD Readiness Status */}
                            {prd.readiness_status && (
                                <div className={cn(
                                    "border-2 rounded-xl p-6",
                                    prd.readiness_status.mvp_builder_unlocked
                                        ? "bg-emerald-500/10 border-emerald-500/30"
                                        : "bg-yellow-500/10 border-yellow-500/30"
                                )}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-2">PRD Readiness Status</h3>
                                            <p className={cn(
                                                "text-sm font-medium",
                                                prd.readiness_status.mvp_builder_unlocked ? "text-emerald-500" : "text-yellow-500"
                                            )}>
                                                {prd.readiness_status.mvp_builder_unlocked ? "✓ Ready for MVP Builder" : "⚠ Prerequisites Incomplete"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {viewMode === 'PRD' && !prd && (
                        <div className="py-24 flex flex-col items-center justify-center space-y-6 bg-[#18181b] rounded-3xl border border-dashed border-[#27272a]">
                            <Loader2 size={40} className="text-blue-500 animate-spin" />
                            <p className="text-gray-500 text-xs font-mono uppercase tracking-wider">
                                Generating PRD from approved business plan...
                            </p>
                        </div>
                    )}
                </div>

                {/* CTA Bar - Fixed at bottom */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
                    <div className="bg-gradient-to-br from-[#18181b] to-[#0d0d10] backdrop-blur-3xl border border-[#27272a] p-5 rounded-2xl shadow-2xl flex items-center gap-4">
                        <button
                            onClick={handleAbandon}
                            disabled={isProcessing}
                            className="flex-1 flex items-center justify-center gap-2 border border-red-500/20 py-4 rounded-xl text-xs font-bold text-red-500 uppercase tracking-widest hover:bg-red-500/10 transition-all disabled:opacity-30"
                        >
                            <Ban size={18} />
                            <span>Abandon</span>
                        </button>
                        <button
                            onClick={handleCompileToMVP}
                            disabled={isProcessing || !prd?.readiness_status?.mvp_builder_unlocked}
                            className="flex-[3] group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20"
                        >
                            {isProcessing ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    <Sparkles size={20} />
                                    <span>Compile into MVP →</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
