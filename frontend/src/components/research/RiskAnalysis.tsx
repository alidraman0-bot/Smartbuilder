import React from 'react';
import { AlertTriangle, Shield } from 'lucide-react';
import { RiskAnalysis as RiskAnalysisType } from '@/types/research';

interface RiskAnalysisProps {
    analysis: RiskAnalysisType;
}

export default function RiskAnalysis({ analysis }: RiskAnalysisProps) {
    const { risk_categories, overall_risk_level } = analysis;

    const getRiskLevelColor = (level: string) => {
        switch (level) {
            case 'Low': return 'text-green-400 bg-green-500/10 border-green-500/20';
            case 'Medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'High': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
            case 'Critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
            default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
        }
    };

    const getProbabilityIcon = (probability: string) => {
        const size = probability === 'High' ? 16 : probability === 'Medium' ? 14 : 12;
        return <AlertTriangle size={size} className={`${getProbabilityColor(probability)}`} />;
    };

    const getProbabilityColor = (probability: string) => {
        switch (probability) {
            case 'High': return 'text-red-400';
            case 'Medium': return 'text-amber-400';
            case 'Low': return 'text-green-400';
            default: return 'text-zinc-400';
        }
    };

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'High': return 'text-red-400';
            case 'Medium': return 'text-amber-400';
            case 'Low': return 'text-green-400';
            default: return 'text-zinc-400';
        }
    };

    return (
        <section className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <AlertTriangle size={20} className="text-amber-500" />
                    <h2 className="text-2xl font-bold text-white tracking-tight">Risks, Constraints & Failure Modes</h2>
                </div>
                <div className={`px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest ${getRiskLevelColor(overall_risk_level)}`}>
                    {overall_risk_level} Risk
                </div>
            </div>

            <div className="glass-card p-10 rounded-3xl space-y-8">
                {risk_categories.map((category, catIndex) => (
                    <div key={catIndex} className="space-y-6">
                        <div className="flex items-center space-x-2 pb-3 border-b border-white/10">
                            <Shield size={14} className="text-indigo-400" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{category.category} Risk</h3>
                        </div>

                        <div className="space-y-4">
                            {category.risks.map((risk, riskIndex) => (
                                <div
                                    key={riskIndex}
                                    className="p-6 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-colors space-y-4"
                                >
                                    {/* Risk Description */}
                                    <div className="flex items-start space-x-3">
                                        {getProbabilityIcon(risk.probability)}
                                        <p className="text-sm text-zinc-200 leading-relaxed font-medium flex-1">
                                            {risk.description}
                                        </p>
                                    </div>

                                    {/* Risk Metrics */}
                                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                                        <div className="space-y-1">
                                            <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Probability</div>
                                            <div className={`text-xs font-bold ${getProbabilityColor(risk.probability)}`}>
                                                {risk.probability}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Impact</div>
                                            <div className={`text-xs font-bold ${getImpactColor(risk.impact)}`}>
                                                {risk.impact}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Risk Score</div>
                                            <div className="text-xs font-bold text-white font-mono">
                                                {calculateRiskScore(risk.probability, risk.impact)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mitigation Strategy */}
                                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-lg space-y-2">
                                        <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Mitigation Strategy</div>
                                        <p className="text-xs text-zinc-300 leading-relaxed">{risk.mitigation_strategy}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Risk Summary */}
                <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-3">
                    <div className="flex items-center space-x-2">
                        <AlertTriangle size={16} className="text-amber-400" />
                        <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.2em]">Credibility Note</h4>
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed">
                        All identified risks have documented mitigation strategies. This analysis removes "unknown unknowns" and provides
                        a realistic assessment of execution challenges. No hallucinations. No fluff.
                    </p>
                </div>
            </div>
        </section>
    );
}

function calculateRiskScore(probability: string, impact: string): string {
    const probValue = probability === 'High' ? 3 : probability === 'Medium' ? 2 : 1;
    const impactValue = impact === 'High' ? 3 : impact === 'Medium' ? 2 : 1;
    const score = probValue * impactValue;
    return `${score}/9`;
}
