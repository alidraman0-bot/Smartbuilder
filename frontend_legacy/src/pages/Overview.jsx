import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Play, Square, Pause, Terminal, AlertCircle, CheckCircle2,
    Circle, ArrowRight, Cpu, Activity, Zap, Layers, Network,
    Lock, RefreshCw
} from 'lucide-react';

const Overview = () => {
    const { runId, stage: currentStage, pipeline, logs, health, confidence } = useOutletContext();
    const [activeTab, setActiveTab] = useState('logs');

    // Fallback data if pipeline is empty
    const stages = pipeline && pipeline.length > 0 ? pipeline : [
        { id: 'IDEA', label: 'Idea Gen', status: 'pending', confidence: 0, duration: '--:--' },
        { id: 'RESEARCH', label: 'Research', status: 'pending', confidence: 0, duration: '--:--' },
        { id: 'PLAN', label: 'Strategy', status: 'pending', confidence: 0, duration: '--:--' },
        { id: 'MVP_BUILD', label: 'Builder', status: 'pending', confidence: 0, duration: '--:--' },
        { id: 'DEPLOY', label: 'Deploy', status: 'pending', confidence: 0, duration: '--:--' },
        { id: 'MONITOR', label: 'Monitor', status: 'pending', confidence: 0, duration: '--:--' }
    ];

    const displayLogs = logs || [];

    const StatusIcon = ({ status }) => {
        switch (status) {
            case 'completed': return <CheckCircle2 size={16} className="text-emerald-500" />;
            case 'active': return <div className="animate-spin"><RefreshCw size={16} className="text-blue-400" /></div>;
            case 'failed': return <AlertCircle size={16} className="text-red-500" />;
            default: return <Circle size={16} className="text-gray-600" />;
        }
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            {/* Header */}
            <div className="flex justify-between items-end pb-2 border-b border-white/5 shrink-0">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Mission Control</h2>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 font-mono">
                        <span className="uppercase tracking-wider">System Status:</span>
                        <span className={`px-1.5 py-0.5 rounded ${health === 'NOMINAL' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'} border border-white/5`}>{health || 'OFFLINE'}</span>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button className="glass-card px-4 py-2 flex items-center space-x-2 rounded text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white hover:bg-white/5">
                        <Pause size={14} /> <span>Pause</span>
                    </button>
                    <button className="px-4 py-2 flex items-center space-x-2 rounded text-xs font-bold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors">
                        <Square size={14} fill="currentColor" /> <span>Abort</span>
                    </button>
                </div>
            </div>

            {/* Bento Grid */}
            <div className="flex-1 grid grid-cols-12 grid-rows-6 gap-4 min-h-0">

                {/* Pipeline Visualization (Top Row) */}
                <div className="col-span-12 row-span-2 glass-panel rounded-lg p-5 flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-50"><Network size={40} className="text-blue-500/20" /></div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center space-x-2">
                        <Layers size={14} /> <span>Execution Pipeline</span>
                    </h3>

                    <div className="flex-1 flex items-center justify-between relative z-10 px-4">
                        {/* Connecting Line */}
                        <div className="absolute left-6 right-6 top-1/2 h-0.5 bg-white/5 -z-10 transform -translate-y-4"></div>

                        {stages.map((stage, idx) => (
                            <div key={stage.id} className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-3 bg-[#0a0a0a] transition-all duration-500 ${stage.status === 'active' ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] text-white scale-110' :
                                        stage.status === 'completed' ? 'border-emerald-500/50 text-emerald-500' :
                                            stage.status === 'failed' ? 'border-red-500 text-red-500' :
                                                'border-white/10 text-gray-600'
                                    }`}>
                                    <StatusIcon status={stage.status} />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${stage.status === 'active' ? 'text-white' : 'text-gray-500'}`}>{stage.label}</span>
                                <span className="text-[9px] font-mono text-gray-600">{stage.duration !== '--:--' ? stage.duration : ''}</span>

                                {stage.confidence > 0 && (
                                    <div className="mt-1 flex items-center space-x-1 bg-white/5 px-1.5 py-0.5 rounded">
                                        <div className="w-1 h-3 rounded-full bg-blue-500" style={{ height: `${stage.confidence * 0.1}px` }}></div>
                                        <span className="text-[8px] font-mono text-gray-400">{stage.confidence}%</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Signals (Bottom Left) */}
                <div className="col-span-4 row-span-4 glass-panel rounded-lg p-5 flex flex-col">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center space-x-2">
                        <Cpu size={14} /> <span>System Telemetry</span>
                    </h3>

                    <div className="space-y-6">
                        <div className="p-4 rounded bg-white/5 border border-white/5">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-gray-400 uppercase">Context Load</span>
                                <span className="text-xs font-mono text-blue-400">12%</span>
                            </div>
                            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full w-[12%] shadow-[0_0_10px_#3b82f6]"></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded bg-white/5 border border-white/5 text-center">
                                <Activity size={16} className="mx-auto mb-2 text-emerald-500" />
                                <div className="text-lg font-mono font-bold text-white">42ms</div>
                                <div className="text-[10px] text-gray-500 uppercase">Latency</div>
                            </div>
                            <div className="p-3 rounded bg-white/5 border border-white/5 text-center">
                                <Zap size={16} className="mx-auto mb-2 text-yellow-500" />
                                <div className="text-lg font-mono font-bold text-white">14.2k</div>
                                <div className="text-[10px] text-gray-500 uppercase">Tokens</div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-gray-400 uppercase text-[10px]">Auto-Safety</span>
                                <span className="text-xs font-bold text-emerald-400">ENABLED</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400 uppercase text-[10px]">Error Budget</span>
                                <span className="text-xs font-mono text-gray-300">0/5</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live Logs (Bottom Right) */}
                <div className="col-span-8 row-span-4 glass-panel rounded-lg flex flex-col overflow-hidden border border-white/10">
                    <div className="bg-white/5 px-4 py-3 flex justify-between items-center border-b border-white/5">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center space-x-2">
                            <Terminal size={14} /> <span>Live Event Stream</span>
                        </h3>
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 rounded-full bg-red-500/20"></div>
                            <div className="w-2 h-2 rounded-full bg-yellow-500/20"></div>
                            <div className="w-2 h-2 rounded-full bg-green-500/20"></div>
                        </div>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto font-mono-data text-xs relative bg-[#050505]">
                        {/* Scanline Effect */}
                        <div className="absolute inset-0 pointer-events-none scanline opacity-20"></div>

                        {displayLogs.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-2 opacity-50">
                                <Activity size={24} className="animate-spin-slow" />
                                <span>Waiting for system events...</span>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {displayLogs.map((log, i) => (
                                    <div key={i} className="flex space-x-4 hover:bg-white/5 p-1 rounded transition-colors group">
                                        <span className="text-gray-600 w-16 shrink-0 select-none group-hover:text-gray-400 transition-colors">{log.time}</span>
                                        <span className={`w-24 font-bold shrink-0 ${log.type === 'error' ? 'text-red-400' :
                                                log.type === 'warning' ? 'text-yellow-400' :
                                                    log.type === 'success' ? 'text-emerald-400' :
                                                        'text-blue-400'
                                            }`}>{log.module}</span>
                                        <span className="text-gray-300 break-words group-hover:text-white transition-colors">{log.message}</span>
                                    </div>
                                ))}
                                <div className="h-4 w-2 bg-blue-500/50 animate-pulse mt-2"></div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Overview;
