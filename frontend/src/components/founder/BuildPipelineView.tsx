"use client";

import React from 'react';
import { Layers, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

const STAGES = [
    { id: 'intent', label: 'Intent Normalization', sub: 'Mapping natural language to FSM states' },
    { id: 'execution', label: 'AI Execution (Base44)', sub: 'Generating code and schema artifacts' },
    { id: 'validation', label: 'File Validation', sub: 'Strict syntax and cross-module checks' },
    { id: 'sandbox', label: 'Sandbox Runtime', sub: 'Deploying to isolated test environment' },
    { id: 'autofix', label: 'Auto-Fix Loop', sub: 'Healing detected runtime inconsistencies' },
    { id: 'stable', label: 'Stable Snapshot', sub: 'Committing validated build to registry' }
];

export default function BuildPipelineView() {
    // Simulated live pipeline for dashboard theatre
    const [activeIndex, setActiveIndex] = React.useState(1);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % STAGES.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                <Layers className="w-3 h-3" /> Live Build Execution Pipeline
            </div>

            <div className="grid grid-cols-6 gap-2">
                {STAGES.map((stage, i) => {
                    const status = i < activeIndex ? 'completed' : i === activeIndex ? 'active' : 'pending';

                    return (
                        <div key={stage.id} className={clsx(
                            "p-4 border transition-all duration-500",
                            status === 'completed' ? "border-emerald-200 bg-emerald-50/30" :
                                status === 'active' ? "border-black bg-white ring-1 ring-black" : "border-gray-100 bg-white"
                        )}>
                            <div className="flex items-center justify-between mb-2">
                                <div className={clsx(
                                    "text-[9px] font-black uppercase tracking-widest",
                                    status === 'completed' ? "text-emerald-600" :
                                        status === 'active' ? "text-black" : "text-gray-300"
                                )}>
                                    Stage {i + 1}
                                </div>
                                {status === 'completed' ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> :
                                    status === 'active' ? <Loader2 className="w-3 h-3 text-black animate-spin" /> : null}
                            </div>

                            <div className={clsx(
                                "text-[11px] font-bold uppercase tracking-tight mb-1",
                                status === 'pending' ? "text-gray-300" : "text-black"
                            )}>
                                {stage.label}
                            </div>

                            <div className={clsx(
                                "text-[9px] leading-tight",
                                status === 'pending' ? "text-gray-200" : "text-gray-400"
                            )}>
                                {stage.sub}
                            </div>

                            <div className="mt-4 h-1 bg-gray-100 overflow-hidden">
                                {status === 'active' && (
                                    <div className="h-full bg-black animate-progress-fast" style={{ width: '60%' }} />
                                )}
                                {status === 'completed' && (
                                    <div className="h-full bg-emerald-500 w-full" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
