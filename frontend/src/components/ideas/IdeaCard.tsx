import React from 'react';
import { Target, DollarSign, Zap, BarChart3, Binary, ShieldCheck } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface IdeaCardProps {
    idea: {
        idea_id: string;
        title: string;
        thesis: string;
        target_customer: {
            primary_user: string;
        };
        monetization: {
            pricing_structure: string;
        };
        confidence_score: number;
        market_score: number;
        execution_complexity: number;
    };
    isSelected: boolean;
    onClick: () => void;
}

export default function IdeaCard({ idea, isSelected, onClick }: IdeaCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-[#18181b] border border-[#27272a] rounded-xl cursor-pointer transition-all hover:border-[#3f3f46] hover:bg-[#1c1c1f]",
                isSelected && "border-[#3b82f6] bg-[#1c1c1f] ring-1 ring-[#3b82f6]"
            )}
        >
            <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold text-white">{idea.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-1">{idea.thesis}</p>

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
            </div>

            <div className="flex items-center space-x-6 mt-4 md:mt-0 md:ml-6 shrink-0">
                <Metric
                    icon={<BarChart3 size={14} />}
                    label="Market"
                    value={idea.market_score}
                    color="text-purple-400"
                />
                <Metric
                    icon={<Binary size={14} />}
                    label="Complexity"
                    value={idea.execution_complexity}
                    color="text-orange-400"
                />
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
        </div>
    );
}

function Metric({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color: string }) {
    return (
        <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">{label}</span>
            <div className={cn("flex items-center space-x-1 font-medium", color)}>
                {icon}
                <span>{value}</span>
            </div>
        </div>
    );
}
