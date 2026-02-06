import React from 'react';
import { DollarSign, Landmark, Wallet, Activity } from 'lucide-react';
import { MonetizationAnalysis as MonetizationAnalysisType } from '@/types/research';

interface MonetizationAnalysisProps {
    analysis: MonetizationAnalysisType;
}

export default function MonetizationAnalysis({ analysis }: MonetizationAnalysisProps) {
    const { revenue_models, pricing_benchmarks, unit_economics } = analysis;

    return (
        <section className="space-y-8">
            <div className="flex items-center space-x-3">
                <DollarSign size={20} className="text-green-500" />
                <h2 className="text-2xl font-bold text-white tracking-tight">Monetization & Unit Economics</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            <div className="glass-card p-10 rounded-3xl space-y-12">
                {/* Revenue Models */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Validated Revenue Models</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {revenue_models.map((model, index) => (
                            <div key={index} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4 hover:bg-white/[0.04] transition-colors flex flex-col h-full">
                                <div className="flex items-center justify-between">
                                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-md border ${model.type === 'Primary' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                                            'bg-white/5 border-white/10 text-zinc-500'
                                        } uppercase tracking-widest`}>
                                        {model.type}
                                    </span>
                                    <Wallet size={14} className="text-zinc-600" />
                                </div>
                                <h4 className="text-base font-bold text-white tracking-tight">{model.model}</h4>
                                <p className="text-xs text-zinc-400 leading-relaxed font-medium flex-grow">{model.description}</p>
                                <div className="pt-4 border-t border-white/5">
                                    <div className="text-[8px] text-zinc-600 uppercase tracking-widest mb-1">Potential</div>
                                    <div className="text-xs font-bold text-indigo-400 uppercase tracking-tighter">{model.revenue_potential} Yield</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Unit Economics */}
                    <div className="lg:col-span-7 space-y-6">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Estimated Unit Economics</h3>
                        <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl grid grid-cols-2 md:grid-cols-4 gap-8">
                            <EconomicMetric label="Avg. CAC" value={unit_economics.cac_estimate} />
                            <EconomicMetric label="LTV Target" value={unit_economics.ltv_estimate} />
                            <EconomicMetric label="Net Margin" value={unit_economics.margin_potential} />
                            <EconomicMetric label="Payback" value={unit_economics.payback_period} />
                        </div>
                        <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between">
                            <span className="text-[9px] text-zinc-500 tracking-widest font-bold uppercase">Data Reliability Score</span>
                            <div className="flex items-center space-x-2">
                                <div className="flex space-x-0.5">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className={`h-1 w-4 rounded-full ${i <= (unit_economics.confidence === 'High' ? 5 : unit_economics.confidence === 'Medium' ? 3 : 2) ? 'bg-indigo-500' : 'bg-white/10'}`} />
                                    ))}
                                </div>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{unit_economics.confidence}</span>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Benchmarks */}
                    <div className="lg:col-span-5 space-y-6">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Pricing Benchmarks</h3>
                        <div className="space-y-3">
                            {pricing_benchmarks.map((bench, i) => (
                                <div key={i} className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl group hover:bg-white/[0.03] transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-white">{bench.comparable_tool}</span>
                                        <span className="text-sm font-mono font-bold text-green-400">{bench.pricing}</span>
                                    </div>
                                    <div className="text-[10px] text-zinc-500 font-medium">
                                        <span className="text-indigo-400/80 mr-2 uppercase tracking-widest font-bold text-[8px]">Propensity:</span>
                                        {bench.willingness_to_pay_signal}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function EconomicMetric({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-2">
            <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{label}</div>
            <div className="text-lg font-black text-white font-mono tracking-tight">{value}</div>
        </div>
    );
}
