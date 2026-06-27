'use client';

import React from 'react';
import { Users, TrendingUp, DollarSign, Activity, Search } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface MarketSignals {
    competitors_detected: number;
    top_competitor: string;
    search_growth: string;
    trend: string;
    funding_activity: string;
    market_momentum: string;
    keywords: string[];
}

interface MarketEvidencePanelProps {
    signals: MarketSignals;
    className?: string;
}

export default function MarketEvidencePanel({ signals, className }: MarketEvidencePanelProps) {
    return (
        <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-3 bg-[#18181b]/30 p-4 rounded-2xl border border-[#27272a] group/signals hover:border-indigo-500/30 transition-colors", className)}>
            {/* Competitors */}
            <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2 text-gray-500">
                    <Users size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Competitors</span>
                </div>
                <div className="flex items-baseline space-x-1">
                    <span className="text-sm font-black text-white">{signals.competitors_detected} startups</span>
                    <span className="text-[9px] text-gray-600 truncate max-w-[80px]">Top: {signals.top_competitor}</span>
                </div>
            </div>

            {/* Search Growth */}
            <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2 text-gray-500">
                    <Search size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Search Growth</span>
                </div>
                <div className="flex items-center space-x-1.5">
                    <span className="text-sm font-black text-emerald-400">{signals.search_growth}</span>
                    <div className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold uppercase text-emerald-500">
                        {signals.trend}
                    </div>
                </div>
            </div>

            {/* Funding Activity */}
            <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2 text-gray-500">
                    <DollarSign size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Funding Activity</span>
                </div>
                <div className="flex items-baseline space-x-1">
                    <span className="text-sm font-black text-amber-400">{signals.funding_activity}</span>
                    <span className="text-[9px] text-gray-600">Invested</span>
                </div>
            </div>

            {/* Momentum */}
            <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2 text-gray-500">
                    <Activity size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Momentum</span>
                </div>
                <div className="flex items-center space-x-1.5">
                    <span className={cn(
                        "text-sm font-black uppercase tracking-tight",
                        signals.market_momentum === "High" ? "text-indigo-400" : "text-gray-400"
                    )}>
                        {signals.market_momentum}
                    </span>
                    <TrendingUp size={12} className="text-indigo-500 animate-pulse" />
                </div>
            </div>
        </div>
    );
}
