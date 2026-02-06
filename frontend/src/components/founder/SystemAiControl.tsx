"use client";

import React from 'react';
import { useFounderStore } from '@/store/useFounderStore';
import { Cpu, Activity, Zap, HardDrive, Layout, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';

export default function SystemAiControl() {
    const { infra, aiEngine, featureFlags, updateFeatureFlag } = useFounderStore();

    return (
        <div className="grid grid-cols-2 gap-8">
            {/* Infrastructure Health */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                    <HardDrive className="w-3 h-3" /> Infrastructure Health
                </div>
                <div className="border border-gray-200 divide-y divide-gray-100 bg-white">
                    {infra.map((item, i) => (
                        <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className={clsx(
                                    "w-1.5 h-1.5",
                                    item.status === 'healthy' ? "bg-emerald-500" : "bg-amber-500"
                                )} />
                                <span className="text-[11px] font-bold text-black uppercase tracking-tight">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-[10px] text-gray-400 uppercase font-bold">Latency</div>
                                    <div className="text-[11px] font-mono font-bold text-gray-900">{item.latency}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-gray-400 uppercase font-bold">Errors</div>
                                    <div className="text-[11px] font-mono font-bold text-gray-900">{item.error_rate}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Execution Engine */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                    <Cpu className="w-3 h-3" /> AI Execution Engine (Base44)
                </div>
                <div className="border border-black p-6 bg-white space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Active Engine</div>
                            <div className="text-lg font-bold text-black uppercase">{aiEngine?.engine}</div>
                        </div>
                        <div className="bg-emerald-50 px-2 py-1 flex items-center gap-1.5">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Strict Mode Active</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <EngineMetric label="Req/Min" value={aiEngine?.requests_per_min} />
                        <EngineMetric label="Avg Exec" value={aiEngine?.avg_execution} />
                        <EngineMetric label="Error Rate" value={aiEngine?.error_rate} />
                        <EngineMetric label="Monthly Cost" value={aiEngine?.monthly_cost} />
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                        <FlagToggle label="Auto-Fix" flag="auto_fix" active={featureFlags.auto_fix} onToggle={updateFeatureFlag} />
                        <FlagToggle label="Freeze Build" flag="freeze_build" active={featureFlags.freeze_build} onToggle={updateFeatureFlag} />
                        <FlagToggle label="Strict Valid" flag="strict_deployment" active={featureFlags.strict_deployment} onToggle={updateFeatureFlag} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function EngineMetric({ label, value }: { label: string, value: any }) {
    return (
        <div className="p-3 bg-gray-50 border border-gray-100">
            <div className="text-[9px] font-bold uppercase text-gray-400 tracking-widest mb-1">{label}</div>
            <div className="text-sm font-bold text-black font-mono">{value}</div>
        </div>
    );
}

function FlagToggle({ label, flag, active, onToggle }: { label: string, flag: string, active: boolean, onToggle: any }) {
    return (
        <button
            onClick={() => onToggle(flag, !active)}
            className={clsx(
                "px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border transition-all",
                active
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-400 border-gray-200 hover:border-black hover:text-black"
            )}
        >
            {label}: {active ? "ON" : "OFF"}
        </button>
    );
}
