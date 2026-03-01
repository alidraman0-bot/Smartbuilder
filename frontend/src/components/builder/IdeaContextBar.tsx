'use client';

import React from 'react';
import { TrendingUp, Database, Clock, Target } from 'lucide-react';
import { IdeaContextBarData } from '@/types/businessplan';

interface IdeaContextBarProps {
    data: IdeaContextBarData;
}

export default function IdeaContextBar({ data }: IdeaContextBarProps) {
    const getConfidenceColor = (score: number) => {
        if (score >= 80) return 'from-emerald-500 to-green-600';
        if (score >= 60) return 'from-yellow-500 to-amber-600';
        return 'from-orange-500 to-red-600';
    };

    const getResearchDepthColor = (depth: number) => {
        if (depth >= 80) return 'text-emerald-500';
        if (depth >= 50) return 'text-yellow-500';
        return 'text-orange-500';
    };

    return (
        <div className="sticky top-0 z-50 bg-gradient-to-br from-[#09090b] via-[#0d0d10] to-[#09090b] border-b border-[#27272a] backdrop-blur-xl shadow-2xl">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between gap-6">
                    {/* Left: Idea Name & Category */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold text-white truncate">
                                {data?.idea_name || 'Untitled Idea'}
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {data?.market_category || 'Technology'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Center: Metrics */}
                    <div className="hidden lg:flex items-center gap-6">
                        {/* Confidence Score */}
                        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#18181b] border border-[#27272a]">
                            <div className="relative w-16 h-16">
                                {/* Circular Progress */}
                                <svg className="transform -rotate-90 w-16 h-16">
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        stroke="#27272a"
                                        strokeWidth="6"
                                        fill="none"
                                    />
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        className={`bg-gradient-to-r ${getConfidenceColor(data?.confidence_score || 0)}`}
                                        stroke="url(#confidenceGradient)"
                                        strokeWidth="6"
                                        fill="none"
                                        strokeDasharray={`${((data?.confidence_score || 0) / 100) * 175.93} 175.93`}
                                        strokeLinecap="round"
                                    />
                                    <defs>
                                        <linearGradient id="confidenceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" className={(data?.confidence_score || 0) >= 80 ? "stop-emerald-500" : (data?.confidence_score || 0) >= 60 ? "stop-yellow-500" : "stop-orange-500"} />
                                            <stop offset="100%" className={(data?.confidence_score || 0) >= 80 ? "stop-green-600" : (data?.confidence_score || 0) >= 60 ? "stop-amber-600" : "stop-red-600"} />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-lg font-bold text-white">{data?.confidence_score || 0}</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-xs font-bold uppercase tracking-widest text-gray-500">
                                    Confidence
                                </div>
                                <div className="text-sm font-medium text-gray-400">
                                    {(data?.confidence_score || 0) >= 80 ? 'High' : (data?.confidence_score || 0) >= 60 ? 'Medium' : 'Low'} Signal
                                </div>
                            </div>
                        </div>

                        {/* Research Depth */}
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#18181b] border border-[#27272a]">
                            <Database className={`w-5 h-5 ${getResearchDepthColor(data?.research_depth || 0)}`} />
                            <div>
                                <div className="text-xs font-bold uppercase tracking-widest text-gray-500">
                                    Research Depth
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-[#27272a] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full bg-gradient-to-r ${getConfidenceColor(data?.research_depth || 0)} transition-all duration-500`}
                                            style={{ width: `${data?.research_depth || 0}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-white">
                                        {data?.research_depth || 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Last Updated */}
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#18181b] border border-[#27272a]">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <div className="text-right">
                            <div className="text-xs font-bold uppercase tracking-widest text-gray-500">
                                Updated
                            </div>
                            <div className="text-sm font-medium text-white">
                                {data?.last_updated ? new Date(data.last_updated).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }) : 'Pending'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile: Stacked Metrics */}
                <div className="lg:hidden mt-4 grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#18181b] border border-[#27272a]">
                        <TrendingUp className={`w-4 h-4 ${(getConfidenceColor(data?.confidence_score || 0)).includes('emerald') ? 'text-emerald-500' : 'text-yellow-500'}`} />
                        <div>
                            <div className="text-xs text-gray-500">Confidence</div>
                            <div className="text-sm font-bold text-white">{data?.confidence_score || 0}%</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#18181b] border border-[#27272a]">
                        <Database className={`w-4 h-4 ${getResearchDepthColor(data?.research_depth || 0)}`} />
                        <div>
                            <div className="text-xs text-gray-500">Research</div>
                            <div className="text-sm font-bold text-white">{data?.research_depth || 0}%</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
