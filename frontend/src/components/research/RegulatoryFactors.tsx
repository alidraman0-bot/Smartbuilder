import React from 'react';
import { Gavel, ShieldCheck, Globe, Info } from 'lucide-react';
import { RegulatoryFactors as RegulatoryFactorsType } from '@/types/research';

interface RegulatoryFactorsProps {
    factors: RegulatoryFactorsType;
}

export default function RegulatoryFactors({ factors }: RegulatoryFactorsProps) {
    const { compliance_requirements, regional_regulations, industry_standards, policy_environment, policy_details } = factors;

    return (
        <section className="space-y-8">
            <div className="flex items-center space-x-3">
                <Gavel size={20} className="text-indigo-500" />
                <h2 className="text-2xl font-bold text-white tracking-tight">Regulatory & Macro Factors</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            <div className="glass-card p-10 rounded-3xl space-y-12">
                {/* Macro Context & Policy */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-4 space-y-6">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Policy environment</h3>
                        <div className={`p-8 rounded-3xl border ${policy_environment === 'Tailwind' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                policy_environment === 'Headwind' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                    'bg-white/5 border-white/10 text-white'
                            } flex flex-col items-center justify-center text-center space-y-4`}>
                            {policy_environment === 'Tailwind' ? <TrendingUp size={32} /> :
                                policy_environment === 'Headwind' ? <ShieldCheck size={32} /> : <Info size={32} />}
                            <div>
                                <div className="text-2xl font-black uppercase tracking-tight">{policy_environment}</div>
                                <div className="text-[9px] font-bold opacity-60 uppercase tracking-widest mt-1">Regulatory Momentum</div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8 space-y-6">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Macro Analysis & Drivers</h3>
                        <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl h-full">
                            <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                                {policy_details}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Compliance Requirements */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center">
                            <ShieldCheck size={14} className="mr-2 text-indigo-400" />
                            Compliance Baseline
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {compliance_requirements.map((req, i) => (
                                <span key={i} className="text-[10px] font-bold px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-zinc-300 uppercase tracking-wider">
                                    {req}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Industry Standards */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center">
                            <Globe size={14} className="mr-2 text-indigo-400" />
                            Industry Standards
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {industry_standards.map((std, i) => (
                                <span key={i} className="text-[10px] font-bold px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 uppercase tracking-wider">
                                    {std}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Regional Impacts */}
                    <div className="space-y-4 lg:col-span-1 md:col-span-2">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Regional Nuances</h3>
                        <div className="space-y-3">
                            {regional_regulations.map((reg, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        <span className="text-xs font-bold text-white tracking-tight">{reg.region}</span>
                                    </div>
                                    <span className={`text-[8px] font-bold uppercase py-0.5 px-2 rounded-md ${reg.impact === 'High' ? 'bg-red-500/10 text-red-500' :
                                            reg.impact === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'
                                        }`}>
                                        {reg.impact} IMPACT
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function TrendingUp(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
    );
}
