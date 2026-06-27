import React from 'react';
import { Target, DollarSign, Activity, Users, Zap, Wrench, ShieldCheck, TrendingUp, BarChart3, Tag } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

import { type Idea } from '@/types/idea';
import MarketEvidencePanel from './MarketEvidencePanel';

interface IdeaCardProps {
    idea: Idea;
    isSelected?: boolean;
    onClick?: () => void;
}

export default function IdeaCard({ idea, isSelected, onClick }: IdeaCardProps) {
    // Capitalize helpers
    const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : 'N/A';

    return (
        <div
            onClick={onClick}
            className={cn(
                "flex flex-col lg:flex-row items-start lg:items-center justify-between p-6 bg-[#09090b]/40 backdrop-blur-md border border-[#27272a] rounded-[1.5rem] cursor-pointer transition-all duration-300 hover:border-indigo-500/40 hover:bg-[#18181b]/50 hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.1)] group",
                isSelected && "border-indigo-500 bg-[#18181b]/80 shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)]"
            )}
        >
            <div className="flex-1 space-y-4">
                <div className="flex items-center space-x-3">
                    <div className={cn(
                        "w-2 h-2 rounded-full",
                        (idea.opportunity_score || 0) > 85 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" :
                            (idea.opportunity_score || 0) > 70 ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                    )} />
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">{idea.title}</h3>
                    {idea.opportunity_score !== undefined && (
                        <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg shrink-0">
                            <TrendingUp size={14} />
                            <span className="text-xs font-black uppercase tracking-widest">Score: {idea.opportunity_score}</span>
                        </div>
                    )}
                </div>

                <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed max-w-3xl">{idea.thesis || idea.description}</p>

                {/* Market size + tags row */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                    {idea.market_size && (
                        <div className="flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-lg">
                            <BarChart3 size={13} />
                            <span>TAM {idea.market_size}</span>
                        </div>
                    )}
                    {idea.target_customer?.industry_or_role && (
                        <div className="flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-widest text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-lg">
                            <Tag size={13} />
                            <span>{idea.target_customer.industry_or_role}</span>
                        </div>
                    )}
                    {idea.monetization?.pricing_structure && (
                        <div className="flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                            <DollarSign size={13} />
                            <span>{idea.monetization.pricing_structure}</span>
                        </div>
                    )}
                </div>

                {/* Market Signals Engine */}
                {idea.market_signals && (
                    <MarketEvidencePanel signals={idea.market_signals} className="mt-2" />
                )}

                {!idea.market_signals && idea.signals && (
                    <div className="flex flex-wrap gap-2 md:gap-4 mt-1">
                        <Signal icon={<Activity size={14} />} label="Demand" value={idea.signals.demand > 7 ? 'High' : (idea.signals.demand > 4 ? 'Medium' : 'Low')} color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20" />
                        <Signal icon={<Users size={14} />} label="Competition" value={capitalize(idea.signals.competition)} color="text-amber-400" bg="bg-amber-500/10" border="border-amber-500/20" />
                        <Signal icon={<Wrench size={14} />} label="Build Difficulty" value={capitalize(idea.signals.difficulty)} color="text-purple-400" bg="bg-purple-500/10" border="border-purple-500/20" />
                    </div>
                )}

                {!idea.market_signals && !idea.signals && (
                    <div className="flex flex-wrap gap-3 pt-1">
                        <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg">
                            <Target size={14} />
                            <span>{idea.target_customer?.primary_user || 'N/A'}</span>
                        </div>
                    </div>
                )}
            </div>

            {idea.confidence_score !== undefined && (
                <div className="flex items-center space-x-6 mt-6 lg:mt-0 lg:ml-8 shrink-0 lg:border-l border-[#27272a] lg:pl-8">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Score</span>
                        <div className="flex items-center space-x-2">
                            <ShieldCheck size={20} className={cn(
                                idea.confidence_score > 80 ? "text-emerald-500" : "text-amber-500"
                            )} />
                            <span className="text-3xl font-black text-white">{idea.confidence_score}</span>
                        </div>
                        <span className="text-[9px] text-gray-600 font-bold uppercase mt-1">Confidence</span>
                    </div>
                </div>
            )}
        </div>
    );
}

function Signal({ icon, label, value, color, bg, border }: { icon: React.ReactNode, label: string, value: string | number, color: string, bg: string, border: string }) {
    return (
        <div className={cn("flex items-center space-x-2 px-3 py-1.5 rounded-lg border", bg, border)}>
            <div className={color}>{icon}</div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-300">{label}:</span>
            <span className={cn("text-[11px] font-black uppercase tracking-widest", color)}>{value}</span>
        </div>
    );
}
