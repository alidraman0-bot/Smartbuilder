import React from 'react';
import { Activity, TrendingUp, Zap, Globe, Layers, Clock } from 'lucide-react';
import { IdeaContext } from '@/types/research';

interface IdeaContextBarProps {
    context: IdeaContext;
}

export default function IdeaContextBar({ context }: IdeaContextBarProps) {
    const getMaturityColor = (maturity: string) => {
        switch (maturity) {
            case 'Nascent': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
            case 'Emerging': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'Growth': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'Mature': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'Declining': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
        }
    };

    const getComplexityColor = (complexity: number) => {
        if (complexity <= 3) return 'text-emerald-400';
        if (complexity <= 6) return 'text-amber-400';
        return 'text-red-400';
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m`;
        if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h`;
        return `${Math.floor(diffMinutes / 1440)}d`;
    };

    return (
        <div className="sticky top-6 z-40 px-4 mb-8 pointer-events-none">
            <div className="max-w-6xl mx-auto pointer-events-auto">
                <div className="bg-[#0D0D0F]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-1.5 flex items-center justify-between">

                    {/* Primary Info (Left) */}
                    <div className="flex items-center gap-4 pl-4 pr-6 border-r border-white/5">
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500 blur-[8px] opacity-40 animate-pulse" />
                            <div className="relative w-2.5 h-2.5 rounded-full bg-indigo-500 border border-indigo-300" />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">Opportunity</div>
                            <div className="text-base font-bold text-white tracking-tight leading-none">{context.idea_name}</div>
                        </div>
                    </div>

                    {/* Stats Grid (Center) */}
                    <div className="flex items-center gap-2">
                        {/* Confidence Pill */}
                        <div className="flex flex-col items-center justify-center px-4 py-1.5 bg-zinc-900/50 rounded-xl border border-white/5 min-w-[100px]">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <Activity size={10} className="text-zinc-500" />
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Conf</span>
                            </div>
                            <span className="text-sm font-bold text-white font-mono">{context.confidence_score}%</span>
                        </div>

                        {/* Maturity Pill */}
                        <div className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-xl border min-w-[100px] ${getMaturityColor(context.market_maturity)}`}>
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <TrendingUp size={10} className="opacity-70" />
                                <span className="text-[9px] font-bold opacity-70 uppercase tracking-wider">Stage</span>
                            </div>
                            <span className="text-sm font-bold font-mono">{context.market_maturity}</span>
                        </div>

                        {/* Complexity Pill */}
                        <div className="flex flex-col items-center justify-center px-4 py-1.5 bg-zinc-900/50 rounded-xl border border-white/5 min-w-[100px]">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <Zap size={10} className={getComplexityColor(context.execution_complexity)} />
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Complex</span>
                            </div>
                            <span className={`text-sm font-bold font-mono ${getComplexityColor(context.execution_complexity)}`}>{context.execution_complexity}/10</span>
                        </div>
                    </div>

                    {/* Context Meta (Right) */}
                    <div className="flex items-center gap-4 pl-6 pr-4 border-l border-white/5">
                        <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-zinc-300">{context.industry}</span>
                                <Layers size={12} className="text-zinc-600" />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-zinc-300">{context.region}</span>
                                <Globe size={12} className="text-zinc-600" />
                            </div>
                        </div>
                        <div className="h-8 w-px bg-white/5" />
                        <div className="flex flex-col items-center justify-center text-zinc-500">
                            <Clock size={14} className="mb-1" />
                            <span className="text-[9px] font-mono leading-none">{formatTimestamp(context.data_freshness)}</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
