"use client";

import React from 'react';
import { useFounderStore } from '@/store/useFounderStore';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import clsx from 'clsx';

export default function ExecutiveSnapshot() {
    const { snapshot, investorMode } = useFounderStore();

    if (!snapshot) return (
        <div className="grid grid-cols-6 gap-0 border border-gray-100 bg-gray-50/50">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 border-r border-gray-100 last:border-0 animate-pulse bg-gray-100/50" />
            ))}
        </div>
    );

    const mask = (val: any) => investorMode ? '••••' : val;

    return (
        <div className="grid grid-cols-6 gap-0 border border-black overflow-hidden bg-white">
            <KpiTile
                label="Active Users (24h)"
                value={snapshot.active_users['24h']}
                trend={snapshot.trends.users}
            />
            <KpiTile
                label="Active MVPs"
                value={snapshot.active_mvps}
            />
            <KpiTile
                label="Success Rate"
                value={`${snapshot.success_rate}%`}
                trend={snapshot.trends.success}
            />
            <KpiTile
                label="Auto-Fix Success"
                value={`${snapshot.auto_fix_rate}%`}
            />
            <KpiTile
                label="MRR"
                value={`$${mask(snapshot.mrr.toLocaleString())}`}
                trend={snapshot.trends.revenue}
            />
            <KpiTile
                label="Daily AI Cost"
                value={`$${mask(snapshot.daily_ai_cost)}`}
                trend={snapshot.trends.costs}
                reverseColors
            />
        </div>
    );
}

function KpiTile({ label, value, trend, reverseColors = false }: { label: string, value: any, trend?: string, reverseColors?: boolean }) {
    return (
        <div className="p-6 border-r border-gray-200 last:border-0 flex flex-col justify-between group hover:bg-gray-50 transition-colors">
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{label}</div>
            <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold tracking-tighter text-black leading-none">{value}</div>
                {trend && (
                    <div className={clsx(
                        "text-[10px] font-bold flex items-center",
                        trend === 'up'
                            ? (reverseColors ? 'text-red-500' : 'text-emerald-500')
                            : trend === 'down'
                                ? (reverseColors ? 'text-emerald-500' : 'text-red-500')
                                : 'text-gray-400'
                    )}>
                        {trend === 'up' ? <ArrowUp className="w-3 h-3" /> : trend === 'down' ? <ArrowDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                    </div>
                )}
            </div>
        </div>
    );
}
