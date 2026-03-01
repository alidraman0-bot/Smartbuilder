import React from 'react';
import { ShieldAlert, TrendingUp, AlertTriangle, CheckCircle, BarChart3, Target } from 'lucide-react';

interface VerdictData {
    verdict: string;
    success_probability: string;
    confidence_score: number;
    reasons: string[];
}

interface StartupVerdictProps {
    data: VerdictData | null;
    isLoading: boolean;
}

export default function StartupVerdict({ data, isLoading }: StartupVerdictProps) {
    if (isLoading) {
        return (
            <section className="space-y-6 animate-pulse">
                <h2 className="text-xl font-bold text-white tracking-tight">AI Verdict Engine</h2>
                <div className="glass-card p-8 rounded-3xl bg-[#0D0D0F]/80 border border-indigo-500/20">
                    <div className="h-6 bg-white/10 rounded w-1/4 mb-4"></div>
                    <div className="h-10 bg-white/10 rounded w-1/2 mb-8"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-white/10 rounded w-full"></div>
                        <div className="h-4 bg-white/10 rounded w-5/6"></div>
                        <div className="h-4 bg-white/10 rounded w-4/6"></div>
                    </div>
                </div>
            </section>
        );
    }

    if (!data) return null;

    // Determine colors based on probability roughly
    const probValue = parseInt(data.success_probability.replace('%', '')) || 0;

    let colorClass = "text-indigo-400";
    let bgClass = "bg-indigo-500/10";
    let borderClass = "border-indigo-500/20";
    let Icon = BarChart3;

    if (probValue >= 70) {
        colorClass = "text-emerald-400";
        bgClass = "bg-emerald-500/10";
        borderClass = "border-emerald-500/20";
        Icon = CheckCircle;
    } else if (probValue <= 40) {
        colorClass = "text-red-400";
        bgClass = "bg-red-500/10";
        borderClass = "border-red-500/20";
        Icon = AlertTriangle;
    } else {
        colorClass = "text-amber-400";
        bgClass = "bg-amber-500/10";
        borderClass = "border-amber-500/20";
        Icon = TrendingUp;
    }

    return (
        <section className="space-y-6">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Target className="text-indigo-400" size={20} />
                Startup Verdict Engine
            </h2>

            <div className={`glass-card p-8 rounded-3xl border ${borderClass} bg-gradient-to-br from-white/[0.02] to-transparent relative overflow-hidden`}>

                {/* Background decorative element */}
                <div className={`absolute -right-20 -top-20 w-64 h-64 ${bgClass} rounded-full blur-[80px]`}></div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Col: Verdict & Main score */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Final Verdict</p>
                            <h3 className={`text-2xl font-bold ${colorClass} leading-tight`}>
                                {data.verdict}
                            </h3>
                        </div>

                        <div className="flex items-end gap-3 pt-2">
                            <div>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Success Probability</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white tracking-tighter">{data.success_probability}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-zinc-400 font-medium">AI Confidence Score</span>
                                <span className="text-xs font-mono text-zinc-300">{(data.confidence_score * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
                                <div
                                    className={`h-full ${bgClass.replace('/10', '')} rounded-full`}
                                    style={{ width: `${data.confidence_score * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Reasons */}
                    <div className="md:col-span-2 space-y-4 md:border-l border-white/5 md:pl-8">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Key Drivers</p>
                        <div className="space-y-3">
                            {data.reasons.map((reason, idx) => (
                                <div key={idx} className="flex items-start gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                                    <div className={`mt-0.5 p-1 rounded-md ${bgClass}`}>
                                        <Icon size={14} className={colorClass} />
                                    </div>
                                    <p className="text-sm text-zinc-300 leading-relaxed">
                                        {reason}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {data.reasons.length === 0 && (
                            <p className="text-sm text-zinc-500 italic">No specific drivers provided by the engine.</p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
