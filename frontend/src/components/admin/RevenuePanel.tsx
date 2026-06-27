"use client";

import React, { useState } from 'react';
import { TrendingUp, DollarSign, ArrowUpRight } from 'lucide-react';

interface RevenuePanelProps {
    revenue: any;
    investorMode: boolean;
}

export default function RevenuePanel({ revenue, investorMode }: RevenuePanelProps) {
    const [hovered, setHovered] = useState<number | null>(null);

    if (!revenue) return (
        <div className="rounded-2xl h-80 animate-pulse" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }} />
    );

    const trend = revenue.monthly_trend ?? [];
    const maxMrr = Math.max(...trend.map((d: any) => d.mrr));
    const mask = (v: any) => investorMode ? '••••' : v;

    return (
        <div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                border: '1px solid rgba(99,102,241,0.15)',
                boxShadow: '0 8px 32px -8px rgba(99,102,241,0.12)',
            }}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <div className="flex items-center space-x-2 mb-1">
                        <TrendingUp size={16} className="text-indigo-400" />
                        <span className="text-sm font-bold text-white">Revenue Growth</span>
                    </div>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Monthly Recurring Revenue — 6 months</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-white font-mono">${mask(revenue.current_mrr?.toLocaleString())}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Current MRR</p>
                </div>
            </div>

            {/* Metric pills */}
            <div className="flex flex-wrap gap-3 mb-6">
                {[
                    { label: 'ARR', value: `$${mask(revenue.current_arr?.toLocaleString())}`, color: '#818cf8' },
                    { label: 'LTV', value: `$${mask(revenue.ltv?.toLocaleString())}`, color: '#34d399' },
                    { label: 'CAC', value: `$${mask(revenue.cac?.toLocaleString())}`, color: '#fbbf24' },
                    { label: 'LTV:CAC', value: `${revenue.ltv_cac_ratio}x`, color: '#a78bfa' },
                    { label: 'Churn', value: `${revenue.churn_rate}%`, color: '#fb7185' },
                ].map(m => (
                    <div key={m.label} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'rgba(140,140,160,0.6)' }}>{m.label}</span>
                        <span className="text-xs font-bold" style={{ color: m.color }}>{m.value}</span>
                    </div>
                ))}
            </div>

            {/* Bar chart */}
            <div className="space-y-2">
                <div className="flex items-end space-x-2 h-32">
                    {trend.map((d: any, i: number) => {
                        const heightPct = (d.mrr / maxMrr) * 100;
                        const isHov = hovered === i;
                        return (
                            <div
                                key={i}
                                className="flex-1 flex flex-col items-center justify-end group cursor-pointer"
                                onMouseEnter={() => setHovered(i)}
                                onMouseLeave={() => setHovered(null)}
                            >
                                {isHov && (
                                    <div className="mb-1 px-2 py-1 rounded-lg text-[10px] font-mono text-white whitespace-nowrap z-10"
                                        style={{ background: 'rgba(20,20,30,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        ${d.mrr.toLocaleString()}
                                    </div>
                                )}
                                <div
                                    className="w-full rounded-t-lg transition-all duration-500 relative overflow-hidden"
                                    style={{
                                        height: `${heightPct}%`,
                                        minHeight: 8,
                                        background: isHov
                                            ? 'linear-gradient(180deg, #818cf8 0%, #6366f1 100%)'
                                            : 'linear-gradient(180deg, rgba(99,102,241,0.6) 0%, rgba(99,102,241,0.25) 100%)',
                                        transition: 'height 0.8s cubic-bezier(0.16,1,0.3,1)',
                                    }}
                                >
                                    {isHov && <div className="absolute inset-0 bg-white/10" />}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex space-x-2">
                    {trend.map((d: any, i: number) => (
                        <div key={i} className="flex-1 text-center text-[9px] font-mono text-zinc-600 truncate">
                            {d.month.split(' ')[0]}
                        </div>
                    ))}
                </div>
            </div>

            {/* New vs Churn breakdown */}
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-[10px] text-zinc-500">New MRR</span>
                        <span className="text-[10px] font-bold text-emerald-400">+${mask(trend[trend.length - 1]?.new?.toLocaleString())}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                        <div className="w-2 h-2 rounded-full bg-rose-400" />
                        <span className="text-[10px] text-zinc-500">Churn</span>
                        <span className="text-[10px] font-bold text-rose-400">-${mask(trend[trend.length - 1]?.churn?.toLocaleString())}</span>
                    </div>
                </div>
                <div className="flex items-center space-x-1 text-[10px] text-emerald-400 font-bold">
                    <ArrowUpRight size={12} />
                    <span>Net +${mask(((trend[trend.length - 1]?.new ?? 0) - (trend[trend.length - 1]?.churn ?? 0)).toLocaleString())} this month</span>
                </div>
            </div>
        </div>
    );
}
