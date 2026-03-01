import React from 'react';
import { Target, DollarSign, Activity, Users, Zap, Wrench, ShieldCheck, TrendingUp } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface IdeaCardProps {
    idea: {
        idea_id?: string;
        title: string;
        thesis?: string;
        description?: string;
        target_customer?: {
            primary_user: string;
        };
        monetization?: {
            pricing_structure: string;
        };
        confidence_score?: number;
        market_score?: number;
        execution_complexity?: number;
        opportunity_score?: number;
        signals?: {
            demand: number;
            competition: string;
            monetization: string;
            difficulty: string;
            trend?: string;
            market_size?: string;
        };
    };
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
                "flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-[#18181b] border border-[#27272a] rounded-xl cursor-pointer transition-all hover:border-[#3f3f46] hover:bg-[#1c1c1f]",
                isSelected && "border-[#3b82f6] bg-[#1c1c1f] ring-1 ring-[#3b82f6]"
            )}
        >
            <div className="flex-1 space-y-3">
                <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-white">{idea.title}</h3>
                    {idea.opportunity_score !== undefined && (
                        <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md">
                            <TrendingUp size={14} />
                            <span className="text-sm font-bold">Score: {idea.opportunity_score}</span>
                        </div>
                    )}
                </div>

                <p className="text-sm text-gray-400 line-clamp-2">{idea.thesis || idea.description}</p>

                {idea.signals ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <Signal icon={<Activity size={14} />} label="Demand" value={idea.signals.demand > 7 ? 'High' : (idea.signals.demand > 4 ? 'Medium' : 'Low')} color="text-emerald-400" />
                        <Signal icon={<Users size={14} />} label="Competition" value={capitalize(idea.signals.competition)} color="text-orange-400" />
                        <Signal icon={<DollarSign size={14} />} label="Revenue" value={capitalize(idea.signals.monetization)} color="text-green-400" />
                        <Signal icon={<Wrench size={14} />} label="Difficulty" value={capitalize(idea.signals.difficulty)} color="text-purple-400" />
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-4 pt-2">
                        <div className="flex items-center space-x-1.5 text-xs text-gray-400">
                            <Target size={14} className="text-blue-500" />
                            <span>{idea.target_customer?.primary_user || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-xs text-gray-400">
                            <DollarSign size={14} className="text-green-500" />
                            <span>{idea.monetization?.pricing_structure || 'N/A'}</span>
                        </div>
                    </div>
                )}
            </div>

            {idea.confidence_score !== undefined && (
                <div className="flex items-center space-x-6 mt-4 md:mt-0 md:ml-6 shrink-0 border-t md:border-t-0 md:border-l border-[#27272a] pt-4 md:pt-0 md:pl-6">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">Confidence</span>
                        <div className="flex items-center space-x-1.5">
                            <ShieldCheck size={18} className={cn(
                                idea.confidence_score > 80 ? "text-green-500" : "text-yellow-500"
                            )} />
                            <span className="text-xl font-bold text-white">{idea.confidence_score}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Signal({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) {
    return (
        <div className="flex flex-col bg-[#27272a]/50 rounded-lg p-2.5 border border-[#3f3f46]/50">
            <span className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">{label}</span>
            <div className={cn("flex items-center space-x-1.5 font-medium text-sm", color)}>
                {icon}
                <span>{value}</span>
            </div>
        </div>
    );
}
