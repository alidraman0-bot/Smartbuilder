"use client";

import React from 'react';
import { Activity, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface PlatformHealthProps {
    system: any;
}

const STATUS_ICON: Record<string, React.ReactNode> = {
    operational: <CheckCircle2 size={13} className="text-emerald-400" />,
    degraded: <AlertTriangle size={13} className="text-amber-400" />,
    down: <XCircle size={13} className="text-rose-400" />,
};

const STATUS_COLOR: Record<string, string> = {
    operational: '#34d399',
    degraded: '#fbbf24',
    down: '#fb7185',
};

export default function PlatformHealth({ system }: PlatformHealthProps) {
    if (!system) return (
        <div className="rounded-2xl h-full animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
    );

    const services: any[] = system.services ?? [];
    const incidents: any[] = system.recent_incidents ?? [];
    const allOk = services.every((s: any) => s.status === 'operational');

    return (
        <div className="rounded-2xl p-5 space-y-5 h-full"
            style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                border: `1px solid ${allOk ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'}`,
            }}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Activity size={15} className={allOk ? 'text-emerald-400' : 'text-amber-400'} />
                    <span className="text-sm font-bold text-white">System Health</span>
                </div>
                <div className={`flex items-center space-x-1.5 px-2 py-1 rounded-lg text-[10px] font-bold ${allOk ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${allOk ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span>{allOk ? 'All Systems Go' : 'Degraded'}</span>
                </div>
            </div>

            {/* Top metrics */}
            <div className="grid grid-cols-3 gap-2">
                {[
                    { label: 'Uptime', value: `${system.uptime_pct}%`, color: '#34d399' },
                    { label: 'P95 Latency', value: `${system.p95_latency_ms}ms`, color: '#60a5fa' },
                    { label: 'Error Rate', value: `${system.error_rate_pct}%`, color: system.error_rate_pct > 1 ? '#fb7185' : '#fbbf24' },
                ].map(m => (
                    <div key={m.label} className="text-center rounded-lg py-2.5 px-1" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p className="text-xs font-bold font-mono" style={{ color: m.color }}>{m.value}</p>
                        <p className="text-[9px] text-zinc-600 mt-0.5 uppercase tracking-wide">{m.label}</p>
                    </div>
                ))}
            </div>

            {/* Services */}
            <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Services</p>
                {services.map((s: any) => (
                    <div key={s.name} className="flex items-center justify-between py-1.5 border-b border-white/4 last:border-0">
                        <div className="flex items-center space-x-2">
                            {STATUS_ICON[s.status] ?? STATUS_ICON.operational}
                            <span className="text-xs text-zinc-300">{s.name}</span>
                        </div>
                        <span className="text-[10px] font-mono" style={{ color: STATUS_COLOR[s.status] ?? '#34d399' }}>
                            {s.latency_ms}ms
                        </span>
                    </div>
                ))}
            </div>

            {/* Build queue */}
            <div className="flex items-center justify-between rounded-lg px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="text-[10px] text-zinc-500 space-y-0.5">
                    <p><span className="text-white font-bold">{system.active_builds}</span> active builds</p>
                    <p><span className="text-amber-400 font-bold">{system.queued_builds}</span> in queue</p>
                </div>
                <div className="text-right text-[10px] text-zinc-500 space-y-0.5">
                    <p><span className="text-indigo-400 font-bold">{system.sandbox_capacity_used_pct}%</span> sandbox</p>
                    <p><span className="text-blue-400 font-bold">{system.db_connections}</span>/{system.db_connections_max} DB</p>
                </div>
            </div>

            {/* Incidents */}
            {incidents.length > 0 && (
                <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Past Incidents</p>
                    {incidents.map((inc: any, i: number) => (
                        <div key={i} className="flex items-start space-x-2 py-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                            <div>
                                <p className="text-[11px] text-zinc-400 leading-tight">{inc.title}</p>
                                <p className="text-[9px] text-zinc-700 font-mono">{inc.date} · {inc.resolved ? 'Resolved' : 'Open'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
