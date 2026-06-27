"use client";

import React from 'react';
import { PieChart } from 'lucide-react';

interface PlanDistributionProps {
    revenue: any;
}

const PLAN_COLORS: Record<string, { bar: string; text: string; bg: string }> = {
    Free: { bar: 'rgba(99,102,241,0.4)', text: '#818cf8', bg: 'rgba(99,102,241,0.08)' },
    Pro: { bar: 'rgba(139,92,246,0.8)', text: '#a78bfa', bg: 'rgba(139,92,246,0.1)' },
    Enterprise: { bar: 'rgba(16,185,129,0.9)', text: '#34d399', bg: 'rgba(16,185,129,0.08)' },
};

export default function PlanDistribution({ revenue }: PlanDistributionProps) {
    if (!revenue) return (
        <div className="rounded-2xl h-48 animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
    );

    const breakdown = revenue.plan_breakdown ?? [];
    const totalUsers = breakdown.reduce((sum: number, p: any) => sum + p.users, 0);

    return (
        <div className="rounded-2xl p-5 space-y-4"
            style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                border: '1px solid rgba(139,92,246,0.15)',
            }}>
            <div className="flex items-center space-x-2">
                <PieChart size={15} className="text-purple-400" />
                <span className="text-sm font-bold text-white">Plan Distribution</span>
            </div>

            <div className="space-y-3">
                {breakdown.map((p: any) => {
                    const pct = ((p.users / totalUsers) * 100).toFixed(1);
                    const c = PLAN_COLORS[p.plan] ?? PLAN_COLORS.Free;
                    return (
                        <div key={p.plan} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 rounded-full" style={{ background: c.text }} />
                                    <span className="text-xs font-semibold" style={{ color: c.text }}>{p.plan}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-[10px] text-zinc-600">{p.users.toLocaleString()} users</span>
                                    <span className="text-[10px] font-bold" style={{ color: c.text }}>{pct}%</span>
                                </div>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <div
                                    className="h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${pct}%`, background: c.bar }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="pt-2 border-t border-white/5 text-[10px] text-zinc-600 font-mono">
                Total: {totalUsers.toLocaleString()} users
            </div>
        </div>
    );
}
