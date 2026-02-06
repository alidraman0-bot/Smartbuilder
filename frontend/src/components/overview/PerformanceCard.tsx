"use client";

import React from 'react';
import { MoreVertical, Kanban, Calendar, ArrowRight, Activity, AlertTriangle, Clock } from 'lucide-react';
import { useRunStore } from '@/store/useRunStore';

export default function PerformanceCard() {
    const { state, pipeline, health } = useRunStore();

    const currentRunProgress = pipeline.length > 0 ? (pipeline.filter(s => s.status === 'completed').length / pipeline.length) * 100 : 0;
    const currentStage = pipeline.find(s => s.status === 'active')?.label || state;

    const projects = [
        {
            id: 'P1',
            name: 'Project Phoenix',
            type: `AI MVP • Next: ${currentStage}`,
            status: state === 'INIT' ? 'Active' : (state === 'FAILED' ? 'Interrupted' : 'Executing'),
            progress: Math.round(currentRunProgress),
            health: health === 'NOMINAL' ? 'Nominal' : 'Critical',
            risk: state === 'FAILED' ? 'Extreme' : 'Nominal',
            color: 'from-blue-600 to-indigo-600'
        },
        {
            id: 'P2',
            name: 'Project Horizon',
            type: 'HealthTech • Stage: Scaling',
            status: 'Nominal',
            progress: 82,
            health: 'Nominal',
            risk: 'Nominal',
            color: 'from-emerald-600 to-teal-600'
        },
        {
            id: 'P3',
            name: 'Project Nova',
            type: 'eCommerce • Stage: Idle',
            status: 'Maintenance',
            progress: 100,
            health: 'Nominal',
            risk: 'Nominal',
            color: 'from-orange-600 to-amber-600'
        }
    ];

    return (
        <div className="glass-card rounded-2xl p-8 flex flex-col h-full relative overflow-hidden group">
            {/* Gradient Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50" />

            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <div className="bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 p-3 rounded-2xl border border-indigo-500/30 glow-primary-strong group-hover:scale-110 transition-transform duration-300">
                            <Activity size={22} className="text-indigo-400" strokeWidth={2.5} />
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-black animate-pulse shadow-lg shadow-emerald-400/50" />
                    </div>
                    <div>
                        <h3 className="font-bold text-xl text-white tracking-tight mb-1">Portfolio Velocity</h3>
                        <div className="text-xs text-zinc-400 font-medium flex items-center space-x-2">
                            <span>Real-time aggregate performance metrics</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        </div>
                    </div>
                </div>

                <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 backdrop-blur-sm">
                    <NavButton icon={<Activity size={14} />} active />
                    <NavButton icon={<Kanban size={14} />} />
                    <NavButton icon={<Calendar size={14} />} />
                </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pr-4 -mr-4 custom-scrollbar">
                {projects.map((project) => (
                    <div key={project.id} className="group relative">
                        <div className="flex justify-between items-start mb-5">
                            <div className="flex items-center space-x-4">
                                <div className={`relative w-12 h-12 rounded-2xl bg-gradient-to-br ${project.color} flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-110 duration-300 group-hover:shadow-xl group-hover:shadow-indigo-500/30`}>
                                    {project.name.charAt(8)}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 transition-all duration-300">{project.name}</h4>
                                    <p className="text-[10px] text-zinc-400 font-mono-data tracking-tight mt-1 uppercase">{project.type}</p>
                                </div>
                            </div>
                            <div className={`text-[10px] font-bold px-3 py-1.5 rounded-full border flex items-center space-x-2 backdrop-blur-sm transition-all duration-300 ${project.status === 'Interrupted'
                                    ? 'bg-red-500/10 text-red-400 border-red-500/30 shadow-lg shadow-red-500/20'
                                    : project.status === 'Executing' || project.status === 'Active'
                                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 glow-primary-strong'
                                        : 'bg-white/5 text-zinc-400 border-white/10'
                                }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${project.status === 'Interrupted' ? 'bg-red-400' : 'bg-indigo-400'} animate-pulse shadow-lg`} />
                                <span>{project.status.toUpperCase()}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-6 items-end">
                            <div className="col-span-6">
                                <div className="flex justify-between text-[10px] text-zinc-400 font-bold mb-2.5 uppercase tracking-widest">
                                    <span>Deployment Progress</span>
                                    <span className="font-mono-data text-white font-bold">{project.progress}%</span>
                                </div>
                                <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden backdrop-blur-sm">
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full" />
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${project.color} relative overflow-hidden`}
                                        style={{ width: `${project.progress}%` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-3">
                                <span className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">Vitals</span>
                                <div className="flex items-center space-x-2">
                                    <Activity size={14} className={project.health === 'Nominal' ? 'text-success' : 'text-danger'} />
                                    <span className={`text-[11px] font-bold ${project.health === 'Nominal' ? 'text-success' : 'text-danger'}`}>{project.health}</span>
                                </div>
                            </div>

                            <div className="col-span-3">
                                <span className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">Exposure</span>
                                <div className="flex items-center space-x-2">
                                    <AlertTriangle size={14} className={project.risk === 'Extreme' ? 'text-danger' : 'text-muted'} />
                                    <span className={`text-[11px] font-bold ${project.risk === 'Extreme' ? 'text-danger' : 'text-secondary'}`}>{project.risk}</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 border-b border-white/5 w-full opacity-50 group-last:hidden" />
                    </div>
                ))}
            </div>

            <button className="mt-6 w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 hover:from-white/10 hover:via-white/15 hover:to-white/10 border border-white/10 hover:border-indigo-500/30 h-12 transition-all duration-300 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className="relative z-10 text-xs font-bold text-white tracking-widest uppercase flex items-center justify-center space-x-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 transition-all duration-300">
                    <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span>Initialize Advanced Node</span>
                </span>
            </button>
        </div>
    );
}

function NavButton({ icon, active }: { icon: React.ReactNode, active?: boolean }) {
    return (
        <button className={`p-2.5 rounded-lg transition-all duration-300 ${active
                ? 'bg-indigo-500/20 text-indigo-400 shadow-lg shadow-indigo-500/20 border border-indigo-500/30 scale-105'
                : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'
            }`}>
            {icon}
        </button>
    );
}

import { Plus } from 'lucide-react';
