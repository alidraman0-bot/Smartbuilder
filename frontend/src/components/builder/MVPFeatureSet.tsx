'use client';

import React from 'react';
import { Package, Link2, TrendingUp, AlertCircle } from 'lucide-react';
import { MVPFeatureSet as MVPFeatureSetType } from '@/types/businessplan';

interface MVPFeatureSetProps {
    data: MVPFeatureSetType;
}

export default function MVPFeatureSet({ data }: MVPFeatureSetProps) {
    const getPriorityColor = (priority: 'P0' | 'P1' | 'P2') => {
        switch (priority) {
            case 'P0': return 'border-red-500 bg-red-500/10 text-red-500';
            case 'P1': return 'border-yellow-500 bg-yellow-500/10 text-yellow-500';
            case 'P2': return 'border-blue-500 bg-blue-500/10 text-blue-500';
        }
    };

    const getComplexityColor = (complexity: 'Low' | 'Medium' | 'High') => {
        switch (complexity) {
            case 'Low': return 'text-emerald-500';
            case 'Medium': return 'text-yellow-500';
            case 'High': return 'text-orange-500';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">MVP Feature Set</h3>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Execution Contract</p>
                    </div>
                </div>

                {/* Feature Count */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#18181b] border border-[#27272a]">
                    <AlertCircle className="w-4 h-4 text-violet-500" />
                    <span className="text-sm font-medium text-gray-400">
                        {data?.features?.length || 0} Features Defined
                    </span>
                </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 gap-4">
                {(data?.features || []).map((feature, index) => (
                    <div
                        key={index}
                        className="bg-gradient-to-br from-[#18181b] to-[#0d0d10] border border-[#27272a] rounded-xl p-5 hover:border-blue-500/30 transition-all group"
                    >
                        {/* Header Row */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                    <span className="text-sm font-bold text-blue-500">{index + 1}</span>
                                </div>
                                <h4 className="text-base font-bold text-white group-hover:text-blue-500 transition-colors">
                                    {feature?.name || 'Unnamed Feature'}
                                </h4>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tighter border ${getPriorityColor(feature?.priority || 'P1')}`}>
                                {feature?.priority || 'P1'}
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                            {feature?.description || 'No description provided.'}
                        </p>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-[#09090b] rounded-lg p-3">
                                <div className="text-xs text-gray-500 mb-1">Build Complexity</div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full bg-blue-500`}
                                            style={{ width: `${(feature?.build_complexity || 0) * 10}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-bold text-white">{feature?.build_complexity || 0}/10</span>
                                </div>
                            </div>

                            <div className="bg-[#09090b] rounded-lg p-3">
                                <div className="text-xs text-gray-500 mb-1">Kill Criteria</div>
                                <div className="text-sm text-orange-400 font-medium truncate">
                                    {feature?.kill_criteria || 'None set'}
                                </div>
                            </div>
                        </div>

                        {/* Dependencies */}
                        {feature?.dependencies && feature.dependencies.length > 0 && (
                            <div className="flex items-center gap-2 text-xs">
                                <Link2 className="w-3 h-3 text-gray-500" />
                                <span className="text-gray-500">Dependencies: </span>
                                <div className="flex gap-2">
                                    {feature.dependencies.map((dep, dIdx) => (
                                        <span key={dIdx} className="bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-400">
                                            {dep}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {(!data?.features || data.features.length === 0) && (
                    <div className="text-center py-12 text-gray-500 text-sm border border-dashed border-[#27272a] rounded-xl">
                        No features defined for this MVP scope.
                    </div>
                )}
            </div>
        </div>
    );
}
