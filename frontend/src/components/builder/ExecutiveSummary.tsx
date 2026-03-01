'use client';

import React, { useState } from 'react';
import { TrendingUp, Info, AlertCircle, CheckCircle2, Eye } from 'lucide-react';
import { ExecutiveSummary as ExecutiveSummaryType, AssertionWithEvidence } from '@/types/businessplan';

interface ExecutiveSummaryProps {
    data: ExecutiveSummaryType;
}

export default function ExecutiveSummary({ data }: ExecutiveSummaryProps) {
    const [hoveredAssertion, setHoveredAssertion] = useState<number | null>(null);

    const getConfidenceBadgeColor = (confidence: 'Low' | 'Medium' | 'High') => {
        switch (confidence) {
            case 'High': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'Medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'Low': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Executive Summary</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Decision Narrative</p>
                </div>
            </div>

            {/* Assertions with Evidence */}
            <div className="space-y-4">
                {(data?.assertions || []).map((assertion, index) => (
                    <div
                        key={index}
                        className="group relative bg-gradient-to-br from-[#18181b] to-[#0d0d10] border border-[#27272a] rounded-xl p-5 hover:border-emerald-500/30 transition-all duration-300"
                        onMouseEnter={() => setHoveredAssertion(index)}
                        onMouseLeave={() => setHoveredAssertion(null)}
                    >
                        {/* Assertion Text */}
                        <p className="text-gray-200 leading-relaxed mb-3 group-hover:text-white transition-colors">
                            {assertion?.text || 'No description available'}
                        </p>

                        {/* Evidence Badge - Always Visible */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getConfidenceBadgeColor(assertion?.evidence?.assumption_confidence || 'Medium')}`}>
                                {assertion?.evidence?.assumption_confidence || 'Medium'} Confidence
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Eye className="w-3 h-3" />
                                <span>Hover for evidence</span>
                            </div>
                        </div>

                        {/* Evidence Tooltip - Shown on Hover */}
                        {hoveredAssertion === index && assertion?.evidence && (
                            <div className="absolute left-0 right-0 top-full mt-2 z-10 bg-[#09090b] border border-emerald-500/20 rounded-xl p-4 shadow-2xl shadow-emerald-500/10 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="flex items-start gap-3">
                                    <Info className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <div className="space-y-2 flex-1">
                                        <div>
                                            <div className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-1">
                                                Data Source
                                            </div>
                                            <div className="text-sm text-gray-300">
                                                {assertion.evidence.data_source || 'Unknown source'}
                                            </div>
                                        </div>
                                        {assertion.evidence.market_signal && (
                                            <div>
                                                <div className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-1">
                                                    Market Signal
                                                </div>
                                                <div className="text-sm text-gray-300">
                                                    {assertion.evidence.market_signal}
                                                </div>
                                            </div>
                                        )}
                                        {assertion.evidence.assumption_id && (
                                            <div className="text-xs text-gray-500 font-mono">
                                                ID: {assertion.evidence.assumption_id}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {(!data?.assertions || data.assertions.length === 0) && (
                    <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-[#27272a] rounded-xl">
                        No executive summary insights generated.
                    </div>
                )}
            </div>

            {/* Hidden System Insights */}
            {data?.hidden_system && (
                <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-5 space-y-4">
                    <div className="flex items-center gap-2 text-violet-500">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">System Analysis</span>
                    </div>

                    {/* Confidence-Weighted Assertions */}
                    {data.hidden_system.confidence_weighted_assertions && data.hidden_system.confidence_weighted_assertions.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                Confidence-Weighted Insights
                            </h4>
                            <div className="space-y-2">
                                {data.hidden_system.confidence_weighted_assertions.map((insight, index) => (
                                    <div key={index} className="flex items-start gap-2 text-sm text-gray-400">
                                        <CheckCircle2 className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
                                        <span>{insight}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Assumption Dependencies */}
                    {data.hidden_system.assumption_dependencies && data.hidden_system.assumption_dependencies.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                Critical Assumptions
                            </h4>
                            <div className="space-y-2">
                                {data.hidden_system.assumption_dependencies.map((assumption, index) => (
                                    <div key={index} className="flex items-start gap-2 text-sm text-gray-400">
                                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0 mt-2" />
                                        <span>{assumption}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
