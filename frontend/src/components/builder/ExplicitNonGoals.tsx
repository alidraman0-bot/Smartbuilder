'use client';

import React from 'react';
import { XCircle, Clock, AlertTriangle } from 'lucide-react';
import { ExplicitNonGoals as ExplicitNonGoalsType } from '@/types/businessplan';

interface ExplicitNonGoalsProps {
    data: ExplicitNonGoalsType;
}

export default function ExplicitNonGoals({ data }: ExplicitNonGoalsProps) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                    <XCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Explicit Non-Goals</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Speed Protection</p>
                </div>
            </div>

            {/* Enforcement Enabled Badge */}
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${data?.enforcement_enabled ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Scope Enforcement: {data?.enforcement_enabled ? 'Active' : 'Disabled'}
                </span>
            </div>

            {/* Non-Goals List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(data?.non_goals || []).map((goal, index) => (
                    <div
                        key={index}
                        className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 hover:border-red-500/20 transition-all flex items-start gap-4"
                    >
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                            <XCircle className="w-4 h-4 text-red-500" />
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed font-medium">
                            {goal}
                        </p>
                    </div>
                ))}
                {(!data?.non_goals || data.non_goals.length === 0) && (
                    <div className="md:col-span-2 text-center py-8 text-gray-500 text-sm border border-dashed border-[#27272a] rounded-xl">
                        No non-goals defined.
                    </div>
                )}
            </div>
        </div>
    );
}
