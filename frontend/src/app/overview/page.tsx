"use client";

import React, { useEffect, useState } from 'react';
// New Components
import SystemPulseHero from '@/components/overview/SystemPulseHero';
import DeploymentsSummary from '@/components/overview/DeploymentsSummary';
import SmartActions from '@/components/overview/SmartActions';
import { BudgetCard } from '@/components/overview/StatsRow';

import { Plus, Sparkles, Zap, TrendingUp, Activity, Terminal } from 'lucide-react';
import { useDashboardStore } from '@/store/useDashboardStore';
import { useRunStore } from '@/store/useRunStore';
import { Deployment } from '@/types/deploy';
import Link from 'next/link';

export default function Overview() {
    const run = useRunStore();
    const dashboard = useDashboardStore();
    const [localDeployments, setLocalDeployments] = useState<Deployment[]>([]);

    useEffect(() => {
        // Fetch real dashboard data
        dashboard.fetchDashboardData();

        // Start Monitoring for Pulse
        if (run.deployment_id) {
            run.startMonitoring(run.deployment_id);
        }

        // We still use local state for the "DeploymentsSummary" prop for now
        // to avoid breaking the component interface immediately, 
        // but we'll feed it from the store soon.
    }, [run.deployment_id]); // Only re-run if deployment_id changes

    // Update local deployments when activity feed changes
    useEffect(() => {
        if (dashboard.activity_feed) {
            // Map activity logs to deployment-like objects if needed, 
            // or just use them for the summary.
            // For now, we'll assume the back-end returns real deployments 
            // once we wire up the full history.
        }
    }, [dashboard.activity_feed]);

    return (
        <div className="space-y-8 pb-10 animate-fade-in">
            {/* Premium Dashboard Header */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-4 relative">
                {/* Gradient Accent Line */}
                <div className="absolute -top-2 left-0 w-24 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-sm opacity-50" />

                <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                            <Sparkles size={12} className="text-indigo-400" />
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Executive Intelligence</span>
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight mb-2">
                        <span className="gradient-text">Command Center</span>
                    </h1>
                    <p className="text-sm text-zinc-400 font-medium flex items-center space-x-2">
                        <Activity size={14} className="text-indigo-400" />
                        <span>Autonomous orchestration and portfolio health monitoring</span>
                    </p>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex items-center space-x-3">
                    <Link href="/monitor" className="group flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-xs font-bold text-white backdrop-blur-sm">
                        <Terminal size={16} className="text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                        <span>System Status</span>
                    </Link>
                    <Link href="/deploy" className="group relative flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border border-transparent hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 px-6 py-2.5 rounded-xl text-xs font-bold overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <Zap size={16} className="relative z-10" />
                        <span className="relative z-10">Deploy Project</span>
                    </Link>
                </div>
            </header>

            {/* Enhanced Grid Layout */}
            <div className="grid grid-cols-12 gap-6">
                {/* Left Core Column */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    {/* Main Hero: System Pulse */}
                    <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <SystemPulseHero />
                    </div>

                    {/* Secondary: Deployments Summary */}
                    <div className="h-64 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <DeploymentsSummary />
                    </div>
                </div>

                {/* Right Intelligence Column */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    {/* Smart Actions */}
                    <div className="h-[400px] animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <SmartActions />
                    </div>

                    {/* Capital Efficiency (Keeping this as it fits the 'Executive' theme) */}
                    <div className="h-60 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <BudgetCard />
                    </div>
                </div>
            </div>

            {/* Quick Stats Bar */}
            <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-white/5 transition-opacity duration-500 ${dashboard.isLoading ? 'opacity-50' : 'opacity-100'}`}>
                <QuickStat
                    label="Active Projects"
                    value={dashboard.stats?.active_projects.toString() || "0"}
                    change="+3"
                    icon={<TrendingUp size={16} />}
                    color="emerald"
                />
                <QuickStat
                    label="Success Rate"
                    value={dashboard.stats?.success_rate || "100%"}
                    change="+2.1%"
                    icon={<Activity size={16} />}
                    color="blue"
                />
                <QuickStat
                    label="AI Efficiency"
                    value={dashboard.stats?.ai_efficiency || "0%"}
                    change="+5.3%"
                    icon={<Sparkles size={16} />}
                    color="purple"
                />
                <QuickStat
                    label="Avg. Build Time"
                    value={dashboard.stats?.avg_build_time || "0s"}
                    change="-45s"
                    icon={<Zap size={16} />}
                    color="amber"
                />
            </div>
        </div>
    );
}

// Quick Stat Component
interface QuickStatProps {
    label: string;
    value: string;
    change: string;
    icon: React.ReactNode;
    color: 'emerald' | 'blue' | 'purple' | 'amber';
}

function QuickStat({ label, value, change, icon, color }: QuickStatProps) {
    const colorClasses = {
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    };

    return (
        <div className="glass-card rounded-xl p-4 hover:scale-[1.02] transition-transform duration-300 cursor-pointer group">
            <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-lg ${colorClasses[color]} border group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colorClasses[color]} border`}>
                    {change}
                </span>
            </div>
            <div className="space-y-1">
                <p className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-zinc-400 transition-all duration-300">
                    {value}
                </p>
                <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">{label}</p>
            </div>
        </div>
    );
}
