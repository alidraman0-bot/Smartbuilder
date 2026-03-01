'use client';

import React from 'react';
import {
    Users,
    TrendingUp,
    DollarSign,
    Activity,
    Shield,
    Globe
} from 'lucide-react';

interface MarketEvidence {
    competitors_detected: number;
    top_competitors: string[];
    search_growth: string;
    trend: string;
    funding_activity: string;
    num_startups_funded: number;
    market_momentum: string;
}

interface MarketEvidencePanelProps {
    evidence: MarketEvidence;
}

export default function MarketEvidencePanel({ evidence }: MarketEvidencePanelProps) {
    return (
        <div className="mt-6 p-5 bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <h4 className="text-[10px] font-bold uppercase text-indigo-400 tracking-widest mb-4 flex items-center">
                <Shield className="w-3 h-3 mr-2" />
                Venture intelligence / REAL MARKET EVIDENCE
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Competitors */}
                <div className="space-y-1">
                    <div className="flex items-center text-zinc-500 space-x-1.5">
                        <Users className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-medium uppercase tracking-wider">Competitors</span>
                    </div>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-xl font-bold text-white">{evidence.competitors_detected}</span>
                        <span className="text-[10px] text-zinc-500">Detected</span>
                    </div>
                </div>

                {/* Search Growth */}
                <div className="space-y-1">
                    <div className="flex items-center text-zinc-500 space-x-1.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-medium uppercase tracking-wider">Growth</span>
                    </div>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-xl font-bold text-emerald-400">{evidence.search_growth}</span>
                        <span className="text-[10px] text-emerald-500/80 uppercase font-bold">{evidence.trend}</span>
                    </div>
                </div>

                {/* Funding */}
                <div className="space-y-1">
                    <div className="flex items-center text-zinc-500 space-x-1.5">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-medium uppercase tracking-wider">Funding</span>
                    </div>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-xl font-bold text-white">{evidence.funding_activity}</span>
                        <span className="text-[10px] text-zinc-500">Est. Pool</span>
                    </div>
                </div>

                {/* Momentum */}
                <div className="space-y-1">
                    <div className="flex items-center text-zinc-500 space-x-1.5">
                        <Activity className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-medium uppercase tracking-wider">Momentum</span>
                    </div>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-xl font-bold text-indigo-300">{evidence.market_momentum}</span>
                        <span className="text-[10px] text-zinc-500">Activity</span>
                    </div>
                </div>
            </div>

            {evidence.top_competitors && evidence.top_competitors.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                        <Globe className="w-3 h-3 mr-1.5" />
                        Key Players
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {evidence.top_competitors.map((name, i) => (
                            <span key={i} className="px-2 py-1 bg-indigo-500/10 text-indigo-200 text-[10px] rounded-md border border-indigo-500/20">
                                {name}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
