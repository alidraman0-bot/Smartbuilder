"use client";

import React from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

const STAGES = [
    { id: 'IDEA', label: 'Idea Gen' },
    { id: 'RESEARCH', label: 'Research' },
    { id: 'PLAN', label: 'Business Plan' },
    { id: 'PRD', label: 'PRD' },
    { id: 'MVP_BUILD', label: 'MVP Builder' },
    { id: 'DEPLOY', label: 'Deployment' },
    { id: 'MONITOR', label: 'Monitoring' }
];

export default function ExecutionProgress({ currentStage }: { currentStage: string }) {
    // Helper to determine status based on current stage index
    const getStatus = (stageId: string) => {
        const currentIndex = STAGES.findIndex(s => s.id === currentStage);
        const stageIndex = STAGES.findIndex(s => s.id === stageId);

        if (stageIndex < currentIndex) return 'completed';
        if (stageIndex === currentIndex) return 'active';
        return 'pending';
    };

    return (
        <div className="w-full border border-[#27272a] bg-[#18181b] p-6 rounded-md mb-6">
            <h3 className="text-xs font-bold text-[#52525b] uppercase tracking-widest mb-4">Execution Pipeline</h3>

            <div className="flex items-center justify-between relative">
                {/* Connecting Line */}
                <div className="absolute left-0 right-0 top-1/2 h-px bg-[#27272a] -z-10 transform -translate-y-1/2"></div>

                {STAGES.map((stage) => {
                    const status = getStatus(stage.id);

                    return (
                        <div key={stage.id} className="flex flex-col items-center bg-[#18181b] px-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors mb-2
                                ${status === 'completed' ? 'border-[#10b981] text-[#10b981] bg-[#10b981]/10' :
                                    status === 'active' ? 'border-blue-500 text-blue-500 bg-blue-500/10' :
                                        'border-[#27272a] text-[#52525b] bg-[#18181b]'}
                            `}>
                                {status === 'completed' && <CheckCircle2 size={14} />}
                                {status === 'active' && <Loader2 size={14} className="animate-spin" />}
                                {status === 'pending' && <Circle size={14} />}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${status === 'active' ? 'text-white' : 'text-[#52525b]'
                                }`}>
                                {stage.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
