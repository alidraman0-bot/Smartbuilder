import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Lightbulb, Search, FileText, Code, Rocket, Activity, Lock, Layers } from 'lucide-react';

const Sidebar = ({ currentStage = "MVP_BUILD" }) => {
    const STAGES = ['IDEA', 'RESEARCH', 'PLAN', 'MVP_BUILD', 'DEPLOY', 'MONITOR'];
    const currentStageIndex = STAGES.indexOf(currentStage);

    const isLocked = (itemStage) => {
        if (!itemStage) return false;
        const itemIndex = STAGES.indexOf(itemStage);
        return itemIndex > currentStageIndex;
    };

    const navItems = [
        { label: 'Overview', icon: LayoutDashboard, path: '/', stage: null },
        { label: 'Idea Generator', icon: Lightbulb, path: '/ideas', stage: 'IDEA' },
        { label: 'Research', icon: Search, path: '/research', stage: 'RESEARCH' },
        { label: 'Business Plan', icon: FileText, path: '/plan', stage: 'PLAN' },
        { label: 'MVP Builder', icon: Code, path: '/build', stage: 'MVP_BUILD' },
        { label: 'Deploy', icon: Rocket, path: '/deploy', stage: 'DEPLOY' },
        { label: 'Monitoring', icon: Activity, path: '/monitor', stage: 'MONITOR' },
    ];

    return (
        <div className="hidden md:flex w-64 h-full flex-col glass-panel m-4 rounded-xl border-r-0 relative overflow-hidden shrink-0">
            {/* Background Glow */}
            <div className="absolute top-0 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header */}
            <div className="h-20 flex flex-col justify-center px-6 border-b border-white/5 relative z-10">
                <div className="flex items-center space-x-2">
                    <Layers size={20} className="text-blue-500" />
                    <h1 className="text-lg font-bold tracking-tight text-white/90">ANTIGRAVITY</h1>
                </div>
                <p className="text-[10px] text-gray-400/80 uppercase tracking-widest mt-1 pl-7">Supervisor v7.0</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1 relative z-10 overflow-y-auto">
                {navItems.map((item) => {
                    const locked = isLocked(item.stage);

                    if (locked) {
                        return (
                            <div key={item.path} className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-600/50 cursor-not-allowed group border border-transparent">
                                <item.icon size={18} />
                                <span className="text-sm font-medium font-mono">{item.label}</span>
                                <Lock size={12} className="ml-auto opacity-30" />
                            </div>
                        );
                    }

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-300 relative group overflow-hidden ${isActive
                                    ? 'text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] bg-gradient-to-r from-blue-500/20 to-transparent border border-blue-500/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full"></div>}
                                    <item.icon size={18} className={isActive ? 'text-blue-400' : 'group-hover:text-blue-200 transition-colors'} />
                                    <span className="tracking-wide">{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 bg-black/20 relative z-10">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></div>
                        <div className="absolute top-0 left-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">System Online</span>
                        <span className="text-[10px] text-gray-600 font-mono">Connected</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
