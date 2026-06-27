"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRunStore } from '@/store/useRunStore';
import {
    Trophy,
    Sparkles,
    Zap,
    ArrowRight,
    Loader2,
    AlertCircle,
    Lightbulb,
    SignalHigh
} from 'lucide-react';
import ScoreGauge from '@/components/opportunities/ScoreGauge';
import FactorBar from '@/components/opportunities/FactorBar';
import LiveStartupSignals from '@/components/opportunities/LiveStartupSignals';
import { createClient } from '@/lib/supabase/browser';
import { getAuthHeaders } from '@/utils/supabase/auth';
import { apiFetch } from '@/lib/apiClient';

interface OpportunityAnalysis {
    opportunity_score: number;
    demand_score: number;
    market_size_score: number;
    competition_score: number;
    revenue_score: number;
    trend_score: number;
    difficulty_score: number;
    summary: string;
}

export default function OpportunityIntelligencePage() {
    const router = useRouter();
    const run = useRunStore();
    const [idea, setIdea] = useState('');
    const [signalsInput, setSignalsInput] = useState('');
    const [isAnalysing, setIsAnalysing] = useState(false);
    const [analysis, setAnalysis] = useState<OpportunityAnalysis | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!idea.trim()) return;

        setIsAnalysing(true);
        setError(null);
        setAnalysis(null);

        // Parse signals from text area (one per line)
        const signals = signalsInput
            .split('\n')
            .filter(line => line.trim())
            .map(line => ({ source: 'manual', signal: line.trim() }));

        try {
            const headers = await getAuthHeaders();

            const data = await apiFetch<OpportunityAnalysis>('/api/opportunity-score', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    idea,
                    signals,
                    research: run.research || {}
                }),
            });

            setAnalysis(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsAnalysing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white p-6 lg:p-12">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-violet-400 font-bold uppercase tracking-[0.2em] text-xs">
                            <Trophy size={14} />
                            <span>Venture Intelligence</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight">Opportunity Engine</h1>
                        <p className="text-gray-400 text-lg max-w-2xl">
                            Advanced 6-factor algorithmic scoring to evaluate the venture potential of your startup ideas.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                    {/* Left Column: Main Content Workflow */}
                    <div className="lg:col-span-8 flex flex-col gap-8">

                        {/* Input Panel Card */}
                        <div className="bg-[#18181b]/60 backdrop-blur-md border border-[#27272a] rounded-[2rem] p-6 lg:p-10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            <form onSubmit={handleAnalyse} className="space-y-6 relative z-10">
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
                                            <Lightbulb size={16} className="text-amber-400" />
                                            Startup Idea
                                        </label>
                                        <textarea
                                            value={idea}
                                            onChange={(e) => setIdea(e.target.value)}
                                            placeholder="Describe your startup idea in detail. What is the problem, who is it for, and how does it work?"
                                            className="w-full h-32 bg-[#09090b]/50 border border-[#27272a] rounded-2xl p-5 text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all resize-none text-lg placeholder:text-gray-600"
                                            required
                                            suppressHydrationWarning={true}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
                                                <SignalHigh size={16} className="text-violet-400" />
                                                Market Signals
                                                <span className="text-gray-600 text-[10px] bg-[#27272a] px-2 py-0.5 rounded-md ml-2">Optional</span>
                                            </label>
                                        </div>
                                        <textarea
                                            value={signalsInput}
                                            onChange={(e) => setSignalsInput(e.target.value)}
                                            placeholder="Paste any relevant market signals, complaints, or trends (e.g. from Reddit, Twitter, etc.)..."
                                            className="w-full h-24 bg-[#09090b]/50 border border-[#27272a] rounded-2xl p-5 text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all resize-none text-sm placeholder:text-gray-600"
                                            suppressHydrationWarning={true}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-[#27272a]/50">
                                    <div className="flex-1 w-full">
                                        {error && (
                                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-medium">
                                                <AlertCircle size={18} className="shrink-0" />
                                                <p>{error}</p>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isAnalysing || !idea.trim()}
                                        className="w-full md:w-auto px-8 group bg-white text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-violet-500 hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-white/5 whitespace-nowrap"
                                    >
                                        {isAnalysing ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <>
                                                <Sparkles size={18} />
                                                <span>Run intelligence check</span>
                                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Results Panel */}
                        <div className="w-full transition-all duration-700 ease-in-out">
                            {isAnalysing ? (
                                <div className="h-[400px] flex flex-col items-center justify-center space-y-6 bg-[#18181b]/30 border border-[#27272a] border-dashed rounded-[2.5rem]">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-violet-500/20 blur-3xl rounded-full" />
                                        <div className="w-16 h-16 rounded-2xl bg-[#09090b] border border-violet-500/30 flex items-center justify-center relative">
                                            <Zap className="text-violet-400 animate-pulse" size={32} />
                                        </div>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <p className="font-bold text-white uppercase tracking-widest">Analysing Venture Potential</p>
                                        <p className="text-gray-500 text-sm">Processing market signals & trend momentum...</p>
                                    </div>
                                </div>
                            ) : analysis ? (
                                <div className="bg-gradient-to-br from-[#18181b] to-[#09090b] border border-[#27272a] rounded-[2.5rem] p-8 lg:p-12 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-700">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
                                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

                                    <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center lg:items-start">
                                        <div className="flex-shrink-0">
                                            <ScoreGauge score={analysis.opportunity_score} size={240} />
                                        </div>

                                        <div className="flex-1 w-full space-y-6">
                                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Risk & Potential Matrix</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                                                <FactorBar label="Market Demand" score={analysis.demand_score} color="#8b5cf6" />
                                                <FactorBar label="Market Size" score={analysis.market_size_score} color="#3b82f6" />
                                                <FactorBar label="Competition" score={analysis.competition_score} color="#ef4444" />
                                                <FactorBar label="Revenue Potential" score={analysis.revenue_score} color="#10b981" />
                                                <FactorBar label="Trend Momentum" score={analysis.trend_score} color="#f59e0b" />
                                                <FactorBar label="Build Difficulty" score={analysis.difficulty_score} color="#ec4899" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-12 pt-10 border-t border-[#27272a]">
                                        <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Venture Verdict</h4>
                                        <p className="text-gray-300 text-lg md:text-xl italic leading-relaxed font-medium">
                                            "{analysis.summary}"
                                        </p>

                                        <div className="mt-10 flex justify-end">
                                            <button
                                                onClick={() => {
                                                    run.setRunState({
                                                        research: {
                                                            idea: {
                                                                title: idea,
                                                                description: analysis?.summary || idea
                                                            }
                                                        }
                                                    });
                                                    router.push('/builder');
                                                }}
                                                className="px-8 py-4 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400 text-xs font-bold uppercase tracking-widest hover:bg-violet-500 hover:text-white transition-all duration-300 flex items-center gap-3"
                                            >
                                                <span>Continue to Business Plan & PRD</span>
                                                <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-[300px] flex flex-col items-center justify-center space-y-6 bg-gradient-to-b from-[#18181b]/30 to-[#09090b]/80 border border-[#27272a] shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] rounded-[2.5rem] relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                        <div className="w-20 h-20 rounded-3xl bg-[#09090b] border border-[#27272a] group-hover:border-violet-500/30 flex items-center justify-center relative z-10 shadow-2xl transition-colors duration-500">
                                            <Trophy className="text-gray-600 group-hover:text-violet-400 transition-colors duration-500" size={36} />
                                        </div>
                                    </div>
                                    <div className="text-center space-y-3 relative z-10">
                                        <p className="font-black text-gray-400 group-hover:text-gray-300 uppercase tracking-widest text-lg transition-colors duration-500">Awaiting Input</p>
                                        <p className="text-gray-500 text-sm max-w-[300px] leading-relaxed">Enter your startup idea above to generate a comprehensive venture intelligence analysis.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Live Feed (Sidebar) */}
                    <div className="lg:col-span-4 h-[600px] lg:h-[calc(100vh-140px)] sticky top-6">
                        <LiveStartupSignals />
                    </div>
                </div>
            </div>
        </div>
    );
}
