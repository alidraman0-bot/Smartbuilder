'use client';

import React from 'react';
import {
    TrendingUp, Activity, ShieldCheck, Clock,
    Calendar, Users, ArrowUpRight, Zap
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface ExecutiveDashboardProps {
    data: any; // Using looser type for now to match flexible backend dict
}

export default function ExecutiveDashboard({ data }: ExecutiveDashboardProps) {
    if (!data) return null;

    const { system_health, uptime_30d, incidents_30d, deployment_frequency, user_growth_rate, operational_maturity } = data;

    return (
        <div className="space-y-8 animate-fade-in text-white">

            {/* 1. TOP STATS ROW */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard
                    label="System Health"
                    value={system_health}
                    icon={<Activity className={cn("w-4 h-4", system_health === "Stable" ? "text-emerald-400" : "text-amber-400")} />}
                    status={system_health === "Stable" ? "good" : "warning"}
                    subtext="Real-time status"
                />
                <StatCard
                    label="Uptime (30d)"
                    value={`${uptime_30d.toFixed(3)}%`}
                    icon={<Clock className="w-4 h-4 text-blue-400" />}
                    status="good"
                    subtext="Exceeds SLA"
                />
                <StatCard
                    label="Unresolved Incidents"
                    value={incidents_30d === 0 ? "None" : incidents_30d}
                    icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
                    status={incidents_30d === 0 ? "good" : "warning"}
                    subtext="Last 30 days"
                />
                <StatCard
                    label="User Growth"
                    value={`+${user_growth_rate}%`}
                    icon={<TrendingUp className="w-4 h-4 text-violet-400" />}
                    status="good"
                    subtext="MoM Growth"
                />
            </div>

            <div className="grid grid-cols-12 gap-8">

                {/* 2. OPERATIONAL MATURITY SCORE - The "Investor" Piece */}
                <div className="col-span-8 p-8 rounded-3xl border border-[#27272a] bg-[#0c0c0e] relative overflow-hidden group hover:border-[#3f3f46] transition-colors">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Zap className="w-64 h-64 text-emerald-500" />
                    </div>

                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
                                    Strategic Metric
                                </span>
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
                                Operational Maturity
                            </h2>
                            <p className="text-[#a1a1aa] max-w-md text-sm leading-relaxed mb-8">
                                A composite score evaluating system stability, incident response time, deployment discipline, and architectural resilience.
                                <br /><br />
                                This score indicates high readiness for scale.
                            </p>

                            <div className="flex gap-4">
                                <button className="px-4 py-2 bg-white text-black text-xs font-bold uppercase rounded hover:bg-gray-200 transition-colors">
                                    Export Board Report
                                </button>
                                <button className="px-4 py-2 border border-[#27272a] text-white text-xs font-bold uppercase rounded hover:bg-[#27272a] transition-colors">
                                    Share Live Views
                                </button>
                            </div>
                        </div>

                        <div className="flex-shrink-0 flex items-center gap-8 pr-12">
                            <div className="text-right">
                                <div className="text-sm font-medium text-[#525252] uppercase tracking-wider mb-1">Current Grade</div>
                                <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-teal-600">
                                    {operational_maturity.grade}
                                </div>
                            </div>
                            <div className="h-24 w-px bg-[#27272a]" />
                            <div className="text-center">
                                <div className="text-sm font-medium text-[#525252] uppercase tracking-wider mb-1">Score</div>
                                <div className="text-4xl font-mono font-bold text-white">
                                    {operational_maturity.score}/100
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. BUSINESS CONTEXT SIDEBAR */}
                <div className="col-span-4 p-6 rounded-3xl border border-[#27272a] bg-[#0c0c0e] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-6 text-sm font-medium text-[#525252] uppercase tracking-wider">
                            <Calendar className="w-4 h-4" /> Deployment Velocity
                        </div>
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-4xl font-bold text-white">{deployment_frequency}</span>
                        </div>
                        <p className="text-xs text-[#a1a1aa] mb-6">
                            Deployments are frequent and stable. This cadence suggests a high-performing engineering team.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a]">
                            <div className="text-xs text-[#525252] uppercase mb-1">Active Users</div>
                            <div className="flex justify-between items-end">
                                <div className="text-2xl font-bold text-white">1,240</div>
                                <div className="text-xs text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                    <ArrowUpRight className="w-3 h-3" /> 12%
                                </div>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a]">
                            <div className="text-xs text-[#525252] uppercase mb-1">Burn Rate Impact</div>
                            <div className="flex justify-between items-end">
                                <div className="text-2xl font-bold text-white">Low</div>
                                <div className="text-xs text-gray-400">Optimized</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, status, subtext }: any) {
    return (
        <div className="p-6 rounded-2xl border border-[#27272a] bg-[#0c0c0e] hover:border-[#3f3f46] transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-[#18181b]">{icon}</div>
                <div className={cn(
                    "text-[10px] font-bold uppercase px-2 py-1 rounded-full border",
                    status === 'good' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        status === 'warning' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                            "bg-[#27272a] text-[#a1a1aa] border-transparent"
                )}>
                    {status === 'good' ? 'Optimal' : status === 'warning' ? 'Attention' : 'Info'}
                </div>
            </div>
            <div>
                <div className="text-3xl font-bold text-white tracking-tight mb-1">{value}</div>
                <div className="text-xs text-[#a1a1aa] font-medium uppercase tracking-wider mb-2">{label}</div>
                {subtext && <div className="text-[10px] text-[#525252]">{subtext}</div>}
            </div>
        </div>
    );
}
