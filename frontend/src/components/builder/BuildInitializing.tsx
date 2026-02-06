/**
 * S2: Build Initializing
 * 
 * Signals that control has shifted to the system.
 * - Progress header
 * - Deterministic step list
 * - Read-only execution log
 * - No preview, no file tree, no sidebar
 */

"use client";

import React, { useEffect } from 'react';
import { Terminal, CheckCircle2, Loader2 } from 'lucide-react';
import { useMvpBuilderStore } from '@/store/useMvpBuilderStore';

const INIT_STEPS = [
    { id: 1, label: 'Creating sandbox environment', duration: 300 },
    { id: 2, label: 'Installing dependencies', duration: 500 },
    { id: 3, label: 'Scaffolding project structure', duration: 400 },
    { id: 4, label: 'Booting development server', duration: 600 }
];

export default function BuildInitializing() {
    const { executionTimeline, projectName } = useMvpBuilderStore();
    const [currentStep, setCurrentStep] = React.useState(0);

    useEffect(() => {
        // Simulate deterministic progress
        const timer = setTimeout(() => {
            if (currentStep < INIT_STEPS.length) {
                setCurrentStep(prev => prev + 1);
            }
        }, INIT_STEPS[currentStep]?.duration || 500);

        return () => clearTimeout(timer);
    }, [currentStep]);

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6">
            <div className="w-full max-w-2xl space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-4 shadow-lg shadow-blue-500/30">
                        <Loader2 size={32} className="text-white animate-spin" strokeWidth={2.5} />
                    </div>

                    <h2 className="text-2xl font-bold text-white">
                        Initializing Build
                    </h2>
                    <p className="text-zinc-400">
                        {projectName}
                    </p>
                </div>

                {/* Deterministic Step List */}
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8">
                    <div className="space-y-4">
                        {INIT_STEPS.map((step, idx) => {
                            const isComplete = idx < currentStep;
                            const isActive = idx === currentStep;
                            const isPending = idx > currentStep;

                            return (
                                <div key={step.id} className="flex items-center space-x-4">
                                    {/* Status Icon */}
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white/10 bg-white/5">
                                        {isComplete && (
                                            <CheckCircle2 size={18} className="text-emerald-500" strokeWidth={2.5} />
                                        )}
                                        {isActive && (
                                            <Loader2 size={18} className="text-blue-500 animate-spin" strokeWidth={2.5} />
                                        )}
                                        {isPending && (
                                            <div className="w-2 h-2 rounded-full bg-zinc-700" />
                                        )}
                                    </div>

                                    {/* Step Label */}
                                    <div className="flex-1">
                                        <p className={`text-sm font-medium transition-colors ${isComplete ? 'text-zinc-500' :
                                                isActive ? 'text-blue-400 font-semibold' :
                                                    'text-zinc-600'
                                            }`}>
                                            {step.label}
                                        </p>
                                    </div>

                                    {/* Progress Indicator */}
                                    {isActive && (
                                        <div className="flex-shrink-0">
                                            <span className="text-xs text-blue-500 font-mono animate-pulse">
                                                IN PROGRESS
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Execution Log */}
                <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/10 flex items-center space-x-2">
                        <Terminal size={16} className="text-zinc-500" />
                        <span className="text-xs font-mono font-semibold text-zinc-500 uppercase tracking-wider">
                            Execution Log
                        </span>
                    </div>

                    <div className="p-6 h-64 overflow-y-auto space-y-2 font-mono text-xs">
                        {executionTimeline.length === 0 ? (
                            <p className="text-zinc-700">Initializing...</p>
                        ) : (
                            executionTimeline.map((log, idx) => (
                                <div key={idx} className="flex items-start space-x-3">
                                    <span className="text-zinc-700 shrink-0 w-20">
                                        {log.timestamp}
                                    </span>
                                    <span className={`${log.type === 'success' ? 'text-emerald-500' :
                                            log.type === 'warning' ? 'text-amber-500' :
                                                log.type === 'error' ? 'text-red-500' :
                                                    'text-blue-400'
                                        }`}>
                                        {log.message}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <p className="text-center text-xs text-zinc-600">
                    This may take a moment. Please do not refresh the page.
                </p>
            </div>
        </div>
    );
}
