"use client";

import React from 'react';
import { ArrowUpRight, TrendingUp, AlertCircle, Wallet } from 'lucide-react';
import { useRunStore } from '@/store/useRunStore';
import { useDashboardStore } from '@/store/useDashboardStore';

export function HealthCard() {
    const { confidence, health } = useRunStore();
    const isHealthy = health === 'NOMINAL';

    return (
        <div className="glass-card rounded-2xl p-6 h-full relative group overflow-hidden">
            {/* Gradient Accent */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${isHealthy ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-red-500 to-orange-500'} opacity-50`} />

            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-3">
                    <div className={`relative p-2.5 rounded-xl border scale-90 group-hover:scale-100 transition-transform duration-300 ${isHealthy
                        ? 'bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-500/20'
                        : 'bg-red-500/10 border-red-500/30 shadow-lg shadow-red-500/20'
                        }`}>
                        <TrendingUp size={20} className={isHealthy ? 'text-emerald-400' : 'text-red-400'} strokeWidth={2.5} />
                    </div>
                    <h3 className="font-bold text-zinc-300 text-xs uppercase tracking-widest">Portfolio Health</h3>
                </div>
                <span className="text-[10px] font-mono-data bg-white/5 px-2.5 py-1 rounded-full text-zinc-400 border border-white/10 backdrop-blur-sm">Q1 2026</span>
            </div>

            <div className="flex items-baseline space-x-2 mt-2 mb-4">
                <span className={`text-5xl font-bold tracking-tighter ${isHealthy ? 'text-emerald-400 glow-success' : 'text-red-400'} group-hover:scale-105 transition-transform duration-300`}>
                    {Math.round(confidence)}
                </span>
                <span className={`text-xl font-bold opacity-50 ${isHealthy ? 'text-emerald-400' : 'text-red-400'}`}>%</span>
            </div>

            <p className="text-[11px] text-zinc-400 mt-4 leading-relaxed max-w-[200px]">
                {isHealthy ? 'System performing within nominal parameters.' : 'Degraded performance detected in active node.'}
            </p>

            <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-[10px] font-bold text-indigo-400 cursor-pointer hover:text-indigo-300 transition-all group/btn px-2 py-1 rounded-lg hover:bg-indigo-500/10">
                    <span>ANALYZE METRICS</span>
                    <ArrowUpRight size={12} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-300" />
                </div>
                <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`w-6 h-6 rounded-full border-2 border-black shadow-lg ${isHealthy ? 'bg-emerald-500/30' : 'bg-red-500/30'}`} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export function RisksCard() {
    const { state } = useRunStore();
    const isCritical = state === 'FAILED';

    return (
        <div className="glass-card rounded-2xl p-6 h-full relative overflow-hidden group">
            {/* Gradient Accent */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${isCritical ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-amber-500 to-yellow-500'} opacity-50`} />

            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-3">
                    <div className={`relative p-2.5 rounded-xl border scale-90 group-hover:scale-100 transition-transform duration-300 ${isCritical
                        ? 'bg-red-500/10 border-red-500/30 shadow-lg shadow-red-500/20'
                        : 'bg-amber-500/10 border-amber-500/30 shadow-lg shadow-amber-500/20'
                        }`}>
                        <AlertCircle size={20} className={isCritical ? 'text-red-400' : 'text-amber-400'} strokeWidth={2.5} />
                    </div>
                    <h3 className="font-bold text-zinc-300 text-xs uppercase tracking-widest">Risk Vectors</h3>
                </div>
                <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold border backdrop-blur-sm ${isCritical
                    ? 'bg-red-500/10 text-red-400 border-red-500/30 shadow-lg shadow-red-500/20'
                    : 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20'
                    }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-red-400 animate-pulse shadow-lg shadow-red-400/50' : 'bg-emerald-400'}`} />
                    <span>{isCritical ? 'CRITICAL' : 'SCANNING'}</span>
                </div>
            </div>

            <div className="space-y-4">
                <RiskItem label="Project Phoenix" subLabel={state} isCritical={state === 'FAILED'} />
                <RiskItem label="Market Saturation" subLabel="Competitive crowding noted" isCritical={true} />
            </div>
        </div>
    );
}

function RiskItem({ label, subLabel, isCritical }: { label: string, subLabel: string, isCritical?: boolean }) {
    return (
        <div className="flex justify-between items-center py-3 border-t border-white/5 transition-all duration-300 hover:bg-white/5 p-2 rounded-lg -mx-2 group cursor-pointer">
            <div>
                <h4 className="text-xs font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-red-400 group-hover:to-orange-400 transition-all duration-300">
                    {label}
                </h4>
                <p className="text-[10px] text-zinc-400 font-mono-data mt-1">{subLabel}</p>
            </div>
            <div className={`w-2 h-2 rounded-full shadow-lg transition-all duration-300 group-hover:scale-125 ${isCritical
                ? 'bg-red-400 animate-pulse shadow-red-400/50'
                : 'bg-emerald-400 shadow-emerald-400/30'
                }`} />
        </div>
    );
}

export function BudgetCard() {
    const { stats, isLoading } = useDashboardStore();

    // Mocking a budget calculation based on active projects if no real budget data
    const budgetCap = 2500000;
    const projectCost = (stats?.active_projects || 0) * 125000;
    const spent = 1200000 + projectCost;
    const percentage = Math.min((spent / budgetCap) * 100, 100);
    const formattedSpent = (spent / 1000000).toFixed(1) + 'M';
    const remaining = 100 - percentage;

    return (
        <div className="glass-card rounded-2xl p-6 h-full flex flex-col group overflow-hidden relative border border-white/5">
            {/* Gradient Accent */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50" />

            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-3">
                    <div className="relative p-2.5 rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 scale-90 group-hover:scale-100 transition-transform duration-300 shadow-lg shadow-indigo-500/20">
                        <Wallet size={20} className="text-indigo-400" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-300 text-xs uppercase tracking-widest">Capital Efficiency</h3>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Cloud vs Build</p>
                    </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-white/5 px-2.5 py-1 rounded-full text-zinc-400 border border-white/10 backdrop-blur-sm">Q1 2026</span>
            </div>

            <div className={`mt-auto transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                <div className="flex items-baseline space-x-2 mb-4">
                    <span className="text-4xl font-bold text-white tracking-tighter group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 transition-all duration-300">
                        ${formattedSpent}
                    </span>
                    <span className="text-sm font-bold text-zinc-500">/ $2.5M</span>
                </div>

                <div className="relative h-2 w-full bg-white/5 rounded-full mt-4 overflow-hidden backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full" />
                    <div
                        className="absolute h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full glow-primary-strong transition-all duration-1000 group-hover:brightness-125 relative overflow-hidden"
                        style={{ width: `${percentage}%` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                    </div>
                </div>

                <div className="flex justify-between items-center mt-5">
                    <p className="text-[10px] text-zinc-400 font-bold italic uppercase tracking-wider">~{remaining.toFixed(0)}% runway remaining</p>
                    <div className="flex items-center space-x-1.5 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer group/btn px-2 py-1.5 rounded-lg hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20">
                        <span>OPTIMIZE</span>
                        <ArrowUpRight size={10} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-300" />
                    </div>
                </div>
            </div>
        </div>
    );
}
