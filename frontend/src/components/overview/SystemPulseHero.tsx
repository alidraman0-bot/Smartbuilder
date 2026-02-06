'use client';

import React from 'react';
import { Activity, ArrowRight, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useRunStore } from '@/store/useRunStore';
import { useDashboardStore } from '@/store/useDashboardStore';
import Link from 'next/link';

export default function SystemPulseHero() {
    const run = useRunStore();
    const dashboard = useDashboardStore();
    const health = run.monitoring_health || 'healthy';
    const metrics = run.monitoring_metrics;

    const getStatusColor = () => {
        if (health === 'healthy') return 'text-emerald-500';
        if (health === 'degraded') return 'text-amber-500';
        return 'text-red-500';
    };

    const getPulseColor = () => {
        if (health === 'healthy') return 'bg-emerald-500';
        if (health === 'degraded') return 'bg-amber-500';
        return 'bg-red-500';
    };

    return (
        <div className="relative overflow-hidden h-[520px] rounded-3xl border border-white/10 bg-[#0c0c0e] p-8 flex flex-col items-center justify-center text-center group cursor-default">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />

            {/* Ambient Glow */}
            <div className={`absolute inset-0 opacity-10 blur-3xl ${getPulseColor()}`} />

            <div className="relative z-10 flex flex-col items-center">
                {/* Pulse Ring */}
                <div className="relative mb-8">
                    <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 animate-pulse ${getPulseColor()}`} style={{ width: '160px', height: '160px', left: '-20px', top: '-20px' }} />
                    <div className={`relative w-32 h-32 rounded-full border-4 flex items-center justify-center bg-[#09090b] ${getStatusColor()} border-current/20`}>
                        {health === 'healthy' ? <CheckCircle2 className="w-12 h-12" /> :
                            health === 'degraded' ? <AlertTriangle className="w-12 h-12" /> :
                                <XCircle className="w-12 h-12" />}
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">System is {health}</h2>
                <p className="text-gray-400 mb-8 max-w-xs text-sm font-medium">
                    {metrics.pulse_summary || `Managing ${dashboard.stats?.active_projects || 0} active project nodes with automated health reconciliation.`}
                </p>

                <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Uptime</div>
                        <div className="text-xl font-mono font-bold text-emerald-400">{metrics.uptime.toFixed(1)}%</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Latency</div>
                        <div className="text-xl font-mono font-bold text-indigo-400">{metrics.response_time_ms}ms</div>
                    </div>
                </div>

                <Link href="/monitor" className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full text-sm font-medium hover:scale-105 transition-transform">
                    <span>View Monitoring</span>
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
