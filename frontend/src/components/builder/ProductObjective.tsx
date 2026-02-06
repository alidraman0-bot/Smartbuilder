'use client';

import React from 'react';
import { Lock, AlertCircle, Lightbulb } from 'lucide-react';
import { ProductObjective as ProductObjectiveType } from '@/types/businessplan';

interface ProductObjectiveProps {
    data: ProductObjectiveType;
}

export default function ProductObjective({ data }: ProductObjectiveProps) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                    <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Product Objective</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Single Source of Truth</p>
                </div>
            </div>

            {/* Objective Statement */}
            <div className="bg-gradient-to-br from-[#18181b] to-[#0d0d10] border-2 border-violet-500/30 rounded-xl p-6 space-y-4 shadow-xl shadow-violet-500/10">
                {/* Immutable Badge */}
                {data.is_immutable && (
                    <div className="flex items-center gap-2 text-violet-500">
                        <Lock className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                            Immutable — Changes Require Full Re-evaluation
                        </span>
                    </div>
                )}

                {/* Statement */}
                <p className="text-lg leading-relaxed text-gray-200 font-medium">
                    {data.objective}
                </p>

                {/* Ripple Effect Warning */}
                {data.ripple_effects && data.ripple_effects.length > 0 && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <div className="text-xs font-bold uppercase tracking-wider text-yellow-500 mb-1">
                                Change Impact Warning
                            </div>
                            <div className="space-y-1">
                                {data.ripple_effects.map((effect, idx) => (
                                    <p key={idx} className="text-sm text-gray-300">• {effect}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
