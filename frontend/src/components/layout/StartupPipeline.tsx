import React, { useEffect, useState } from 'react';
import { Check, Circle, Dot } from 'lucide-react';

export type PipelineStage = 'IDEA' | 'RESEARCH' | 'PRD' | 'MVP' | 'LAUNCH' | 'MONITORING';

interface StageConfig {
    key: PipelineStage;
    label: string;
}

const STAGES: StageConfig[] = [
    { key: 'IDEA', label: 'Idea' },
    { key: 'RESEARCH', label: 'Research' },
    { key: 'PRD', label: 'PRD' },
    { key: 'MVP', label: 'MVP' },
    { key: 'LAUNCH', label: 'Launch' },
    { key: 'MONITORING', label: 'Monitoring' }
];

interface StartupPipelineProps {
    currentStage: PipelineStage;
}

const StartupPipeline: React.FC<StartupPipelineProps> = ({ currentStage }) => {
    const currentIndex = STAGES.findIndex(s => s.key === currentStage);

    const getStageStatus = (index: number) => {
        if (index < currentIndex) return 'completed';
        if (index === currentIndex) return 'active';
        return 'pending';
    };

    return (
        <div className="w-full py-8 px-4">
            <div className="relative flex items-center justify-between max-w-4xl mx-auto">
                {/* Background Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 z-0" />

                {/* Active Progress Line */}
                <div
                    className="absolute top-1/2 left-0 h-0.5 bg-indigo-500 -translate-y-1/2 z-0 transition-all duration-1000 ease-in-out shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                    style={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
                />

                {STAGES.map((stage, index) => {
                    const status = getStageStatus(index);

                    return (
                        <div key={stage.key} className="relative z-10 flex flex-col items-center group">
                            {/* Node */}
                            <div
                                className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2
                  ${status === 'completed' ? 'bg-indigo-500 border-indigo-400' : ''}
                  ${status === 'active' ? 'bg-[#0A0A0A] border-indigo-500 scale-125 shadow-[0_0_20px_rgba(99,102,241,0.4)]' : ''}
                  ${status === 'pending' ? 'bg-[#0A0A0A] border-white/10' : ''}
                `}
                            >
                                {status === 'completed' && (
                                    <Check className="w-5 h-5 text-white animate-in zoom-in duration-300" />
                                )}
                                {status === 'active' && (
                                    <div className="relative">
                                        <Circle className="w-6 h-6 text-indigo-500 animate-pulse" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Dot className="w-8 h-8 text-indigo-400" />
                                        </div>
                                    </div>
                                )}
                                {status === 'pending' && (
                                    <div className="w-2 h-2 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors" />
                                )}
                            </div>

                            {/* Label */}
                            <div className="absolute top-12 whitespace-nowrap">
                                <span
                                    className={`
                    text-[10px] font-bold uppercase tracking-widest transition-colors duration-500
                    ${status === 'active' ? 'text-white' : 'text-zinc-500'}
                  `}
                                >
                                    {stage.label}
                                </span>
                            </div>

                            {/* Status Glow for Active */}
                            {status === 'active' && (
                                <div className="absolute -inset-2 bg-indigo-500/20 rounded-full blur-xl animate-pulse z-[-1]" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StartupPipeline;
