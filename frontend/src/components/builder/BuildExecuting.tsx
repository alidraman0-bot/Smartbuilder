/**
 * S3: Build Executing
 * 
 * Base44's "building UI".
 * Purpose: Show momentum, prevent user actions, maintain confidence.
 * 
 * Rules:
 * - Preview hidden
 * - User can OBSERVE ONLY (no typing/clicking/modifying)
 */

"use client";

import React from 'react';
import {
    Terminal, FileCode, CheckCircle2, Circle,
    Activity, ShieldCheck, Database, Layout
} from 'lucide-react';
import { useMvpBuilderStore } from '@/store/useMvpBuilderStore';

export default function BuildExecuting() {
    const { executionTimeline, currentFiles, projectName } = useMvpBuilderStore();
    const logEndRef = React.useRef<HTMLDivElement>(null);

    // Auto-scroll logs
    React.useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [executionTimeline]);

    // Calculate stats
    const fileCount = currentFiles.length;
    const componentCount = currentFiles.filter(f => f.path.includes('components')).length;
    const apiCount = currentFiles.filter(f => f.path.includes('api')).length;

    return (
        <div className="h-[calc(100vh-80px)] p-6 grid grid-cols-12 gap-6">
            {/* Left Panel: Execution Feed */}
            <div className="col-span-4 flex flex-col space-y-6">
                {/* Header */}
                <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 shadow-lg shadow-black/20">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <h2 className="text-lg font-bold text-white tracking-wide">
                            BUILD EXECUTING
                        </h2>
                    </div>
                    <p className="text-sm text-zinc-400">
                        Generating MVP codebase for <span className="text-white font-semibold">{projectName}</span>.
                        Please wait while the system constructs your application.
                    </p>
                </div>

                {/* Timeline Feed */}
                <div className="flex-1 bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-[#27272a] bg-[#09090b] flex items-center justify-between">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            System Ops
                        </span>
                        <Activity size={12} className="text-blue-500 animate-pulse" />
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {executionTimeline.length === 0 && (
                            <div className="text-xs text-zinc-600 italic">Waiting for operations...</div>
                        )}

                        {executionTimeline.map((event, idx) => (
                            <div key={idx} className="flex space-x-3 animate-slide-up">
                                <div className="flex flex-col items-center">
                                    <div className={`w-2 h-2 rounded-full mt-1.5 ${event.type === 'success' ? 'bg-emerald-500' :
                                            event.type === 'error' ? 'bg-red-500' :
                                                event.type === 'warning' ? 'bg-amber-500' :
                                                    'bg-blue-500'
                                        }`} />
                                    {idx !== executionTimeline.length - 1 && (
                                        <div className="w-px h-full bg-[#27272a] my-1" />
                                    )}
                                </div>
                                <div className="flex-1 pb-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-xs font-semibold ${event.type === 'success' ? 'text-emerald-400' :
                                                event.type === 'error' ? 'text-red-400' :
                                                    'text-blue-400'
                                            }`}>
                                            {event.type.toUpperCase()}
                                        </span>
                                        <span className="text-[10px] font-mono text-zinc-600">
                                            {event.timestamp}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                                        {event.message}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div ref={logEndRef} />
                    </div>
                </div>
            </div>

            {/* Right Panel: Momentum & Stats */}
            <div className="col-span-8 flex flex-col space-y-6">

                {/* Generation Counters */}
                <div className="grid grid-cols-3 gap-6">
                    <StatsCard
                        label="Total Files"
                        value={fileCount}
                        icon={<FileCode size={18} />}
                        color="text-indigo-400"
                        borderColor="border-indigo-500/20"
                        bgGradient="from-indigo-500/10 to-indigo-500/5"
                    />
                    <StatsCard
                        label="Components"
                        value={componentCount}
                        icon={<Layout size={18} />}
                        color="text-pink-400"
                        borderColor="border-pink-500/20"
                        bgGradient="from-pink-500/10 to-pink-500/5"
                    />
                    <StatsCard
                        label="API Endpoints"
                        value={apiCount}
                        icon={<Database size={18} />}
                        color="text-emerald-400"
                        borderColor="border-emerald-500/20"
                        bgGradient="from-emerald-500/10 to-emerald-500/5"
                    />
                </div>

                {/* Main Visual: Hidden Preview / Computing State */}
                <div className="flex-1 bg-[#09090b] border border-[#27272a] rounded-xl relative overflow-hidden flex flex-col items-center justify-center">
                    {/* Background Grid & Effects */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent" />

                    {/* Central Loader */}
                    <div className="relative z-10 flex flex-col items-center space-y-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full animate-pulse" />
                            <div className="w-24 h-24 rounded-full border-4 border-t-blue-500 border-r-blue-500 border-b-blue-900 border-l-blue-900 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Terminal size={32} className="text-blue-400" />
                            </div>
                        </div>

                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold text-white tracking-widest uppercase">
                                Analyzing & Constructing
                            </h3>
                            <p className="text-sm text-zinc-500 max-w-md mx-auto">
                                Smartbuilder is generating the solution architecture based on your PRD requirements.
                            </p>
                        </div>

                        {/* Current Action Pill */}
                        <div className="flex items-center space-x-3 px-4 py-2 bg-[#18181b] border border-[#27272a] rounded-full shadow-xl">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-mono text-zinc-300">
                                Writing: src/components/Sidebar.tsx...
                            </span>
                        </div>
                    </div>
                </div>

                {/* Validation Status */}
                <div className="h-16 bg-[#18181b] border border-[#27272a] rounded-xl flex items-center px-6 justify-between">
                    <div className="flex items-center space-x-3 text-zinc-400">
                        <ShieldCheck size={16} />
                        <span className="text-xs uppercase tracking-wider font-semibold">Security & Type Check</span>
                    </div>

                    <div className="flex items-center space-x-6">
                        <StatusItem label="Typescript" status="pending" />
                        <StatusItem label="ESLint" status="pending" />
                        <StatusItem label="Dependency Audit" status="success" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatsCard({ label, value, icon, color, borderColor, bgGradient }: any) {
    return (
        <div className={`p-5 rounded-xl border ${borderColor} bg-gradient-to-br ${bgGradient} backdrop-blur-sm relative overflow-hidden group`}>
            <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</span>
                <div className={`${color} p-2 rounded-lg bg-white/5`}>
                    {icon}
                </div>
            </div>
            <div className={`text-4xl font-mono font-bold text-white tracking-tight`}>
                {String(value).padStart(2, '0')}
            </div>
            {/* Hover glow */}
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${color.replace('text-', 'bg-')}/10 blur-2xl rounded-full group-hover:scale-150 transition-transform duration-500`} />
        </div>
    );
}

function StatusItem({ label, status }: { label: string, status: 'pending' | 'active' | 'success' }) {
    return (
        <div className="flex items-center space-x-2">
            {status === 'success' ? (
                <CheckCircle2 size={14} className="text-emerald-500" />
            ) : status === 'active' ? (
                <Activity size={14} className="text-blue-500 animate-spin" />
            ) : (
                <Circle size={14} className="text-zinc-700" />
            )}
            <span className={`text-xs font-medium ${status === 'success' ? 'text-zinc-300' : 'text-zinc-600'
                }`}>
                {label}
            </span>
        </div>
    );
}
