"use client";

import React from 'react';
import { Cpu, DollarSign } from 'lucide-react';

interface AiCostMeterProps {
    system: any;
    investorMode: boolean;
}

export default function AiCostMeter({ system, investorMode }: AiCostMeterProps) {
    if (!system) return (
        <div className="rounded-2xl h-40 animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
    );

    const mask = (v: any) => investorMode ? '••••' : v;
    const tokensPct = Math.min(100, (system.ai_tokens_today / 10_000_000) * 100);

    return (
        <div className="rounded-2xl p-5 space-y-4"
            style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                border: '1px solid rgba(245,158,11,0.15)',
            }}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Cpu size={15} className="text-amber-400" />
                    <span className="text-sm font-bold text-white">AI Cost Meter</span>
                </div>
                <div className="flex items-center space-x-1 text-amber-400">
                    <DollarSign size={12} />
                    <span className="text-sm font-bold font-mono">{mask(`${system.ai_cost_today_usd?.toFixed(2)}`)}</span>
                    <span className="text-[10px] text-zinc-600">today</span>
                </div>
            </div>

            {/* Token usage bar */}
            <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                    <span className="text-zinc-600">Tokens Used Today</span>
                    <span className="text-amber-400 font-mono font-bold">{(system.ai_tokens_today / 1_000_000).toFixed(2)}M</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div
                        className="h-full rounded-full"
                        style={{
                            width: `${tokensPct}%`,
                            background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                            transition: 'width 1s cubic-bezier(0.16,1,0.3,1)',
                        }}
                    />
                </div>
                <div className="flex justify-between text-[9px] text-zinc-700 font-mono">
                    <span>0</span><span>10M tokens/day</span>
                </div>
            </div>

            {/* MTD */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-[10px] text-zinc-600 uppercase tracking-wider">MTD AI Cost</span>
                <span className="text-sm font-bold text-white font-mono">{mask(`$${system.ai_cost_mtd_usd?.toFixed(2)}`)}</span>
            </div>
        </div>
    );
}
