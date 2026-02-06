import React from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, TrendingUp, Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BusinessPlanViewProps {
    plan: {
        sections: { title: string, content: string }[];
        viability_score: number;
        risks: string[];
    };
}

export default function BusinessPlanView({ plan }: BusinessPlanViewProps) {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Executive Summary Memo */}
            <div className="bg-[#18181b] border-l-4 border-emerald-600 p-8 rounded-r-2xl shadow-xl shadow-emerald-900/5">
                <div className="flex items-center space-x-2 text-emerald-500 mb-4">
                    <TrendingUp size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Viability Assessment: {plan.viability_score}% Path to Revenue</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-4 font-mono">{plan.sections[0]?.title}</h3>
                <p className="text-gray-300 leading-relaxed italic">
                    {plan.sections[0]?.content}
                </p>
            </div>

            {/* Collapsible Sections */}
            <div className="grid grid-cols-1 gap-4">
                {plan.sections.slice(1).map((section, i) => (
                    <div key={i} className="bg-[#18181b] border border-[#27272a] p-6 rounded-xl hover:bg-[#1c1c1f] transition-all">
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center space-x-2">
                            <div className="w-1 h-1 bg-blue-500 rounded-full" />
                            <span>{section.title}</span>
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                            {section.content}
                        </p>
                    </div>
                ))}
            </div>

            {/* Risk Ledger */}
            <div className="bg-[#09090b] border border-[#27272a] p-6 rounded-xl space-y-4">
                <div className="flex items-center space-x-2 text-amber-500">
                    <AlertTriangle size={16} />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Market & Execution Risk Ledger</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plan.risks.map((risk, i) => (
                        <div key={i} className="flex items-center space-x-3 text-xs text-gray-400 font-mono">
                            <span className="text-amber-900">[!]</span>
                            <span>{risk}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
