'use client';

import React, { useState, useEffect } from 'react';
import {
    Search,
    TrendingUp,
    AlertCircle,
    Target,
    Rocket,
    Loader2,
    CheckCircle2,
    Circle
} from 'lucide-react';

interface ThinkingStep {
    id: number;
    label: string;
    icon: React.ReactNode;
}

const STEPS: ThinkingStep[] = [
    { id: 1, label: 'Scanning startup discussions...', icon: <Search className="w-5 h-5" /> },
    { id: 2, label: 'Analyzing market trends...', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 3, label: 'Detecting problems founders complain about...', icon: <AlertCircle className="w-5 h-5" /> },
    { id: 4, label: 'Estimating market potential...', icon: <Target className="w-5 h-5" /> },
    { id: 5, label: 'Generating opportunities...', icon: <Rocket className="w-5 h-5" /> },
];

interface ThinkingPanelProps {
    onComplete: () => void;
}

export default function ThinkingPanel({ onComplete }: ThinkingPanelProps) {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (currentStep < STEPS.length) {
            // Each step takes about 0.8s to 1.2s
            const timer = setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, 700 + Math.random() * 500);
            return () => clearTimeout(timer);
        } else {
            // Final delay before completion
            const finalTimer = setTimeout(() => {
                onComplete();
            }, 500);
            return () => clearTimeout(finalTimer);
        }
    }, [currentStep, onComplete]);

    return (
        <div className="flex flex-col items-center justify-center py-12 px-6 max-w-2xl mx-auto w-full animate-in fade-in duration-500">
            <div className="mb-0 text-center">
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-4">
                    AI is analyzing 12,483 startup signals
                </p>
            </div>

            <div className="w-full bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(79,70,229,0.2)]">
                <div className="space-y-6">
                    {STEPS.map((step, idx) => {
                        const isActive = idx === currentStep;
                        const isCompleted = idx < currentStep;

                        return (
                            <div
                                key={step.id}
                                className={`flex items-center space-x-4 transition-all duration-300 ${isActive ? 'scale-105 opacity-100' : isCompleted ? 'opacity-50' : 'opacity-20 grayscale'
                                    }`}
                            >
                                <div className={`p-2.5 rounded-xl border transition-colors duration-300 ${isActive ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' :
                                        isCompleted ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                            'bg-white/5 border-white/5 text-zinc-500'
                                    }`}>
                                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : step.icon}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className={`text-sm font-medium transition-colors duration-300 ${isActive ? 'text-white' : isCompleted ? 'text-zinc-400' : 'text-zinc-600'
                                            }`}>
                                            {step.label}
                                        </p>
                                        {isActive && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Progress Bar */}
                <div className="mt-10 pt-6 border-t border-white/5">
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] animate-shimmer transition-all duration-500"
                            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
