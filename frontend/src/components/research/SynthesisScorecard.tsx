import React from 'react';
import { Target, TrendingUp, Shield, Zap, CheckCircle, XCircle, Clock } from 'lucide-react';
import { SynthesisScorecard as SynthesisScorecardType } from '@/types/research';

interface SynthesisScorecardProps {
    scorecard: SynthesisScorecardType;
}

export default function SynthesisScorecard({ scorecard }: SynthesisScorecardProps) {
    const { composite_scores, final_recommendation, confidence_level, rationale, next_steps } = scorecard;

    const getRecommendationStyle = (recommendation: string) => {
        switch (recommendation) {
            case 'BUILD':
                return {
                    bg: 'bg-green-500/10',
                    border: 'border-green-500/30',
                    text: 'text-green-400',
                    glow: 'shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)]',
                    icon: <CheckCircle size={24} className="text-green-400" />,
                };
            case 'HOLD':
                return {
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/30',
                    text: 'text-amber-400',
                    glow: 'shadow-[0_0_40px_-10px_rgba(245,158,11,0.4)]',
                    icon: <Clock size={24} className="text-amber-400" />,
                };
            case 'KILL':
                return {
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/30',
                    text: 'text-red-400',
                    glow: 'shadow-[0_0_40px_-10px_rgba(239,68,68,0.4)]',
                    icon: <XCircle size={24} className="text-red-400" />,
                };
            default:
                return {
                    bg: 'bg-zinc-500/10',
                    border: 'border-zinc-500/30',
                    text: 'text-zinc-400',
                    glow: '',
                    icon: <Target size={24} className="text-zinc-400" />,
                };
        }
    };

    const style = getRecommendationStyle(final_recommendation);

    const getConfidenceColor = (level: string) => {
        switch (level) {
            case 'High': return 'text-green-400';
            case 'Medium': return 'text-amber-400';
            case 'Low': return 'text-red-400';
            default: return 'text-zinc-400';
        }
    };

    const getDimensionIcon = (dimension: string) => {
        switch (dimension) {
            case 'Market Attractiveness': return <Target size={16} className="text-indigo-400" />;
            case 'Timing': return <Clock size={16} className="text-purple-400" />;
            case 'Defensibility': return <Shield size={16} className="text-green-400" />;
            case 'Speed to Revenue': return <Zap size={16} className="text-amber-400" />;
            default: return <TrendingUp size={16} className="text-zinc-400" />;
        }
    };

    return (
        <section className="space-y-8">
            <div className="flex items-center space-x-3">
                <Target size={20} className="text-indigo-500" />
                <h2 className="text-2xl font-bold text-white tracking-tight">Synthesis Scorecard</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            <div className="glass-card p-10 rounded-3xl space-y-10">
                {/* Composite Scores */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Composite Scores</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {composite_scores.map((score, index) => (
                            <div key={index} className="p-6 bg-white/[0.02] border border-white/5 rounded-xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        {getDimensionIcon(score.dimension)}
                                        <h4 className="text-sm font-bold text-white">{score.dimension}</h4>
                                    </div>
                                    <div className="text-2xl font-black text-white font-mono">{score.score}/10</div>
                                </div>

                                {/* Score Bar */}
                                <div className="space-y-2">
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                            style={{ width: `${score.score * 10}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between text-[9px]">
                                        <span className="text-zinc-600 uppercase tracking-widest font-bold">Weight: {score.weight}%</span>
                                        <span className="text-zinc-500">{score.score * 10}%</span>
                                    </div>
                                </div>

                                {/* Justification */}
                                <p className="text-xs text-zinc-400 leading-relaxed">{score.justification}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Final Recommendation */}
                <div className={`p-10 ${style.bg} border-2 ${style.border} rounded-3xl ${style.glow} space-y-6 relative overflow-hidden`}>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl -mr-32 -mt-32 pointer-events-none" />

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                {style.icon}
                                <div>
                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Final Recommendation</div>
                                    <div className={`text-4xl font-black ${style.text} tracking-tight`}>{final_recommendation}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Confidence Level</div>
                                <div className={`text-2xl font-bold ${getConfidenceColor(confidence_level)}`}>{confidence_level}</div>
                            </div>
                        </div>

                        {/* Rationale */}
                        <div className="p-6 bg-black/20 border border-white/10 rounded-2xl">
                            <p className="text-sm text-zinc-200 leading-relaxed font-medium">{rationale}</p>
                        </div>

                        {/* Next Steps */}
                        {next_steps.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Recommended Next Steps</h4>
                                <ul className="space-y-2">
                                    {next_steps.map((step, index) => (
                                        <li key={index} className="flex items-start space-x-3 text-sm text-zinc-300">
                                            <span className={`${style.text} mt-1`}>→</span>
                                            <span className="font-medium">{step}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Methodology Note */}
                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <div className="flex items-start space-x-3">
                        <Shield size={16} className="text-indigo-400 mt-0.5" />
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Methodology</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                This scorecard synthesizes quantitative market data, competitive analysis, risk assessment, and timing factors
                                into a weighted composite score. The recommendation is data-driven and reflects institutional-grade investment criteria.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
