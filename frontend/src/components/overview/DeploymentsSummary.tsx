'use client';

import React from 'react';
import { GitCommit, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Deployment } from '@/types/deploy';
import { useDashboardStore } from '@/store/useDashboardStore';
import Link from 'next/link';

export default function DeploymentsSummary() {
    const { latest_deployments, stats, isLoading } = useDashboardStore();
    const recent = latest_deployments.slice(0, 3);

    return (
        <div className="h-full border border-[#27272a] bg-[#0c0c0e] rounded-3xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Recent Deployments</h3>
                <Link href="/deploy" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    View All
                </Link>
            </div>

            <div className={`flex-1 space-y-3 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                {recent.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-xs italic">
                        {isLoading ? 'Crunching data...' : 'Waiting for first deployment...'}
                    </div>
                ) : (
                    recent.map((d) => (
                        <div key={d.deployment_id} className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all">
                            <div className="pt-0.5">
                                {d.status === 'success' || d.status === 'LIVE' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> :
                                    d.status === 'failed' ? <AlertCircle className="w-4 h-4 text-red-500" /> :
                                        <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-white truncate">{d.commit_message || `Deployment ${d.deployment_id.slice(0, 8)}`}</p>
                                <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-medium">
                                    <span className="flex items-center gap-1">
                                        <GitCommit className="w-3 h-3" />
                                        {d.version || 'v1.0.0'}
                                    </span>
                                    <span>•</span>
                                    <span>{new Date(d.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className={`
                                text-[9px] px-2 py-0.5 rounded-full font-bold tracking-wider
                                ${d.environment === 'Production'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}
                            `}>
                                {d.environment === 'Production' ? 'PROD' : 'PREV'}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                <div className="text-center group/stat">
                    <div className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">{stats?.success_rate || '100%'}</div>
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Success Rate</div>
                </div>
                <div className="text-center border-l border-white/5 group/stat">
                    <div className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">{stats?.avg_build_time || '2m'}</div>
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Avg Duration</div>
                </div>
            </div>
        </div>
    );
}
