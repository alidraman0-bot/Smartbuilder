import React from 'react';
import { Shield, Clock, ChevronDown, User, Server } from 'lucide-react';

const TopBar = ({ runId = "CONNECTING", stage = "INIT", health = "UNKNOWN", confidence = 0, elapsed = "00:00:00" }) => {
    return (
        <div className="h-16 glass-panel mx-4 mt-4 rounded-xl flex items-center justify-between px-6 z-10 sticky top-0 backdrop-blur-md shrink-0">
            {/* Left: Run Information */}
            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Run</span>
                    <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1 rounded-md">
                        <Server size={12} className="text-blue-400" />
                        <span className="font-mono-data text-xs text-blue-100">{runId}</span>
                    </div>
                </div>

                <div className="h-4 w-[1px] bg-white/10"></div>

                <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">State</span>
                    <span className="text-xs font-semibold text-white px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">{stage}</span>
                </div>
            </div>

            {/* Right: Metrics & User */}
            <div className="flex items-center space-x-8">
                {/* System Stats Group */}
                <div className="flex items-center space-x-6 pr-6 border-r border-white/10 hidden sm:flex">
                    <div className="flex flex-col items-end group">
                        <div className="flex items-center space-x-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] uppercase font-bold tracking-wide">Health</span>
                            <span className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px] ${health === 'NOMINAL' ? 'bg-emerald-500 shadow-emerald-500' : 'bg-red-500 shadow-red-500'}`}></span>
                        </div>
                        <span className={`text-xs font-mono font-medium ${health === 'NOMINAL' ? 'text-emerald-400' : 'text-red-400'}`}>{health}</span>
                    </div>

                    <div className="flex flex-col items-end group">
                        <div className="flex items-center space-x-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                            <Shield size={10} />
                            <span className="text-[10px] uppercase font-bold tracking-wide">Conf.</span>
                        </div>
                        <span className="text-xs font-mono text-blue-400 font-medium">{confidence > 0 ? confidence.toFixed(1) : 0}%</span>
                    </div>

                    <div className="flex flex-col items-end group">
                        <div className="flex items-center space-x-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                            <Clock size={10} />
                            <span className="text-[10px] uppercase font-bold tracking-wide">Time</span>
                        </div>
                        <span className="text-xs font-mono text-gray-300 font-medium">{elapsed}</span>
                    </div>
                </div>

                {/* User Profile */}
                <div className="flex items-center space-x-3 cursor-pointer group">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center group-hover:border-white/20 transition-colors shadow-lg">
                        <User size={16} className="text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex flex-col hidden lg:flex">
                        <span className="text-xs font-medium text-gray-200 group-hover:text-white">Antigravity</span>
                        <span className="text-[10px] text-gray-500">Administrator</span>
                    </div>
                    <ChevronDown size={12} className="text-gray-500 group-hover:text-white transition-colors" />
                </div>
            </div>
        </div>
    );
};

export default TopBar;
