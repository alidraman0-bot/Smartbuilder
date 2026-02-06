"use client";

import React from 'react';
import { useFounderStore } from '@/store/useFounderStore';
import { GitBranch, Github, HardDrive, ShieldExclamation, Terminal } from 'lucide-react';
import clsx from 'clsx';

export default function VcsCodeHealth() {
    const { vcsHealth } = useFounderStore();

    if (!vcsHealth) return <div className="h-48 animate-pulse bg-gray-50 border border-gray-100" />;

    return (
        <div className="grid grid-cols-12 gap-8">
            {/* Code Health Metrics */}
            <div className="col-span-12 lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                    <GitBranch className="w-3 h-3" /> Code Health Intelligence
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <HealthTile
                        label="AI Commits (24h)"
                        value={vcsHealth.vcs.ai_commits}
                        icon={<Terminal className="w-3 h-3 text-black" />}
                    />
                    <HealthTile
                        label="Stability Score"
                        value={`${vcsHealth.vcs.stability_score}%`}
                        icon={<HardDrive className="w-3 h-3 text-emerald-500" />}
                    />
                    <HealthTile
                        label="Rollback Frequency"
                        value={vcsHealth.vcs.rollback_freq}
                        warning={parseFloat(vcsHealth.vcs.rollback_freq) > 0.1}
                    />
                    <HealthTile
                        label="AI/Human Conflict Rate"
                        value={vcsHealth.vcs.conflict_rate}
                    />
                </div>
            </div>

            {/* GitHub API Health */}
            <div className="col-span-12 lg:col-span-5 space-y-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                    <Github className="w-3 h-3" /> GitHub App Health
                </div>
                <div className="border border-black bg-white p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-tight">API Rate Limits</div>
                        <div className={clsx(
                            "px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter",
                            vcsHealth.github.status === 'stable' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                        )}>
                            {vcsHealth.github.status}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-[11px] font-bold text-black uppercase">
                            <span>{vcsHealth.github.remaining} / {vcsHealth.github.limit}</span>
                            <span className="text-gray-400">Next Reset: {vcsHealth.github.reset}</span>
                        </div>
                        <div className="h-1 bg-gray-100 overflow-hidden">
                            <div
                                className="h-full bg-black"
                                style={{ width: `${(vcsHealth.github.remaining / vcsHealth.github.limit) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-gray-400">
                            <ShieldExclamation className="w-3 h-3" />
                            <span className="text-[9px] font-bold uppercase tracking-widest">
                                AI WRITE CHANNEL: {vcsHealth.lock_status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function HealthTile({ label, value, icon, warning = false }: { label: string, value: any, icon?: React.ReactNode, warning?: boolean }) {
    return (
        <div className={clsx(
            "p-5 border bg-white group hover:border-black transition-colors",
            warning ? "border-red-200" : "border-gray-200"
        )}>
            <div className="flex items-center gap-2 mb-3">
                {icon}
                <div className="text-[9px] font-bold uppercase text-gray-400 tracking-widest">{label}</div>
            </div>
            <div className={clsx(
                "text-2xl font-black tracking-tighter",
                warning ? "text-red-600" : "text-black"
            )}>{value}</div>
        </div>
    );
}
