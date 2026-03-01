'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { InvestmentVerdict as InvestmentVerdictType } from '@/types/businessplan';

interface InvestmentVerdictProps {
    data: InvestmentVerdictType;
}

export default function InvestmentVerdict({ data }: InvestmentVerdictProps) {
    const getVerdictConfig = (verdict: 'BUILD' | 'ITERATE' | 'ABANDON') => {
        switch (verdict) {
            case 'BUILD':
                return {
                    color: 'emerald',
                    bgGradient: 'from-emerald-500/20 to-green-600/20',
                    borderColor: 'border-emerald-500',
                    textColor: 'text-emerald-500',
                    icon: CheckCircle2,
                    message: 'This business has strong fundamentals and clear path to revenue',
                    action: 'Proceed to PRD Development'
                };
            case 'ITERATE':
                return {
                    color: 'yellow',
                    bgGradient: 'from-yellow-500/20 to-amber-600/20',
                    borderColor: 'border-yellow-500',
                    textColor: 'text-yellow-500',
                    icon: AlertTriangle,
                    message: 'Promising opportunity with unresolved questions requiring iteration',
                    action: 'Refine Strategy and Re-evaluate'
                };
            case 'ABANDON':
                return {
                    color: 'red',
                    bgGradient: 'from-red-500/20 to-orange-600/20',
                    borderColor: 'border-red-500',
                    textColor: 'text-red-500',
                    icon: XCircle,
                    message: 'Critical weaknesses outweigh potential. Not recommended for investment.',
                    action: 'Explore Alternative Ideas'
                };
        }
    };

    const config = getVerdictConfig(data?.verdict || 'ITERATE');
    const VerdictIcon = config.icon;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.bgGradient} border ${config.borderColor} flex items-center justify-center shadow-lg shadow-${config.color}-500/20`}>
                    <VerdictIcon className={`w-5 h-5 ${config.textColor}`} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Investment Readiness Verdict</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">AI Judgment</p>
                </div>
            </div>

            {/* Verdict Card */}
            <div className={`bg-gradient-to-br ${config.bgGradient} border-2 ${config.borderColor} rounded-2xl p-8 space-y-6 shadow-2xl shadow-${config.color}-500/10`}>
                {/* Verdict Badge */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`px-6 py-3 rounded-xl bg-[#09090b] border ${config.borderColor} shadow-lg`}>
                            <span className={`text-2xl font-black uppercase tracking-wider ${config.textColor}`}>
                                {data?.verdict || 'ITERATE'}
                            </span>
                        </div>
                        <div>
                            <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                Confidence Level
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-32 h-3 bg-[#27272a] rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r from-${config.color}-500 to-${config.color}-600 transition-all duration-1000`}
                                        style={{ width: `${data?.confidence || 0}%` }}
                                    />
                                </div>
                                <span className={`text-lg font-bold ${config.textColor}`}>
                                    {data?.confidence || 0}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Verdict Message */}
                <div className={`text-base font-medium ${config.textColor} leading-relaxed border-l-4 ${config.borderColor} pl-4`}>
                    {config.message}
                </div>

                {/* Reasoning Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Strong Signals */}
                    <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                                Strong Signals
                            </span>
                        </div>
                        <div className="space-y-2">
                            {(data?.reasoning_summary?.strong_signals || []).map((signal, index) => (
                                <div key={index} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-2" />
                                    <span className="text-sm text-gray-300">{signal}</span>
                                </div>
                            ))}
                            {(!data?.reasoning_summary?.strong_signals || data.reasoning_summary.strong_signals.length === 0) && (
                                <span className="text-xs text-gray-500 italic">No strong signals identified.</span>
                            )}
                        </div>
                    </div>

                    {/* Weak Signals */}
                    <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            <span className="text-xs font-bold uppercase tracking-wider text-yellow-500">
                                Weak Signals
                            </span>
                        </div>
                        <div className="space-y-2">
                            {(data?.reasoning_summary?.weak_signals || []).map((signal, index) => (
                                <div key={index} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0 mt-2" />
                                    <span className="text-sm text-gray-300">{signal}</span>
                                </div>
                            ))}
                            {(!data?.reasoning_summary?.weak_signals || data.reasoning_summary.weak_signals.length === 0) && (
                                <span className="text-xs text-gray-500 italic">No weak signals identified.</span>
                            )}
                        </div>
                    </div>

                    {/* Unknowns */}
                    <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-4 h-4 text-gray-500" />
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                Unknowns
                            </span>
                        </div>
                        <div className="space-y-2">
                            {(data?.reasoning_summary?.unknowns || []).map((unknown, index) => (
                                <div key={index} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0 mt-2" />
                                    <span className="text-sm text-gray-300">{unknown}</span>
                                </div>
                            ))}
                            {(!data?.reasoning_summary?.unknowns || data.reasoning_summary.unknowns.length === 0) && (
                                <span className="text-xs text-gray-500 italic">No unknowns identified.</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Next Action */}
                <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                        Recommended Next Action
                    </div>
                    <div className="text-base font-medium text-white">
                        {config.action}
                    </div>
                </div>
            </div>
        </div>
    );
}
