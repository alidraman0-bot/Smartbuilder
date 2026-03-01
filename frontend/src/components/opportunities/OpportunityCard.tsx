'use client';

import React from 'react';
import {
    Rocket,
    Target,
    ArrowRight,
    Activity,
    Users,
    Map,
    Zap,
    TrendingUp,
    DollarSign,
    Hammer,
    BarChart3
} from 'lucide-react';
import OpportunityScore from './OpportunityScore';
import MarketEvidencePanel from './MarketEvidencePanel';

interface ScoreData {
    score: number;
    market_demand: string;
    competition: string;
    revenue_potential: string;
    build_difficulty: string;
    trend: string;
    summary: string;
    market_evidence?: {
        competitors_detected: number;
        top_competitors: string[];
        search_growth: string;
        trend: string;
        funding_activity: string;
        num_startups_funded: number;
        market_momentum: string;
    };
}

export interface OpportunityIdea {
    title: string;
    problem: string;
    target_customer: string;
    market_hint: string;
    why_now: string;
    score_data?: ScoreData;
}

interface OpportunityCardProps {
    idea: OpportunityIdea;
    onResearch: () => void;
}

export default function OpportunityCard({ idea, onResearch }: OpportunityCardProps) {
    return (
        <div className="group relative bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 hover:border-indigo-500/50 transition-all duration-300 backdrop-blur-xl overflow-hidden shadow-2xl">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                            <Rocket className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-white group-hover:text-indigo-200 transition-colors">
                            {idea.title}
                        </h3>
                    </div>
                    <div className="flex items-center space-x-1 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                        <Activity className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">High Signal</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="flex space-x-4">
                                <div className="mt-1">
                                    <Target className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest mb-1">Unsolved Problem</h4>
                                    <p className="text-sm text-zinc-300 leading-relaxed font-light">
                                        {idea.problem}
                                    </p>
                                </div>
                            </div>

                            <div className="flex space-x-4">
                                <div className="mt-1">
                                    <Users className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest mb-1">Target Customer</h4>
                                    <p className="text-sm text-zinc-300 leading-relaxed font-light">
                                        {idea.target_customer}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex space-x-4">
                                <div className="mt-1">
                                    <Map className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest mb-1">Market Insight</h4>
                                    <p className="text-sm text-zinc-300 leading-relaxed font-light">
                                        {idea.market_hint}
                                    </p>
                                </div>
                            </div>

                            <div className="flex space-x-4">
                                <div className="mt-1">
                                    <Zap className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest mb-1">Why Now</h4>
                                    <p className="text-sm text-zinc-300 leading-relaxed font-light font-medium italic text-indigo-200/80">
                                        {idea.why_now}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        {idea.score_data && <OpportunityScore scoreData={idea.score_data} />}
                    </div>
                </div>

                {/* Real Market Evidence Panel */}
                {idea.score_data?.market_evidence && (
                    <div className="mb-10">
                        <MarketEvidencePanel evidence={idea.score_data.market_evidence} />
                    </div>
                )}

                <button
                    onClick={onResearch}
                    className="w-full inline-flex items-center justify-center px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/50 text-white text-sm font-bold rounded-2xl transition-all group-hover:shadow-[0_0_30px_-10px_rgba(79,70,229,0.3)] active:scale-[0.98]"
                >
                    <span>Research This Opportunity</span>
                    <ArrowRight className="w-4 h-4 ml-2 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}
