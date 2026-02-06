import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { MarketEconomics as MarketEconomicsType } from '@/types/research';
import { formatLargeNumber, chartColors } from '@/utils/chartHelpers';

interface MarketEconomicsProps {
    economics: MarketEconomicsType;
}

export default function MarketEconomics({ economics }: MarketEconomicsProps) {
    const { tam, sam, som, chart_data } = economics;

    // Calculate max value for chart scaling
    const maxValue = Math.max(...chart_data.tam_values);

    return (
        <section className="space-y-8">
            <div className="flex items-center space-x-3">
                <BarChart3 size={20} className="text-indigo-500" />
                <h2 className="text-2xl font-bold text-white tracking-tight">Market Size & Economics</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            <div className="glass-card p-10 rounded-3xl space-y-10">
                {/* Market Metrics Table */}
                <div className="overflow-hidden rounded-2xl border border-white/10">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="text-left px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Metric</th>
                                <th className="text-right px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Value</th>
                                <th className="text-right px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">CAGR</th>
                                <th className="text-right px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Source</th>
                                <th className="text-center px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Confidence</th>
                            </tr>
                        </thead>
                        <tbody>
                            <MarketMetricRow label="TAM" metric={tam} color="text-indigo-400" />
                            <MarketMetricRow label="SAM" metric={sam} color="text-purple-400" />
                            <MarketMetricRow label="SOM" metric={som} color="text-green-400" />
                        </tbody>
                    </table>
                </div>

                {/* Stacked Bar Chart */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                        {economics.forecast_years}-Year Market Projection
                    </h3>
                    <div className="bg-[#09090b] p-8 rounded-2xl border border-white/5">
                        <StackedBarChart data={chart_data} maxValue={maxValue} />
                    </div>
                </div>

                {/* Growth Trajectory Line Chart */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                        Growth Trajectory Analysis
                    </h3>
                    <div className="bg-[#09090b] p-8 rounded-2xl border border-white/5">
                        <GrowthLineChart data={chart_data} />
                    </div>
                </div>

                {/* Key Insights */}
                <div className="p-6 bg-green-500/5 border border-green-500/20 rounded-2xl">
                    <div className="flex items-start space-x-3">
                        <TrendingUp size={16} className="text-green-400 mt-0.5" />
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-bold text-green-400 uppercase tracking-[0.2em]">Market Opportunity</h4>
                            <p className="text-sm text-zinc-300 leading-relaxed">
                                Serviceable Obtainable Market (SOM) of <span className="font-bold text-white">{formatLargeNumber(som.value * 1000000000)}</span> growing at{' '}
                                <span className="font-bold text-green-400">{som.cagr}% CAGR</span>, indicating strong revenue potential for focused execution.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function MarketMetricRow({ label, metric, color }: { label: string; metric: any; color: string }) {
    const getConfidenceBadge = (confidence: string) => {
        const colors = {
            High: 'bg-green-500/10 text-green-400 border-green-500/20',
            Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            Low: 'bg-red-500/10 text-red-400 border-red-500/20',
        };
        return colors[confidence as keyof typeof colors] || colors.Medium;
    };

    return (
        <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
            <td className="px-6 py-4">
                <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${color.replace('text-', 'bg-')}`} />
                    <span className={`text-sm font-bold ${color}`}>{label}</span>
                </div>
            </td>
            <td className="px-6 py-4 text-right">
                <span className="text-lg font-bold text-white font-mono">
                    {formatLargeNumber(metric.value * 1000000000)}
                </span>
            </td>
            <td className="px-6 py-4 text-right">
                <span className="text-sm font-bold text-green-400 font-mono">{metric.cagr}%</span>
            </td>
            <td className="px-6 py-4 text-right">
                <span className="text-xs text-zinc-400">{metric.source}</span>
            </td>
            <td className="px-6 py-4">
                <div className="flex justify-center">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${getConfidenceBadge(metric.confidence)}`}>
                        {metric.confidence}
                    </span>
                </div>
            </td>
        </tr>
    );
}

function StackedBarChart({ data, maxValue }: { data: any; maxValue: number }) {
    const width = 700;
    const height = 300;
    const padding = 60;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const barWidth = chartWidth / data.categories.length * 0.5;
    const barSpacing = chartWidth / data.categories.length;

    return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                <g key={ratio}>
                    <line
                        x1={padding}
                        y1={padding + chartHeight * (1 - ratio)}
                        x2={width - padding}
                        y2={padding + chartHeight * (1 - ratio)}
                        stroke={chartColors.grid}
                        strokeWidth="1"
                    />
                    <text
                        x={padding - 10}
                        y={padding + chartHeight * (1 - ratio) + 4}
                        textAnchor="end"
                        className="text-[10px] fill-zinc-600 font-mono"
                    >
                        {formatLargeNumber(maxValue * ratio * 1000000000)}
                    </text>
                </g>
            ))}

            {/* Bars */}
            {data.categories.map((category: string, index: number) => {
                const x = padding + index * barSpacing + (barSpacing - barWidth) / 2;
                const tamHeight = (data.tam_values[index] / maxValue) * chartHeight;
                const samHeight = (data.sam_values[index] / maxValue) * chartHeight;
                const somHeight = (data.som_values[index] / maxValue) * chartHeight;

                return (
                    <g key={index}>
                        {/* TAM bar */}
                        <rect
                            x={x}
                            y={padding + chartHeight - tamHeight}
                            width={barWidth}
                            height={tamHeight}
                            fill={chartColors.tam}
                            opacity="0.3"
                            rx="4"
                        />
                        {/* SAM bar */}
                        <rect
                            x={x}
                            y={padding + chartHeight - samHeight}
                            width={barWidth}
                            height={samHeight}
                            fill={chartColors.sam}
                            opacity="0.5"
                            rx="4"
                        />
                        {/* SOM bar */}
                        <rect
                            x={x}
                            y={padding + chartHeight - somHeight}
                            width={barWidth}
                            height={somHeight}
                            fill={chartColors.som}
                            opacity="0.8"
                            rx="4"
                        />
                        {/* Category label */}
                        <text
                            x={x + barWidth / 2}
                            y={height - padding + 20}
                            textAnchor="middle"
                            className="text-[10px] fill-zinc-500 font-bold"
                        >
                            {category}
                        </text>
                    </g>
                );
            })}

            {/* Legend */}
            <g transform={`translate(${width - padding - 150}, ${padding})`}>
                {[
                    { label: 'TAM', color: chartColors.tam, opacity: 0.3 },
                    { label: 'SAM', color: chartColors.sam, opacity: 0.5 },
                    { label: 'SOM', color: chartColors.som, opacity: 0.8 },
                ].map((item, i) => (
                    <g key={item.label} transform={`translate(0, ${i * 20})`}>
                        <rect width="12" height="12" fill={item.color} opacity={item.opacity} rx="2" />
                        <text x="18" y="10" className="text-[10px] fill-zinc-400 font-bold">
                            {item.label}
                        </text>
                    </g>
                ))}
            </g>
        </svg>
    );
}

function GrowthLineChart({ data }: { data: any }) {
    const width = 700;
    const height = 250;
    const padding = 60;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxValue = Math.max(...data.tam_values);
    const stepX = chartWidth / (data.categories.length - 1);

    const generatePath = (values: number[]) => {
        const points = values.map((value, index) => {
            const x = padding + index * stepX;
            const y = padding + chartHeight - (value / maxValue) * chartHeight;
            return `${x},${y}`;
        });
        return `M ${points.join(' L ')}`;
    };

    return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* Grid */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                <line
                    key={ratio}
                    x1={padding}
                    y1={padding + chartHeight * (1 - ratio)}
                    x2={width - padding}
                    y2={padding + chartHeight * (1 - ratio)}
                    stroke={chartColors.grid}
                    strokeWidth="1"
                />
            ))}

            {/* Lines */}
            <path
                d={generatePath(data.tam_values)}
                fill="none"
                stroke={chartColors.tam}
                strokeWidth="2"
                opacity="0.4"
            />
            <path
                d={generatePath(data.sam_values)}
                fill="none"
                stroke={chartColors.sam}
                strokeWidth="2"
                opacity="0.6"
            />
            <path
                d={generatePath(data.som_values)}
                fill="none"
                stroke={chartColors.som}
                strokeWidth="3"
            />

            {/* Data points */}
            {data.som_values.map((value: number, index: number) => {
                const x = padding + index * stepX;
                const y = padding + chartHeight - (value / maxValue) * chartHeight;
                return (
                    <circle
                        key={index}
                        cx={x}
                        cy={y}
                        r="4"
                        fill={chartColors.som}
                        className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    />
                );
            })}

            {/* X-axis labels */}
            {data.categories.map((category: string, index: number) => (
                <text
                    key={index}
                    x={padding + index * stepX}
                    y={height - padding + 20}
                    textAnchor="middle"
                    className="text-[10px] fill-zinc-500 font-bold"
                >
                    {category}
                </text>
            ))}
        </svg>
    );
}
