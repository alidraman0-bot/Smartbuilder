'use client';

import React, { useEffect, useState } from 'react';
import {
    FileCode2, Database, Server, Layout, Link2, Rocket,
    CheckCircle2, Loader2, Circle, XCircle, Clock
} from 'lucide-react';

interface BuildStep {
    task_id: string;
    task_type: string;
    label: string;
    status: 'pending' | 'running' | 'complete' | 'failed';
}

interface Props {
    steps: BuildStep[];
    currentStep: string | null;
    progress: number;
    elapsedSeconds: number;
    status: string;
}

const STEP_ICONS: Record<string, React.ReactNode> = {
    architecture: <FileCode2 size={20} />,
    database: <Database size={20} />,
    backend: <Server size={20} />,
    frontend: <Layout size={20} />,
    integration: <Link2 size={20} />,
    run: <Rocket size={20} />,
};

const STATUS_LABELS: Record<string, string> = {
    reading_blueprint: 'Reading blueprint...',
    planning: 'Designing architecture...',
    building: 'Building your app...',
    running: 'Launching preview...',
    fixing: 'Auto-fixing errors...',
    complete: 'Build complete!',
    failed: 'Build failed',
};

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function BuildProgressPanel({ steps, currentStep, progress, elapsedSeconds, status }: Props) {
    const [displayProgress, setDisplayProgress] = useState(0);

    // Smooth progress animation
    useEffect(() => {
        const timer = setTimeout(() => {
            if (displayProgress < progress) {
                setDisplayProgress(prev => Math.min(prev + 1, progress));
            }
        }, 30);
        return () => clearTimeout(timer);
    }, [displayProgress, progress]);

    // Sync when progress jumps
    useEffect(() => {
        if (progress > displayProgress + 5) {
            setDisplayProgress(progress - 5);
        }
    }, [progress]);

    const getStepIcon = (step: BuildStep) => {
        switch (step.status) {
            case 'complete':
                return <CheckCircle2 size={20} className="text-emerald-400" />;
            case 'running':
                return <Loader2 size={20} className="text-blue-400 animate-spin" />;
            case 'failed':
                return <XCircle size={20} className="text-red-400" />;
            default:
                return <Circle size={20} className="text-zinc-600" />;
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Status Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-4">
                    <Clock size={14} className="text-zinc-400" />
                    <span className="text-xs font-mono text-zinc-400">{formatTime(elapsedSeconds)}</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-1">
                    {STATUS_LABELS[status] || 'Preparing...'}
                </h2>
                <p className="text-zinc-500 text-sm">
                    {status === 'complete' ? 'Your app is ready to preview' : 'This usually takes 1-3 minutes'}
                </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Progress</span>
                    <span className="text-xs font-mono text-zinc-400">{displayProgress}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                            width: `${displayProgress}%`,
                            background: status === 'failed'
                                ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                                : status === 'complete'
                                    ? 'linear-gradient(90deg, #10b981, #059669)'
                                    : 'linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)',
                        }}
                    />
                </div>
            </div>

            {/* Steps List */}
            <div className="space-y-1">
                {steps.map((step, index) => (
                    <div
                        key={step.task_id || index}
                        className={`
              flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300
              ${step.status === 'running'
                                ? 'bg-blue-500/10 border border-blue-500/20'
                                : step.status === 'complete'
                                    ? 'bg-emerald-500/5 border border-transparent'
                                    : step.status === 'failed'
                                        ? 'bg-red-500/10 border border-red-500/20'
                                        : 'bg-transparent border border-transparent'
                            }
            `}
                    >
                        {/* Status Icon */}
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                            {getStepIcon(step)}
                        </div>

                        {/* Step Info */}
                        <div className="flex-1 min-w-0">
                            <span className={`text-sm font-medium ${step.status === 'running' ? 'text-blue-300' :
                                    step.status === 'complete' ? 'text-emerald-300' :
                                        step.status === 'failed' ? 'text-red-300' :
                                            'text-zinc-500'
                                }`}>
                                {step.label || step.task_type}
                            </span>
                        </div>

                        {/* Task Icon */}
                        <div className={`shrink-0 ${step.status === 'running' ? 'text-blue-400' :
                                step.status === 'complete' ? 'text-emerald-400/50' :
                                    'text-zinc-700'
                            }`}>
                            {STEP_ICONS[step.task_type] || <Circle size={20} />}
                        </div>
                    </div>
                ))}

                {/* Show pre-pipeline steps */}
                {steps.length === 0 && (status === 'reading_blueprint' || status === 'planning') && (
                    <>
                        <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <Loader2 size={20} className="text-blue-400 animate-spin" />
                            <span className="text-sm font-medium text-blue-300">
                                {status === 'reading_blueprint' ? 'Reading blueprint...' : 'Designing architecture...'}
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
