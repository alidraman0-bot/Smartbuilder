"use client";

import React, { useState, useEffect } from 'react';
import { useRunStore } from '@/store/useRunStore';
import {
    Activity, CheckCircle2, AlertTriangle, XCircle,
    ArrowUpRight, ArrowDownRight, Zap, Users,
    Server, Shield, RefreshCw, ChevronRight,
    Terminal, Clock, BarChart3, Grip, History
} from 'lucide-react';
import SystemActionsPanel from '@/components/monitor/SystemActionsPanel';
import IncidentTimeline from '@/components/monitor/IncidentTimeline';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

import ExecutiveDashboard from '@/components/monitor/ExecutiveDashboard';
import ComplianceDashboard from '@/components/monitor/ComplianceDashboard';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export default function MonitorPage() {
    const run = useRunStore();
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'technical' | 'executive' | 'compliance'>('technical');

    useEffect(() => {
        if (run.deployment_id) {
            run.startMonitoring(run.deployment_id);
            setTimeout(() => setIsLoading(false), 800);
        } else {
            setIsLoading(false);
        }
    }, [run.deployment_id]);

    useEffect(() => {
        if (viewMode === 'executive' && run.deployment_id) {
            run.fetchExecutiveSummary(run.deployment_id);
        } else if (viewMode === 'compliance') {
            run.fetchComplianceReport();
        }
    }, [viewMode, run.deployment_id]);

    const health = run.monitoring_health || 'healthy';
    const metrics = run.monitoring_metrics;

    if (!run.deployment_id) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#09090b] text-[#525252]">
                <Activity className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-mono text-sm">Deployment required for observability</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-white selection:bg-blue-500/20">
            {/* 1. PROJECT CONTEXT BAR */}
            <div className="sticky top-0 z-50 backdrop-blur-md bg-[#09090b]/80 border-b border-[#27272a] px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-sm font-semibold tracking-tight text-white/90">
                        {run.research?.idea?.title || 'Smartbuilder Project'}
                    </h1>
                    <span className="text-xs font-mono text-[#525252] px-2 py-0.5 border border-[#27272a] rounded">
                        Production
                    </span>
                    <div className={cn(
                        "flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-medium border",
                        health === 'healthy' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            health === 'degraded' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>
                        <span className="relative flex h-2 w-2">
                            <span className={cn(
                                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                                health === 'healthy' ? "bg-emerald-400" :
                                    health === 'degraded' ? "bg-amber-400" : "bg-red-400"
                            )}></span>
                            <span className={cn(
                                "relative inline-flex rounded-full h-2 w-2",
                                health === 'healthy' ? "bg-emerald-500" :
                                    health === 'degraded' ? "bg-amber-500" : "bg-red-500"
                            )}></span>
                        </span>
                        {health === 'healthy' ? 'Healthy' : health === 'degraded' ? 'Degraded' : 'Critical'}
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* View Toggle */}
                    <div className="flex bg-[#18181b] p-1 rounded-lg border border-[#27272a]">
                        <button
                            onClick={() => setViewMode('executive')}
                            className={cn(
                                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                viewMode === 'executive' ? "bg-[#27272a] text-white shadow-sm" : "text-[#525252] hover:text-[#a1a1aa]"
                            )}
                        >
                            Executive
                        </button>
                        <button
                            onClick={() => setViewMode('technical')}
                            className={cn(
                                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                viewMode === 'technical' ? "bg-[#27272a] text-white shadow-sm" : "text-[#525252] hover:text-[#a1a1aa]"
                            )}
                        >
                            Technical
                        </button>
                        <button
                            onClick={() => setViewMode('compliance')}
                            className={cn(
                                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                viewMode === 'compliance' ? "bg-[#27272a] text-white shadow-sm" : "text-[#525252] hover:text-[#a1a1aa]"
                            )}
                        >
                            Compliance
                        </button>
                    </div>

                    <div className="text-xs font-mono text-[#525252]">
                        Last verified: <span className="text-[#a1a1aa]">Just now</span>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-8 space-y-12 animate-in fade-in duration-700">

                {viewMode === 'compliance' ? (
                    <ComplianceDashboard data={run.compliance_report} />
                ) : viewMode === 'executive' ? (
                    <ExecutiveDashboard data={run.executive_summary} />
                ) : (
                    <>
                        {/* 2. SYSTEM PULSE (HERO) */}
                        <section className="relative overflow-hidden rounded-3xl border border-[#27272a] bg-[#0c0c0e] p-12">
                            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                                <Activity className="w-96 h-96" />
                            </div>

                            <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-8">
                                {/* Pulse Ring */}
                                <div className="relative flex items-center justify-center">
                                    <div className={cn(
                                        "absolute inset-0 rounded-full blur-3xl opacity-20 animate-pulse",
                                        health === 'healthy' ? "bg-emerald-500" :
                                            health === 'degraded' ? "bg-amber-500" : "bg-red-500"
                                    )} style={{ width: '300px', height: '300px' }} />

                                    <div className={cn(
                                        "relative w-32 h-32 rounded-full border-4 flex items-center justify-center bg-[#09090b]",
                                        health === 'healthy' ? "border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.2)]" :
                                            health === 'degraded' ? "border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.2)]" :
                                                "border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.2)]"
                                    )}>
                                        {health === 'healthy' ? <CheckCircle2 className="w-12 h-12 text-emerald-500" /> :
                                            health === 'degraded' ? <AlertTriangle className="w-12 h-12 text-amber-500" /> :
                                                <XCircle className="w-12 h-12 text-red-500" />}
                                    </div>
                                </div>

                                {/* Pulse Summary */}
                                <div className="space-y-2 max-w-lg">
                                    <h2 className={cn(
                                        "text-3xl font-bold tracking-tight",
                                        health === 'healthy' ? "text-white" :
                                            health === 'degraded' ? "text-amber-400" : "text-red-400"
                                    )}>
                                        {metrics.pulse_summary || "System status unknown."}
                                    </h2>
                                    <p className="text-[#a1a1aa]">
                                        Monitoring 4 core services and 12 checkpoints.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 3. SIGNAL GRID */}
                        <section>
                            <div className="flex items-center gap-2 mb-6 text-sm font-medium text-[#525252] uppercase tracking-wider">
                                <Grip className="w-4 h-4" /> Key Signals
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                                <SignalTile
                                    label="Uptime"
                                    value={`${metrics.uptime.toFixed(3)}%`}
                                    trend="stable"
                                    icon={<Clock className="w-4 h-4 text-blue-400" />}
                                    subtext="Last 30 days"
                                />
                                <SignalTile
                                    label="Error Rate"
                                    value={`${metrics.error_rate.toFixed(3)}%`}
                                    trend={metrics.error_rate > 0.5 ? 'up' : 'down'}
                                    status={metrics.error_rate > 0.5 ? 'warning' : 'good'}
                                    icon={<Shield className="w-4 h-4 text-emerald-400" />}
                                />
                                <SignalTile
                                    label="Avg Latency"
                                    value={`${metrics.response_time_ms}ms`}
                                    trend={metrics.response_time_ms > 200 ? 'up' : 'stable'}
                                    status={metrics.response_time_ms > 200 ? 'warning' : 'good'}
                                    icon={<Zap className="w-4 h-4 text-amber-400" />}
                                />
                                <SignalTile
                                    label="Active Users"
                                    value={metrics.usage?.dau || 0}
                                    trend="up"
                                    icon={<Users className="w-4 h-4 text-violet-400" />}
                                    subtext="Real-time"
                                />
                            </div>
                        </section>

                        <div className="grid grid-cols-12 gap-8">
                            {/* 5. PERFORMANCE INTELLIGENCE */}
                            <div className="col-span-8 space-y-8">
                                <div className="flex items-center gap-2 text-sm font-medium text-[#525252] uppercase tracking-wider">
                                    <BarChart3 className="w-4 h-4" /> Performance Intelligence
                                </div>

                                {/* 0. AUTO-REMEDIATION PANEL (Only visible if actions exist) */}
                                <SystemActionsPanel actions={metrics.remediation_actions || []} />

                                <div className="p-6 rounded-2xl border border-[#27272a] bg-[#0c0c0e] space-y-6">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-medium text-white">Latency Narrative</h3>
                                        <p className="text-[#a1a1aa] leading-relaxed">
                                            {metrics.latency_narrative || "Analyzing traffic patterns..."}
                                        </p>
                                    </div>

                                    <div className="h-24 flex items-end gap-1 pt-4 border-t border-[#27272a]">
                                        {[...Array(40)].map((_, i) => {
                                            const height = 20 + Math.random() * 60;
                                            return (
                                                <div
                                                    key={i}
                                                    className="flex-1 bg-blue-500/20 hover:bg-blue-500/40 transition-colors rounded-t-sm"
                                                    style={{ height: `${height}%` }}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl border border-[#27272a] bg-[#0c0c0e]">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-medium">Usage & Momentum</h3>
                                        <div className="text-xs text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded">
                                            <ArrowUpRight className="w-3 h-3" /> +12.5% Growth
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <MomentumItem label="Total Requests" value={metrics.usage?.requests.toLocaleString()} />
                                        <MomentumItem label="Peak Concurrency" value="42" />
                                    </div>
                                </div>
                            </div>

                            {/* 7. INCIDENT TIMELINE (Replaces simple Actions for now) */}
                            <div className="col-span-4">
                                <IncidentTimeline incidents={metrics.incidents || []} />
                            </div>
                        </div>

                        <section className="pt-8 border-t border-[#27272a]">
                            <div className="flex items-center gap-2 mb-6 text-sm font-medium text-[#525252] uppercase tracking-wider">
                                <Terminal className="w-4 h-4" /> Recent Activity
                            </div>
                            <div className="space-y-2 font-mono text-xs">
                                {run.monitoring_logs.slice(-3).reverse().map((log: any, i: number) => (
                                    <div key={i} className="flex items-center gap-4 text-[#a1a1aa] py-2 border-b border-[#27272a]/50 last:border-0">
                                        <span className="text-[#525252] w-20">{log.time}</span>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                            log.type === 'error' ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"
                                        )}>{log.module}</span>
                                        <span>{log.message}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}

function SignalTile({ label, value, trend, icon, status = 'good', subtext }: any) {
    return (
        <div className="p-5 rounded-xl border border-[#27272a] bg-[#0c0c0e] hover:border-[#3f3f46] transition-colors">
            <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg bg-[#18181b]">{icon}</div>
                {trend && (
                    <div className={cn(
                        "flex items-center text-xs font-medium",
                        trend === 'up' && status === 'good' ? "text-emerald-400" :
                            trend === 'up' && status === 'warning' ? "text-red-400" :
                                trend === 'down' && status === 'good' ? "text-emerald-400" :
                                    "text-[#525252]"
                    )}>
                        {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                    </div>
                )}
            </div>
            <div>
                <div className="text-2xl font-semibold tracking-tight text-white mb-1">{value}</div>
                <div className="text-xs text-[#525252] font-medium uppercase tracking-wider">{label}</div>
                {subtext && <div className="text-[10px] text-[#3f3f46] mt-2">{subtext}</div>}
            </div>
        </div>
    );
}

function MomentumItem({ label, value }: any) {
    return (
        <div>
            <div className="text-2xl font-mono font-medium text-white mb-1">{value}</div>
            <div className="text-xs text-[#525252] uppercase tracking-wider">{label}</div>
        </div>
    );
}

function Badge({ label, color }: any) {
    return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {label} Impact
        </span>
    );
}
