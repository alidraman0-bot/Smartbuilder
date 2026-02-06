import React from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ResearchModuleProps {
    module: {
        module: string;
        summary: string;
        confidence_score: number;
        signals: string[];
        risks: string[];
    };
    isExpanded: boolean;
    onToggle: () => void;
}

export default function ResearchModule({ module, isExpanded, onToggle }: ResearchModuleProps) {
    const isHealthy = module.confidence_score > 70;

    return (
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden transition-all">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-5 hover:bg-[#1c1c1f] transition-colors"
            >
                <div className="flex items-center space-x-4">
                    <div className={cn(
                        "w-2 h-2 rounded-full",
                        isHealthy ? "bg-emerald-500" : "bg-amber-500"
                    )} />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">{module.module}</h3>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1.5 px-2 py-1 bg-[#09090b] rounded-md border border-[#27272a]">
                        <span className="text-[10px] text-gray-500 font-bold">CONFIDENCE</span>
                        <span className={cn(
                            "text-xs font-mono font-bold",
                            isHealthy ? "text-emerald-400" : "text-amber-400"
                        )}>{module.confidence_score}%</span>
                    </div>
                    {isExpanded ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
                </div>
            </button>

            {isExpanded && (
                <div className="px-5 pb-6 space-y-6 border-t border-[#27272a]/50 pt-6 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-2">
                        <p className="text-sm text-gray-300 leading-relaxed font-medium">
                            {module.summary}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center space-x-2">
                                <CheckCircle2 size={12} />
                                <span>Signals Detected</span>
                            </h4>
                            <ul className="space-y-2">
                                {module.signals.map((signal, i) => (
                                    <li key={i} className="text-xs text-gray-400 flex items-start space-x-2">
                                        <div className="w-1 h-1 bg-gray-600 rounded-full mt-1.5 shrink-0" />
                                        <span>{signal}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center space-x-2">
                                <AlertTriangle size={12} />
                                <span>Identified Risks</span>
                            </h4>
                            <ul className="space-y-2">
                                {module.risks.map((risk, i) => (
                                    <li key={i} className="text-xs text-gray-400 flex items-start space-x-2">
                                        <div className="w-1 h-1 bg-amber-900 rounded-full mt-1.5 shrink-0" />
                                        <span>{risk}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
