"use client";

import React from 'react';
import { Users, DollarSign, FolderKanban, Zap, Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
    label: string;
    value: string;
    sub?: string;
    changePct?: number;
    icon: React.ReactElement;
    color: 'indigo' | 'emerald' | 'purple' | 'amber' | 'blue' | 'rose';
    masked?: boolean;
}


const COLOR_MAP = {
    indigo: { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)', text: '#818cf8', glow: 'rgba(99,102,241,0.15)' },
    emerald: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', text: '#34d399', glow: 'rgba(16,185,129,0.15)' },
    purple: { bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)', text: '#a78bfa', glow: 'rgba(139,92,246,0.15)' },
    amber: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', text: '#fbbf24', glow: 'rgba(245,158,11,0.15)' },
    blue: { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', text: '#60a5fa', glow: 'rgba(59,130,246,0.15)' },
    rose: { bg: 'rgba(244,63,94,0.08)', border: 'rgba(244,63,94,0.2)', text: '#fb7185', glow: 'rgba(244,63,94,0.15)' },
};

function KpiCard({ label, value, sub, changePct, icon, color, masked }: KpiCardProps) {
    const c = COLOR_MAP[color];
    const isPositive = changePct !== undefined && changePct > 0;
    const isNegative = changePct !== undefined && changePct < 0;
    const displayVal = masked ? '••••••' : value;

    return (
        <div
            className="rounded-2xl p-5 relative overflow-hidden group cursor-default transition-all duration-300 hover:-translate-y-1"
            style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                border: `1px solid ${c.border}`,
                boxShadow: `0 8px 32px -8px ${c.glow}`,
            }}
        >
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${c.text} 0%, transparent 70%)`, transform: 'translate(30%, -30%)' }} />

            <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: c.bg }}>
                    {React.cloneElement(icon as React.ReactElement<any>, { size: 18, color: c.text })}
                </div>
                {changePct !== undefined && (
                    <div className={`flex items-center space-x-1 text-xs font-bold px-2 py-1 rounded-lg ${isPositive ? 'text-emerald-400 bg-emerald-500/10' : isNegative ? 'text-rose-400 bg-rose-500/10' : 'text-zinc-500 bg-zinc-800'}`}>
                        {isPositive ? <TrendingUp size={11} /> : isNegative ? <TrendingDown size={11} /> : null}
                        <span>{isPositive ? '+' : ''}{changePct?.toFixed(1)}%</span>
                    </div>
                )}
            </div>

            <div className="space-y-1">
                <p className="text-2xl font-bold text-white tracking-tight font-mono">{displayVal}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: 'rgba(180,180,196,0.6)' }}>{label}</p>
                {sub && <p className="text-[10px] mt-1" style={{ color: 'rgba(140,140,160,0.5)' }}>{sub}</p>}
            </div>
        </div>
    );
}

interface PlatformKpiRowProps {
    stats: any;
    investorMode: boolean;
}

export default function PlatformKpiRow({ stats, investorMode }: PlatformKpiRowProps) {
    if (!stats) return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
            ))}
        </div>
    );

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="w-1 h-5 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
                    <span className="text-sm font-bold text-white">Platform KPIs</span>
                    <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Live · 30s refresh</span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                <KpiCard
                    label="Total Users"
                    value={stats.total_users?.toLocaleString() ?? '—'}
                    sub={`${stats.active_users_30d?.toLocaleString()} active (30d)`}
                    changePct={stats.users_change_pct}
                    icon={<Users />}
                    color="indigo"
                    masked={investorMode}
                />
                <KpiCard
                    label="MRR"
                    value={`$${stats.mrr?.toLocaleString() ?? '—'}`}
                    sub={`ARR $${stats.arr?.toLocaleString()}`}
                    changePct={stats.mrr_change_pct}
                    icon={<DollarSign />}
                    color="emerald"
                    masked={investorMode}
                />
                <KpiCard
                    label="Active Projects"
                    value={stats.active_projects?.toLocaleString() ?? '—'}
                    changePct={stats.projects_change_pct}
                    icon={<FolderKanban />}
                    color="purple"
                />
                <KpiCard
                    label="AI Calls Today"
                    value={stats.total_ai_calls_today?.toLocaleString() ?? '—'}
                    changePct={stats.ai_calls_change_pct}
                    icon={<Zap />}
                    color="amber"
                />
                <KpiCard
                    label="Avg Build Time"
                    value={`${Math.floor((stats.avg_build_time_sec ?? 0) / 60)}m ${(stats.avg_build_time_sec ?? 0) % 60}s`}
                    sub={`${stats.build_success_rate}% success rate`}
                    changePct={stats.avg_build_time_change_pct}
                    icon={<Clock />}
                    color="blue"
                />
                <KpiCard
                    label="Churn Rate"
                    value={`${stats.churn_rate ?? '—'}%`}
                    sub={`${stats.deployments_today} deploys today`}
                    icon={<TrendingDown />}
                    color="rose"
                />
            </div>
        </div>
    );
}
