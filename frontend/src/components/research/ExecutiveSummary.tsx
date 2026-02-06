import React from 'react';
import { FileText, TrendingUp, Target, Sparkles } from 'lucide-react';
import { ExecutiveSummary as ExecutiveSummaryType } from '@/types/research';

interface ExecutiveSummaryProps {
    summary: ExecutiveSummaryType;
}

export default function ExecutiveSummary({ summary }: ExecutiveSummaryProps) {
    return (
        <section className="space-y-8">
            <div className="flex items-center space-x-3">
                <FileText size={20} className="text-indigo-500" />
                <h2 className="text-2xl font-bold text-white tracking-tight">Market Intelligence Brief</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            <div className="glass-card p-10 rounded-3xl space-y-8 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl -mr-32 -mt-32 pointer-events-none" />

                <div className="relative z-10 space-y-8">
                    {/* Market Definition */}
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                            <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Market Definition</h3>
                        </div>
                        <p className="text-base text-zinc-200 leading-relaxed font-medium">
                            {summary.market_definition}
                        </p>
                    </div>

                    {/* Core Demand Drivers */}
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <Target size={14} className="text-indigo-400" />
                            <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Core Demand Drivers</h3>
                        </div>
                        <ul className="space-y-2">
                            {summary.core_demand_drivers.map((driver, index) => (
                                <li key={index} className="flex items-start space-x-3 text-sm text-zinc-300 leading-relaxed">
                                    <span className="text-indigo-500 mt-1">▸</span>
                                    <span className="font-medium">{driver}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Growth Outlook & Why Now */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <TrendingUp size={14} className="text-green-400" />
                                <h3 className="text-[10px] font-bold text-green-400 uppercase tracking-[0.2em]">Growth Outlook</h3>
                            </div>
                            <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                                {summary.growth_outlook}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <Sparkles size={14} className="text-amber-400" />
                                <h3 className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.2em]">Why This Opportunity Exists Now</h3>
                            </div>
                            <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                                {summary.why_now}
                            </p>
                        </div>
                    </div>

                    {/* Strategic Attractiveness */}
                    <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl space-y-3">
                        <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Strategic Attractiveness</h3>
                        <p className="text-sm text-zinc-200 leading-relaxed font-medium italic">
                            "{summary.strategic_attractiveness}"
                        </p>
                    </div>

                    {/* Memo Style Footer */}
                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                        <div className="text-[9px] text-zinc-600 uppercase tracking-widest">
                            Analysis Grade: <span className="text-zinc-400 font-bold">Institutional</span>
                        </div>
                        <div className="text-[9px] text-zinc-600 font-mono">
                            Format: VC Investment Memo
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
