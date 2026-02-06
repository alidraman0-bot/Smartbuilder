import React from 'react';
import { TrendingUp, Activity, BarChart2, Zap } from 'lucide-react';
import { GrowthTrends as GrowthTrendsType } from '@/types/research';
import { chartColors, generateLinePath, formatPercentage } from '@/utils/chartHelpers';

interface GrowthTrendsProps {
    trends: GrowthTrendsType;
}

export default function GrowthTrends({ trends }: GrowthTrendsProps) {
    return (
        <section className="space-y-8">
            <div className="flex items-center space-x-3">
                <TrendingUp size={20} className="text-indigo-500" />
                <h2 className="text-2xl font-bold text-white tracking-tight">Growth Trends & Forecasts</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            <div className="glass-card p-10 rounded-3xl space-y-12">
                {/* Trend Signals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {trends.trend_signals.map((signal, index) => (
                        <TrendSignalCard key={index} signal={signal} />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Forecast Scenarios */}
                    <div className="lg:col-span-1 space-y-6">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Forecast Model Scenarios</h3>
                        <div className="space-y-4">
                            {trends.forecast_scenarios.map((scenario, index) => (
                                <ForecastScenarioCard key={index} scenario={scenario} />
                            ))}
                        </div>
                    </div>

                    {/* Growth Visualizer */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Momentum visualizer (5-Year Forecast)</h3>
                        <div className="bg-[#09090b] p-8 rounded-2xl border border-white/5 h-[300px] relative">
                            <ForecastChart scenarios={trends.forecast_scenarios} />
                        </div>
                        <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                            <p className="text-[10px] text-zinc-400 leading-relaxed font-medium capitalize">
                                <span className="text-indigo-400 font-bold uppercase tracking-widest mr-2">Analyst Note:</span>
                                Acceleration indicators derived from search velocity and funding cycles suggest a window of maximum opportunity opening in 12-18 months.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function TrendSignalCard({ signal }: { signal: any }) {
    const isPositive = signal.acceleration === 'Accelerating' || signal.growth_rate > 20;

    return (
        <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3 hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{signal.label}</span>
                <Activity size={12} className={isPositive ? 'text-indigo-400' : 'text-zinc-600'} />
            </div>
            <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-white font-mono">+{signal.growth_rate}%</span>
            </div>
            <div className="flex items-center space-x-1.5">
                <span className={`text-[9px] font-bold uppercase tracking-wider ${signal.acceleration === 'Accelerating' ? 'text-green-400' :
                        signal.acceleration === 'Steady' ? 'text-indigo-400' : 'text-amber-400'
                    }`}>
                    {signal.acceleration}
                </span>
            </div>
        </div>
    );
}

function ForecastScenarioCard({ scenario }: { scenario: any }) {
    const getStyle = () => {
        switch (scenario.scenario) {
            case 'Aggressive': return { border: 'border-indigo-500/30', text: 'text-indigo-400', bg: 'bg-indigo-500/5' };
            case 'Base': return { border: 'border-white/10', text: 'text-white', bg: 'bg-white/5' };
            case 'Conservative': return { border: 'border-white/5', text: 'text-zinc-400', bg: 'bg-white/[0.02]' };
            default: return { border: 'border-white/10', text: 'text-white', bg: 'bg-white/5' };
        }
    };

    const style = getStyle();

    return (
        <div className={`p-4 rounded-xl border ${style.border} ${style.bg} space-y-3`}>
            <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${style.text}`}>{scenario.scenario}</span>
                <span className="text-[10px] font-mono text-zinc-500">5Y Multiple: {(scenario.year_5 / scenario.year_1).toFixed(1)}x</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                    <div className="text-[8px] text-zinc-600 uppercase mb-1">Y1</div>
                    <div className="text-xs font-bold text-zinc-300">100%</div>
                </div>
                <div className="text-center">
                    <div className="text-[8px] text-zinc-600 uppercase mb-1">Y3</div>
                    <div className="text-xs font-bold text-zinc-300">{Math.round(scenario.year_3)}%</div>
                </div>
                <div className="text-center">
                    <div className="text-[8px] text-zinc-600 uppercase mb-1">Y5</div>
                    <div className={`text-xs font-bold ${style.text}`}>{Math.round(scenario.year_5)}%</div>
                </div>
            </div>
        </div>
    );
}

function ForecastChart({ scenarios }: { scenarios: any[] }) {
    const width = 600;
    const height = 240;
    const padding = 40;

    const agg = scenarios.find(s => s.scenario === 'Aggressive');
    const base = scenarios.find(s => s.scenario === 'Base');
    const cons = scenarios.find(s => s.scenario === 'Conservative');

    const getPoints = (s: any) => [s.year_1, s.year_3, s.year_5];
    const maxVal = Math.max(...scenarios.map(s => s.year_5));

    const pathAgg = generateLinePath(getPoints(agg), width, height, padding);
    const pathBase = generateLinePath(getPoints(base), width, height, padding);
    const pathCons = generateLinePath(getPoints(cons), width, height, padding);

    return (
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
            <defs>
                <linearGradient id="gradAgg" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={chartColors.primary} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={chartColors.primary} stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Grid */}
            {[0, 0.5, 1].map(r => (
                <line key={r} x1={padding} y1={padding + (height - 2 * padding) * r} x2={width - padding} y2={padding + (height - 2 * padding) * r} stroke={chartColors.grid} strokeWidth="1" strokeDasharray="4 4" />
            ))}

            {/* Paths */}
            <path d={pathCons} fill="none" stroke={chartColors.text} strokeWidth="2" strokeDasharray="4 4" opacity="0.3" />
            <path d={pathAgg} fill="none" stroke={chartColors.primary} strokeWidth="2" opacity="0.6" />
            <path d={pathBase} fill="none" stroke="#fff" strokeWidth="3" />

            {/* Points for Base */}
            {getPoints(base).map((v, i) => {
                const x = padding + i * ((width - 2 * padding) / 2);
                const y = padding + (height - 2 * padding) - ((v / maxVal) * (height - 2 * padding));
                return <circle key={i} cx={x} cy={y} r="4" fill="#fff" className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />;
            })}

            <text x={padding} y={height - 10} className="text-[10px] fill-zinc-600 font-bold">Year 1</text>
            <text x={width / 2} y={height - 10} textAnchor="middle" className="text-[10px] fill-zinc-600 font-bold">Year 3</text>
            <text x={width - padding} y={height - 10} textAnchor="end" className="text-[10px] fill-zinc-600 font-bold">Year 5</text>
        </svg>
    );
}
