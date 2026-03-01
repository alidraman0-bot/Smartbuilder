import React from 'react';
import { TrendingUp, Users, DollarSign, Hammer, BarChart3 } from 'lucide-react';

interface ScoreData {
    score: number;
    market_demand: string;
    competition: string;
    revenue_potential: string;
    build_difficulty: string;
    trend: string;
}

interface OpportunityScoreProps {
    scoreData: ScoreData;
}

const OpportunityScore: React.FC<OpportunityScoreProps> = ({ scoreData }) => {
    const { score, market_demand, competition, revenue_potential, build_difficulty, trend } = scoreData;

    // Helper to determine color based on score
    const getScoreColor = (val: number) => {
        if (val >= 8) return 'text-emerald-400';
        if (val >= 6) return 'text-yellow-400';
        return 'text-rose-400';
    };

    const getProgressColor = (val: number) => {
        if (val >= 8) return 'bg-emerald-500';
        if (val >= 6) return 'bg-yellow-500';
        return 'bg-rose-500';
    };

    const Dimension = ({ icon: Icon, label, value, colorClass }: any) => (
        <div className="flex items-center justify-between group/dim">
            <div className="flex items-center space-x-2">
                <Icon className="w-3.5 h-3.5 text-zinc-500 group-hover/dim:text-zinc-300 transition-colors" />
                <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
            </div>
            <span className={`text-xs font-bold ${colorClass}`}>{value}</span>
        </div>
    );

    const getDimensionColor = (val: string) => {
        const low = ['Low', 'Declining'];
        const med = ['Medium', 'Stable'];
        const high = ['High', 'Rising'];

        if (high.includes(val)) return 'text-emerald-400';
        if (med.includes(val)) return 'text-yellow-400';
        return 'text-rose-400';
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-end justify-between mb-6">
                <div>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1 block">Venture Analysis</span>
                    <h4 className="text-sm font-bold text-white">Opportunity Score</h4>
                </div>
                <div className="text-right">
                    <span className={`text-4xl font-black tracking-tighter ${getScoreColor(score)}`}>
                        {score.toFixed(1)}
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-8">
                <div
                    className={`h-full ${getProgressColor(score)} transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(16,185,129,0.3)]`}
                    style={{ width: `${score * 10}%` }}
                />
            </div>

            {/* Dimensions Grid */}
            <div className="grid grid-cols-1 gap-4">
                <Dimension
                    icon={Users}
                    label="Demand"
                    value={market_demand}
                    colorClass={getDimensionColor(market_demand)}
                />
                <Dimension
                    icon={BarChart3}
                    label="Competition"
                    value={competition}
                    colorClass={competition === 'Low' ? 'text-emerald-400' : competition === 'Medium' ? 'text-yellow-400' : 'text-rose-400'}
                />
                <Dimension
                    icon={DollarSign}
                    label="Revenue"
                    value={revenue_potential}
                    colorClass={getDimensionColor(revenue_potential)}
                />
                <Dimension
                    icon={Hammer}
                    label="Difficulty"
                    value={build_difficulty}
                    colorClass={build_difficulty === 'Low' ? 'text-emerald-400' : build_difficulty === 'Medium' ? 'text-yellow-400' : 'text-rose-400'}
                />
                <Dimension
                    icon={TrendingUp}
                    label="Trend"
                    value={trend}
                    colorClass={getDimensionColor(trend)}
                />
            </div>
        </div>
    );
};

export default OpportunityScore;
