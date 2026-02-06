import React from 'react';
import { MessageSquare, Flame, TrendingUp, AlertCircle } from 'lucide-react';
import { DemandAnalysis as DemandAnalysisType } from '@/types/research';

interface DemandAnalysisProps {
    analysis: DemandAnalysisType;
}

export default function DemandAnalysis({ analysis }: DemandAnalysisProps) {
    const { demand_sources, pain_intensity_index, key_insights } = analysis;

    return (
        <section className="space-y-8">
            <div className="flex items-center space-x-3">
                <Flame size={20} className="text-orange-500" />
                <h2 className="text-2xl font-bold text-white tracking-tight">Demand & Customer Pain Analysis</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            <div className="glass-card p-10 rounded-3xl space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Pain Intensity Index */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Pain Intensity Index</h3>
                        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 relative overflow-hidden">
                            {/* Large score in background */}
                            <div className="absolute -right-4 -bottom-8 text-[120px] font-black text-white/5 select-none font-mono">
                                {pain_intensity_index.overall_score}
                            </div>

                            <div className="relative z-10 flex items-center justify-between mb-8">
                                <div>
                                    <div className="text-4xl font-black text-white font-mono">{pain_intensity_index.overall_score}</div>
                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Composite Pain Score</div>
                                </div>
                                <div className="h-12 w-px bg-white/10" />
                                <div className="text-right">
                                    <div className={`text-sm font-bold ${pain_intensity_index.overall_score > 70 ? 'text-orange-400' : 'text-zinc-400'}`}>
                                        {pain_intensity_index.overall_score > 70 ? 'CRITICAL INTENSITY' : 'MODERATE INTENSITY'}
                                    </div>
                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Severity Classification</div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <PainMetric label="Frequency" value={pain_intensity_index.frequency} color="bg-orange-500" />
                                <PainMetric label="Urgency" value={pain_intensity_index.urgency} color="bg-red-500" />
                                <PainMetric label="Emotional Language" value={pain_intensity_index.emotional_intensity} color="bg-purple-500" />
                                <PainMetric label="Repeat Complaints" value={pain_intensity_index.repeat_complaints} color="bg-indigo-500" />
                            </div>
                        </div>
                    </div>

                    {/* Demand Sources */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Validated Demand Sources</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {demand_sources.map((source, index) => (
                                <div key={index} className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/[0.03] transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                                            <MessageSquare size={18} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-white">{source.source}</div>
                                            <div className="text-[9px] text-zinc-500 font-medium uppercase tracking-widest">{source.discussion_count} Signals Detected</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-white font-mono">{source.pain_frequency}/10</div>
                                            <div className="text-[8px] text-zinc-600 uppercase tracking-tighter">Intensity</div>
                                        </div>
                                        <div className="h-6 w-px bg-white/5" />
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-indigo-400 font-mono">{source.urgency_score}/10</div>
                                            <div className="text-[8px] text-zinc-600 uppercase tracking-tighter">Urgency</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 bg-orange-500/5 border border-orange-500/10 rounded-2xl">
                            <div className="flex items-start space-x-3">
                                <AlertCircle size={16} className="text-orange-400 mt-0.5" />
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-orange-400 uppercase tracking-[0.2em]">Pain Analysis Sentiment</h4>
                                    <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                                        Signals from Hacker News and Reddit indicate high technical debt pain points. Customers are actively seeking alternatives to manual workarounds.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Key Insights */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Synthesis of Pain Points</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {key_insights.map((insight, index) => (
                            <div key={index} className="flex items-start space-x-3 p-4 bg-white/[0.01] rounded-xl border border-white/5">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                                <p className="text-xs text-zinc-400 leading-relaxed font-medium">{insight}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function PainMetric({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                <span>{label}</span>
                <span className="text-zinc-400">{value}/10</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} rounded-full transition-all duration-1000`}
                    style={{ width: `${value * 10}%` }}
                />
            </div>
        </div>
    );
}
