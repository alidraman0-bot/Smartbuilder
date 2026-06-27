"use client";

import React from 'react';
import { FolderKanban, CheckCircle2, AlertTriangle, TrendingUp, DollarSign, Database } from 'lucide-react';

interface TopProjectsTableProps {
    projects: any;
    investorMode: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
    active: { label: 'Active', bg: 'rgba(59,130,246,0.1)', text: '#60a5fa' },
    in_progress: { label: 'Building', bg: 'rgba(139,92,246,0.1)', text: '#a78bfa' },
    completed: { label: 'Launched', bg: 'rgba(16,185,129,0.1)', text: '#34d399' },
    planning: { label: 'Planning', bg: 'rgba(255,255,255,0.05)', text: '#8a8a9a' },
};

export default function TopProjectsTable({ projects, investorMode }: TopProjectsTableProps) {
    if (!projects) return (
        <div className="rounded-2xl h-80 animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
    );

    const rows: any[] = projects.projects ?? [];
    const mask = (v: any) => investorMode ? '•••' : v;

    return (
        <div className="rounded-2xl overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
            }}>
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <FolderKanban size={16} className="text-purple-400" />
                    <span className="text-sm font-bold text-white">Project Performance</span>
                    <span className="text-[10px] text-zinc-600 font-mono">{projects.total} active</span>
                </div>
                <button className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors">
                    View Portfolio
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(140,140,160,0.5)' }}>
                            <th className="text-left px-5 py-3">Project</th>
                            <th className="text-left px-4 py-3">Status</th>
                            <th className="text-left px-4 py-3">Health</th>
                            <th className="text-right px-4 py-3">Progress</th>
                            <th className="text-right px-4 py-3">24h Traffic</th>
                            <th className="text-right px-4 py-3">Storage</th>
                            <th className="text-right px-5 py-3">Revenue</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/4">
                        {rows.map((p) => {
                            const status = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.planning;
                            return (
                                <tr key={p.id} className="group transition-colors hover:bg-white/[0.02]">
                                    <td className="px-5 py-3">
                                        <div className="flex flex-col min-w-[200px]">
                                            <span className="text-sm font-semibold text-white truncate">{p.name}</span>
                                            <span className="text-[10px] text-zinc-600 font-mono tracking-tight">{p.owner}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                                            style={{ background: status.bg, color: status.text }}>
                                            {status.label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center space-x-1.5">
                                            {p.health === 'healthy' ? (
                                                <CheckCircle2 size={12} className="text-emerald-400" />
                                            ) : (
                                                <AlertTriangle size={12} className="text-amber-400" />
                                            )}
                                            <span className="text-xs text-zinc-400 capitalize">{p.health}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex flex-col items-end space-y-1">
                                            <span className="text-xs font-mono text-zinc-300">{p.progress}%</span>
                                            <div className="w-16 h-1 rounded-full bg-white/5 overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500 rounded-full"
                                                    style={{ width: `${p.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end space-x-1.5">
                                            <TrendingUp size={11} className="text-emerald-400" />
                                            <span className="text-sm font-mono text-zinc-300">{p.api_calls_24h?.toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end space-x-1.5">
                                            <Database size={11} className="text-zinc-600" />
                                            <span className="text-sm font-mono text-zinc-300">{p.storage_gb}GB</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <div className="flex items-center justify-end space-x-1 font-mono">
                                            <DollarSign size={12} className={p.revenue > 0 ? 'text-emerald-400' : 'text-zinc-600'} />
                                            <span className={`text-sm font-bold ${p.revenue > 0 ? 'text-white' : 'text-zinc-600'}`}>
                                                {p.revenue > 0 ? mask(p.revenue) : '0'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
