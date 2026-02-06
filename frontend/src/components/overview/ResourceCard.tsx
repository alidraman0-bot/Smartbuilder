"use client";

import React from 'react';
import { Cpu, Zap, Activity, StopCircle, Share2 } from 'lucide-react';
import { useRunStore } from '@/store/useRunStore';

export default function ResourceCard() {
    const { system_metrics, health } = useRunStore();

    return (
        <div className="glass-card rounded-2xl p-6 flex flex-col h-full relative group">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-3">
                    <div className="bg-white/5 p-2 rounded-xl group-hover:bg-primary/10 transition-colors">
                        <Activity size={20} className="text-muted group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm tracking-tight">System Node</h3>
                        <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Performance</p>
                    </div>
                </div>
                <div className={`flex items-center space-x-2 px-2.5 py-1 rounded-full text-[9px] font-bold border transition-all ${health === 'NOMINAL' ? 'bg-success/10 border-success/20 text-success glow-success' : 'bg-danger/10 border-danger/20 text-danger glow-danger'}`}>
                    <div className={`w-1 h-1 rounded-full ${health === 'NOMINAL' ? 'bg-success' : 'bg-danger animate-ping'}`} />
                    <span>{health === 'NOMINAL' ? 'NOMINAL' : 'THROTTLED'}</span>
                </div>
            </div>

            <div className="space-y-7 flex-1">
                <MetricItem
                    icon={<Cpu size={14} />}
                    label="Neural Compute"
                    value={`${system_metrics.gpu}%`}
                    percent={system_metrics.gpu}
                    color="bg-primary"
                />

                <MetricItem
                    icon={<Zap size={14} />}
                    label="Cognitive Load"
                    value={`${system_metrics.memory}%`}
                    percent={system_metrics.memory}
                    color="bg-indigo-500"
                />

                <MetricItem
                    icon={<Share2 size={14} />}
                    label="Active Threads"
                    value={system_metrics.threads}
                    percent={(parseInt(system_metrics.threads.split('/')[0]) / parseInt(system_metrics.threads.split('/')[1])) * 100}
                    color="bg-primary"
                />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
                <button className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-danger/5 border border-danger/10 text-danger hover:bg-danger/10 transition-all text-[11px] font-bold uppercase tracking-wider">
                    <StopCircle size={14} />
                    <span>EMERGENCY STOP</span>
                </button>
                <button className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-primary hover:bg-white/10 transition-all text-[11px] font-bold uppercase tracking-wider">
                    <Zap size={14} />
                    <span>OPTIMIZE</span>
                </button>
            </div>
        </div>
    );
}

function MetricItem({ icon, label, value, percent, color }: { icon: React.ReactNode, label: string, value: string, percent: number, color: string }) {
    return (
        <div className="group/item">
            <div className="flex justify-between items-center mb-2.5">
                <div className="flex items-center space-x-2 text-muted group-hover/item:text-white transition-colors">
                    {icon}
                    <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
                </div>
                <span className="font-mono-data text-xs font-bold text-white glow-text">{value}</span>
            </div>
            <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                    className={`absolute h-full ${color} rounded-full transition-all duration-700 ease-out group-hover/item:brightness-125`}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}
