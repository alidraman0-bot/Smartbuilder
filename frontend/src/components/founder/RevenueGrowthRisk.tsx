"use client";

import React from 'react';
import { useFounderStore } from '@/store/useFounderStore';
import { TrendingUp, AlertTriangle, ShieldCheck, DollarSign } from 'lucide-react';
import clsx from 'clsx';

export default function RevenueGrowthRisk() {
    const { revenueRisk, investorMode } = useFounderStore();

    if (!revenueRisk) return <div className="h-64 animate-pulse bg-gray-50 border border-gray-100" />;

    const mask = (val: any) => investorMode ? '••••' : val;

    return (
        <div className="grid grid-cols-12 gap-8">
            {/* Revenue & Margin */}
            <div className="col-span-4 space-y-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                    <DollarSign className="w-3 h-3" /> Revenue & Margin Control
                </div>
                <div className="border border-black bg-white p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                        <div>
                            <div className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1">ARPU</div>
                            <div className="text-2xl font-bold text-black tracking-tighter">${mask(revenueRisk.revenue.arpu)}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1">Churn Rate</div>
                            <div className="text-2xl font-bold text-black tracking-tighter">{revenueRisk.revenue.churn}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1">Gross Margin</div>
                            <div className="text-2xl font-black text-emerald-600 tracking-tighter">{revenueRisk.costs.margin}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1">Cost/Build</div>
                            <div className="text-2xl font-bold text-black tracking-tighter">${mask(revenueRisk.costs.cost_per_build)}</div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between items-center">
                            <div className="text-[10px] font-black uppercase tracking-[0.1em] text-emerald-600 bg-emerald-50 px-2 py-0.5">Profitable</div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Audit: 2h ago</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Risk Register */}
            <div className="col-span-8 space-y-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                    <AlertTriangle className="w-3 h-3" /> Investor-Grade Risk Register
                </div>
                <div className="border border-gray-200 bg-white divide-y divide-gray-200">
                    {revenueRisk.risks.map((risk, i) => (
                        <div key={i} className="p-4 flex items-center justify-between hover:bg-red-50/10 group transition-colors">
                            <div className="flex items-center gap-6">
                                <div className={clsx(
                                    "px-2 py-0.5 text-[10px] font-black uppercase tracking-widest w-20 text-center",
                                    risk.severity === 'High' ? "bg-red-600 text-white" :
                                        risk.severity === 'Medium' ? "bg-black text-white" : "bg-gray-100 text-gray-500"
                                )}>
                                    {risk.severity}
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-black uppercase tracking-tight">{risk.title}</div>
                                    <div className="text-[10px] text-gray-400 font-medium">{risk.mitigation}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-[9px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" /> {risk.status}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
