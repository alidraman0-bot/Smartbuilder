"use client";

import React, { useState, useEffect } from 'react';
import { useRunStore } from '@/store/useRunStore';
import { useRouter } from 'next/navigation';
import { FileText, Code2, Loader2, CheckCircle, Ban, Sparkles } from 'lucide-react';
import StartupPipeline from '@/components/layout/StartupPipeline';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useBillingStore } from '@/store/useBillingStore';
import { hasFeature } from '@/utils/feature-gating';
import PaywallModal from '@/components/billing/PaywallModal';

// Intelligence Layer Components
import IdeaContextBar from '@/components/builder/IdeaContextBar';
import ExecutiveSummary from '@/components/builder/ExecutiveSummary';
import InvestmentVerdict from '@/components/builder/InvestmentVerdict';
import ProductObjective from '@/components/builder/ProductObjective';
import MVPFeatureSet from '@/components/builder/MVPFeatureSet';
import ExplicitNonGoals from '@/components/builder/ExplicitNonGoals';
import AICoFounderPanel from '@/components/builder/AICoFounderPanel';

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
    const [showPaywall, setShowPaywall] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { subscription, fetchSubscription } = useBillingStore();
    const isGenerating = React.useRef(false);

    useEffect(() => {
        fetchSubscription('demo-org-id');
    }, [fetchSubscription]);

    // Sync with global store for background-generated data
    useEffect(() => {
        if (run.business_plan && !businessPlan) {
            setBusinessPlan(run.business_plan as BusinessPlanData);
        }
        if (run.prd && !prd) {
            setPrd(run.prd as PRDData);
        }
    }, [run.business_plan, run.prd]);

    // Fetch or generate Business Plan & PRD (Fallback logic)
    useEffect(() => {
        if (!(run.research as any) || !(run.research as any).idea || isGenerating.current) {
            if (!(run.research as any)?.idea && !run.runId) {
                // If it's been several seconds and we still don't have basic run data, something is wrong
                const errorTimer = setTimeout(() => {
                    if (!(run.research as any)?.idea) setError("Missing idea data. Please start a new run.");
                }, 5000);
                return () => clearTimeout(errorTimer);
            }
            return;
        }

        // Set context bar data if not already set or if research changed
        if (!contextData || contextData.idea_name !== (run.research as any).idea.title) {
            setContextData({
                idea_name: (run.research as any).idea.title || 'Untitled Idea',
                market_category: (run.research as any).idea.market_category || 'Technology',
                confidence_score: (run.research as any).confidence_score || 0,
                research_depth: Math.min(100, ((run.research as any).modules?.length || 0) * 10 || 50),
                last_updated: new Date().toISOString()
            });
        }

        const initializeIntelligenceLayer = async () => {
            // Priority 1: Check if data is already in state or store
            const currentBP = businessPlan || (run.business_plan as BusinessPlanData);
            const currentPRD = prd || (run.prd as PRDData);

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
            setError(null);
            try {
                // Secondary Fallback: Manual trigger if background runner hasn't produced data
                if (!currentBP && (run.research as any)?.idea) {
                    const bpRes = await fetch('/api/v1/builder/business-plan', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            idea: (run.research as any).idea,
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
                                    idea: (run.research as any).idea,
                                    business_plan: data.business_plan,
                                    run_id: run.runId
                                })
                            });
                            if (prdRes.ok) {
                                const prdData = await prdRes.json();
                                setPrd(prdData.prd);
                            } else {
                                setError("Failed to generate PRD. Please try again.");
                            }
                        }
                    } else {
                        setError("Failed to generate business plan. Please try again.");
                    }
                } else if (!currentPRD && currentBP?.investment_verdict?.verdict === 'BUILD' && (run.research as any)?.idea) {
                    // BP exists but PRD is missing
                    const prdRes = await fetch('/api/v1/builder/prd', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            idea: (run.research as any).idea,
                            business_plan: currentBP,
                            run_id: run.runId
                        })
                    });
                    if (prdRes.ok) {
                        const prdData = await prdRes.json();
                        setPrd(prdData.prd);
                    } else {
                        setError("Failed to generate PRD. Please try again.");
                    }
                }
            } catch (err) {
                console.error('Intelligence Layer generation failed:', err);
                setError("A connection error occurred. Please check your network.");
            } finally {
                isGenerating.current = false;
            }
        };

        // Give the background runner 2 seconds to appear in the poll before manual trigger
        const timer = setTimeout(initializeIntelligenceLayer, 2000);
        return () => clearTimeout(timer);
    }, [(run.research as any)?.idea?.idea_id, run.runId, run.state, businessPlan, prd, contextData]);

    const handleCompileToMVP = async () => {
        // Feature Gating: Require mvp_builder
        const currentPlan = subscription?.plan || 'free';
        if (!hasFeature(currentPlan, 'mvp_builder')) {
            setShowPaywall(true);
            return;
        }

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
                // Auto-advance pipeline to build
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

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
                <div className="text-center space-y-6 max-w-md p-8 bg-[#18181b] border border-[#27272a] rounded-3xl shadow-2xl">
                    <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Ban className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Something went wrong</h2>
                    <p className="text-gray-400 text-sm leading-relaxed">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-white text-black py-3 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-gray-200 transition-all"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => router.push('/ideas')}
                        className="text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-all underline underline-offset-4"
                    >
                        Return to Ideas
                    </button>
                </div>
            </div>
        );
    }

    // Loading state
    if (!contextData || (!businessPlan && !error)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                    <p className="text-gray-400 text-sm uppercase tracking-wider animate-pulse">
                        Generating Intelligence Report...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#09090b]">
            {/* Startup Pipeline Tracker */}
            <div className="max-w-7xl mx-auto px-6 pt-8">
                <div className="bg-[#18181b]/50 border border-[#27272a] rounded-3xl p-2 backdrop-blur-xl">
                    <StartupPipeline currentStage={
                        run.state === 'IDEA_GENERATION' ? 'IDEA' :
                            run.state === 'RESEARCH' ? 'RESEARCH' :
                                run.state === 'BUSINESS_PLAN_PRD' ? 'PRD' :
                                    run.state === 'MVP_BUILD' ? 'MVP' :
                                        run.state === 'DEPLOYMENT' ? 'LAUNCH' :
                                            run.state === 'MONITORING' ? 'MONITORING' : 'IDEA'
                    } />
                </div>
            </div>

            {/* Sticky Idea Context Bar */}
            <IdeaContextBar data={contextData} />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
                {/* Left Content Area */}
                <div className="flex-1 space-y-8">
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

                    {/* Right Panel: AI Co-Founder */}
                    <div className="w-80 shrink-0 hidden lg:block sticky top-32 h-[calc(100vh-160px)] rounded-3xl overflow-hidden border border-[#27272a]">
                        <AICoFounderPanel projectId={run.runId} />
                    </div>
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
            {/* PAYWALL MODAL */}
            {showPaywall && (
                <PaywallModal
                    feature="mvp_builder"
                    onClose={() => setShowPaywall(false)}
                />
            )}
        </div>
    );
}
