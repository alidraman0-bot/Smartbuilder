"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Lightbulb, Search, Code, Rocket,
    Layers, Lock, Share2, Activity, Sparkles, Zap, TrendingUp, Library, History
} from 'lucide-react';

const Sidebar = ({ currentStage = "MVP_BUILD" }: { currentStage?: string }) => {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full bg-transparent relative">
            {/* Premium Header with Gradient */}
            <div className="h-20 flex items-center px-6 border-b border-white/8 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
                <Link href="/" className="flex items-center space-x-3 group cursor-pointer relative z-10">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-all duration-300 group-hover:shadow-indigo-500/50">
                            <Sparkles size={20} className="text-white" strokeWidth={2.5} />
                        </div>
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-black animate-pulse shadow-lg shadow-emerald-400/50" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-base font-bold tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 transition-all duration-300">
                            Smartbuilder
                        </span>
                        <span className="text-[10px] font-mono font-semibold text-indigo-400/70 uppercase tracking-wider">AI Platform</span>
                    </div>
                </Link>
            </div>

            {/* Enhanced Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-8 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500/20 scrollbar-track-transparent">
                {/* Portfolio Section */}
                <section className="space-y-2">
                    <div className="flex items-center justify-between px-4 mb-3">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em]">Portfolio</span>
                        <TrendingUp size={12} className="text-zinc-600" />
                    </div>
                    <NavLink
                        href="/overview"
                        icon={<LayoutDashboard size={18} />}
                        label="Executive Overview"
                        isActive={pathname === '/overview'}
                        badge={null}
                    />

                    <NavLink
                        href="/memory"
                        icon={<History size={18} />}
                        label="Project Memory"
                        isActive={pathname === '/memory'}
                        badge={null}
                    />
                </section>

                {/* Pipeline Lifecycle Section */}
                <section className="space-y-1.5">
                    <div className="flex items-center justify-between px-4 mb-3">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em]">Pipeline Lifecycle</span>
                        <Zap size={12} className="text-zinc-600" />
                    </div>

                    <div className="relative px-2">
                        {/* Progress Indicator Line */}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/5" />
                        <div
                            className="absolute left-6 top-0 w-0.5 bg-gradient-to-b from-indigo-500 to-purple-500 transition-all duration-1000"
                            style={{
                                height: `${getPipelineProgress(currentStage)}%`,
                                boxShadow: '0 0 8px rgba(99, 102, 241, 0.5)'
                            }}
                        />

                        <div className="relative space-y-1">
                            <NavLink
                                href="/ideas"
                                icon={<Lightbulb size={18} />}
                                label="Ideation"
                                step="01"
                                isActive={currentStage === 'INIT' || pathname === '/ideas'}
                                color="amber"
                                badge={currentStage === 'INIT' ? 'Active' : null}
                            />
                            <NavLink
                                href="/research"
                                icon={<Search size={18} />}
                                label="Validation"
                                step="02"
                                isActive={currentStage === 'RESEARCH' || pathname === '/research'}
                                color="blue"
                                badge={currentStage === 'RESEARCH' ? 'Active' : null}
                            />
                            <NavLink
                                href="/builder"
                                icon={<Code size={18} />}
                                label="Blueprint"
                                step="03"
                                isActive={(currentStage === 'BUSINESS_PLAN' || currentStage === 'PRD') || pathname === '/builder'}
                                color="indigo"
                                badge={(currentStage === 'BUSINESS_PLAN' || currentStage === 'PRD') ? 'Active' : null}
                            />
                            <NavLink
                                href="/mvp"
                                icon={<Layers size={18} />}
                                label="Build"
                                step="04"
                                isActive={currentStage === 'MVP_BUILD' || pathname === '/mvp'}
                                color="purple"
                                badge={currentStage === 'MVP_BUILD' ? 'Active' : null}
                            />
                            <NavLink
                                href="/deploy"
                                icon={<Rocket size={18} />}
                                label="Launch"
                                step="05"
                                isActive={(currentStage === 'COMPLETED' || currentStage === 'DEPLOY') || pathname === '/deploy'}
                                color="emerald"
                                badge={(currentStage === 'COMPLETED' || currentStage === 'DEPLOY') ? 'Active' : null}
                            />
                            <NavLink
                                href="/monitor"
                                icon={<Activity size={18} />}
                                label="Observability"
                                step="06"
                                isActive={pathname === '/monitor'}
                                color="blue"
                                badge={null}
                            />
                        </div>
                    </div>
                </section>

                {/* Settings Section */}
                <section className="space-y-1.5 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between px-4 mb-3 mt-4">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em]">Settings</span>
                    </div>
                    <NavLink
                        href="/resources"
                        icon={<Library size={18} />}
                        label="Resources"
                        isActive={pathname === '/resources'}
                    />
                    <NavLink
                        href="/settings"
                        icon={<Lock size={18} />}
                        label="System Preference"
                        isActive={pathname === '/settings'}
                    />
                </section>
            </nav>

            {/* Premium Footer Status Panel */}
            <div className="p-4 pt-2 border-t border-white/5">
                <div className="glass-card rounded-xl p-4 overflow-hidden relative group cursor-pointer">
                    {/* Gradient Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-2">
                                <span>System Integrity</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
                            </span>
                            <div className="text-[9px] font-mono font-semibold text-emerald-400/70">ONLINE</div>
                        </div>

                        {/* Enhanced Progress Bar */}
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative mb-3">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full" />
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 relative overflow-hidden"
                                style={{ width: '98.2%' }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-[9px] font-mono font-semibold">
                            <span className="text-zinc-600">NODE: us-east-1</span>
                            <span className="text-zinc-500 px-2 py-0.5">v1.2.4-stable</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Enhanced NavLink Component
interface NavLinkProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    step?: string;
    isActive?: boolean;
    color?: 'amber' | 'blue' | 'indigo' | 'purple' | 'emerald';
    badge?: string | null;
}

const NavLink: React.FC<NavLinkProps> = ({ href, icon, label, step, isActive = false, color = 'blue', badge }) => {
    const colorConfig: Record<string, { text: string; bg: string; border: string; glow: string }> = {
        amber: {
            text: 'text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/30',
            glow: 'shadow-amber-500/20'
        },
        blue: {
            text: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/30',
            glow: 'shadow-blue-500/20'
        },
        indigo: {
            text: 'text-indigo-400',
            bg: 'bg-indigo-500/10',
            border: 'border-indigo-500/30',
            glow: 'shadow-indigo-500/20'
        },
        purple: {
            text: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/30',
            glow: 'shadow-purple-500/20'
        },
        emerald: {
            text: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/30',
            glow: 'shadow-emerald-500/20'
        }
    };

    const colors = colorConfig[color] || colorConfig.blue;

    return (
        <Link
            href={href}
            className={`relative flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 group ${isActive
                ? `${colors.bg} ${colors.border} border text-white shadow-lg ${colors.glow}`
                : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
        >
            <div className="flex items-center space-x-3 flex-1">
                {/* Step Number with Line Connector */}
                {step && (
                    <div className={`relative flex items-center justify-center min-w-[20px] ${isActive ? colors.text : 'text-zinc-600 group-hover:text-zinc-400'
                        }`}>
                        <span className="text-[10px] font-bold font-mono relative z-10">{step}</span>
                        {isActive && (
                            <div className={`absolute inset-0 ${colors.bg} rounded-full blur-sm`} />
                        )}
                    </div>
                )}

                {/* Icon */}
                <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                    {React.cloneElement(icon as React.ReactElement, {
                        className: isActive ? colors.text : 'text-zinc-500 group-hover:text-zinc-300',
                        strokeWidth: isActive ? 2.5 : 2
                    } as any)}
                </div>

                {/* Label */}
                <span className={`text-sm font-medium transition-colors ${isActive ? 'font-semibold' : 'font-medium'
                    }`}>
                    {label}
                </span>
            </div>

            {/* Active Indicator & Badge */}
            <div className="flex items-center space-x-2">
                {badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? `${colors.bg} ${colors.text} border ${colors.border}` : 'bg-zinc-800 text-zinc-500'
                        } border uppercase tracking-wider`}>
                        {badge}
                    </span>
                )}
                {isActive && (
                    <div className={`w-2 h-2 rounded-full ${colors.bg.replace('/10', '')} animate-pulse shadow-lg ${colors.glow.replace('shadow-', 'shadow-')}`} />
                )}
            </div>
        </Link>
    );
};

// Helper function to calculate pipeline progress
function getPipelineProgress(stage: string): number {
    const stages = ['INIT', 'RESEARCH', 'BUSINESS_PLAN', 'PRD', 'MVP_BUILD', 'DEPLOY', 'COMPLETED'];
    const index = stages.indexOf(stage);
    if (index === -1) return 0;
    return ((index + 1) / stages.length) * 100;
}

export default Sidebar;
