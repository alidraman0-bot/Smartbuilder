import React from 'react';
import { Users, Crosshair, Shield } from 'lucide-react';
import { CompetitiveLandscape as CompetitiveLandscapeType } from '@/types/research';
import { chartColors } from '@/utils/chartHelpers';

interface CompetitiveLandscapeProps {
    landscape: CompetitiveLandscapeType;
}

export default function CompetitiveLandscape({ landscape }: CompetitiveLandscapeProps) {
    const { competitive_matrix, positioning_map, moat_analysis } = landscape;

    return (
        <section className="space-y-8">
            <div className="flex items-center space-x-3">
                <Users size={20} className="text-indigo-500" />
                <h2 className="text-2xl font-bold text-white tracking-tight">Competitive Landscape</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                <span className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">Reality Check</span>
            </div>

            <div className="glass-card p-10 rounded-3xl space-y-10">
                {/* Competitive Matrix */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Competitive Matrix</h3>
                    <div className="overflow-hidden rounded-2xl border border-white/10">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10">
                                    <th className="text-left px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Player</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Target</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Pricing</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Strength</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Critical Gap</th>
                                </tr>
                            </thead>
                            <tbody>
                                {competitive_matrix.map((player, index) => (
                                    <tr key={index} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-white">{player.name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-zinc-400">{player.target_segment}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-zinc-400 font-mono">{player.pricing_model}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-green-400">{player.key_strength}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-amber-400">{player.critical_gap}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Market Positioning Map */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Crosshair size={14} className="text-indigo-400" />
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Market Positioning Map</h3>
                    </div>
                    <div className="bg-[#09090b] p-8 rounded-2xl border border-white/5">
                        <PositioningMapChart data={positioning_map} />
                    </div>
                </div>

                {/* Moat Analysis */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Shield size={14} className="text-green-400" />
                        <h3 className="text-[10px] font-bold text-green-400 uppercase tracking-[0.2em]">Moat Analysis</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <MoatCard
                            title="Data Advantage"
                            description={moat_analysis.data_advantage}
                            icon={<Shield size={16} className="text-indigo-400" />}
                        />
                        <MoatCard
                            title="Switching Costs"
                            description={moat_analysis.switching_costs}
                            icon={<Shield size={16} className="text-purple-400" />}
                        />
                        <MoatCard
                            title="Regulatory Complexity"
                            description={moat_analysis.regulatory_complexity}
                            icon={<Shield size={16} className="text-green-400" />}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

function PositioningMapChart({ data }: { data: any }) {
    const width = 600;
    const height = 400;
    const padding = 80;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* Grid */}
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke={chartColors.axis} strokeWidth="2" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke={chartColors.axis} strokeWidth="2" />

            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((value) => (
                <g key={value}>
                    <line
                        x1={padding}
                        y1={padding + chartHeight * (1 - value / 100)}
                        x2={width - padding}
                        y2={padding + chartHeight * (1 - value / 100)}
                        stroke={chartColors.grid}
                        strokeWidth="1"
                        strokeDasharray="4 4"
                    />
                    <line
                        x1={padding + chartWidth * (value / 100)}
                        y1={padding}
                        x2={padding + chartWidth * (value / 100)}
                        y2={height - padding}
                        stroke={chartColors.grid}
                        strokeWidth="1"
                        strokeDasharray="4 4"
                    />
                </g>
            ))}

            {/* Axis labels */}
            <text
                x={width / 2}
                y={height - padding + 40}
                textAnchor="middle"
                className="text-xs fill-zinc-400 font-bold"
            >
                {data.x_axis}
            </text>
            <text
                x={padding - 50}
                y={height / 2}
                textAnchor="middle"
                transform={`rotate(-90, ${padding - 50}, ${height / 2})`}
                className="text-xs fill-zinc-400 font-bold"
            >
                {data.y_axis}
            </text>

            {/* Players */}
            {data.players.map((player: any, index: number) => {
                const cx = padding + (player.x / 100) * chartWidth;
                const cy = padding + chartHeight - (player.y / 100) * chartHeight;
                const isYourSolution = player.name === 'Your Solution';

                return (
                    <g key={index}>
                        <circle
                            cx={cx}
                            cy={cy}
                            r={isYourSolution ? 12 : 8}
                            fill={isYourSolution ? chartColors.success : chartColors.primary}
                            opacity={isYourSolution ? 1 : 0.6}
                            className={isYourSolution ? 'drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]' : ''}
                        />
                        <text
                            x={cx}
                            y={cy - 20}
                            textAnchor="middle"
                            className={`text-[10px] font-bold ${isYourSolution ? 'fill-green-400' : 'fill-zinc-400'}`}
                        >
                            {player.name}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

function MoatCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
    return (
        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl space-y-3 hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center space-x-2">
                {icon}
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{title}</h4>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">{description}</p>
        </div>
    );
}
