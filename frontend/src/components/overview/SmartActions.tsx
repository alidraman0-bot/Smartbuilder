'use client';

import React from 'react';
import { Zap, ChevronRight, AlertTriangle, Lightbulb, Activity } from 'lucide-react';
import { useDashboardStore } from '@/store/useDashboardStore';
import Link from 'next/link';

export default function SmartActions() {
    const { smart_actions, isLoading } = useDashboardStore();
    const recommendations = smart_actions || [];

    return (
        <div className="h-full border border-white/10 bg-[#0c0c0e] rounded-3xl p-6 flex flex-col relative overflow-hidden group">
            {/* Ambient Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/5 blur-[100px] pointer-events-none" />

            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
                    <Zap className="w-4 h-4" />
                </div>
                <div>
                    <h3 className="font-bold text-white text-sm tracking-tight uppercase">Smart Actions</h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">AI-Driven Optimization</p>
                </div>
            </div>

            <div className={`flex-1 space-y-3 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                {recommendations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-xs italic py-10">
                        {isLoading ? (
                            <div className="flex flex-col items-center gap-2">
                                <Activity className="w-5 h-5 animate-spin text-indigo-500/50" />
                                <span>Scanning portfolio...</span>
                            </div>
                        ) : 'All systems optimized.'}
                    </div>
                ) : (
                    recommendations.map((rec: any, i: number) => (
                        <Link
                            key={rec.id || i}
                            href={rec.link || '#'}
                            className="block group/item p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 transition-all hover:bg-white/[0.05]"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h4 className="text-[13px] font-bold text-zinc-200 group-hover/item:text-indigo-400 transition-colors uppercase tracking-tight">
                                    {rec.title}
                                </h4>
                                {rec.impact === 'high' && <AlertTriangle className="w-3 h-3 text-amber-500 animate-pulse" />}
                            </div>
                            <p className="text-[11px] text-zinc-400 mb-4 leading-relaxed font-medium">
                                {rec.description}
                            </p>
                            <div className="flex items-center justify-between">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-tighter ${rec.impact === 'high'
                                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                        : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                    }`}>
                                    {rec.impact} Impact
                                </span>
                                <div className="text-[10px] font-bold text-indigo-400 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center gap-1">
                                    {rec.cta || 'DETAILS'} <ChevronRight className="w-3 h-3" />
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            <Link href="/monitor" className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-500 hover:text-white transition-colors py-3 border-t border-white/5 uppercase tracking-widest group/btn">
                <Lightbulb className="w-3 h-3 group-hover/btn:text-amber-400 transition-colors" />
                View all monitoring insights
            </Link>
        </div>
    );
}
