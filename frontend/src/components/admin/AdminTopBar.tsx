"use client";

import React from 'react';
import Link from 'next/link';
import { Shield, RefreshCw, Eye, EyeOff, Home, ChevronRight } from 'lucide-react';

interface AdminTopBarProps {
    lastRefresh: Date;
    onRefresh: () => void;
    investorMode: boolean;
    onToggleInvestorMode: () => void;
}

export default function AdminTopBar({ lastRefresh, onRefresh, investorMode, onToggleInvestorMode }: AdminTopBarProps) {
    const timeStr = lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return (
        <header className="sticky top-0 z-50 border-b border-white/8" style={{ background: 'rgba(5,5,10,0.92)', backdropFilter: 'blur(24px)' }}>
            <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
                {/* Left: Brand + Breadcrumb */}
                <div className="flex items-center space-x-4">
                    <Link href="/overview" className="flex items-center space-x-2.5 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                            <span className="text-white font-black text-sm">S</span>
                        </div>
                        <span className="text-white font-bold text-sm tracking-tight">Smartbuilder</span>
                    </Link>

                    <div className="flex items-center space-x-1 text-zinc-600">
                        <ChevronRight size={14} />
                    </div>

                    <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5">
                        <Shield size={13} className="text-red-400" />
                        <span className="text-xs font-bold text-red-400 uppercase tracking-[0.15em]">Admin Control Plane</span>
                    </div>
                </div>

                {/* Center: CEO Identity */}
                <div className="hidden md:flex flex-col items-center">
                    <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-600">Founder & CEO Access</span>
                    <span className="text-xs font-semibold text-zinc-400 mt-0.5">Internal dashboard — authorized personnel only</span>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-3">
                    {/* Last refresh */}
                    <span className="hidden sm:block text-[10px] font-mono text-zinc-600">
                        Synced {timeStr}
                    </span>

                    {/* Investor Mode Toggle */}
                    <button
                        onClick={onToggleInvestorMode}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all duration-300 ${investorMode
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'border-white/10 text-zinc-500 hover:text-zinc-300 hover:border-white/20'
                            }`}
                        title="Toggle Investor Mode (hides sensitive numbers)"
                    >
                        {investorMode ? <EyeOff size={13} /> : <Eye size={13} />}
                        <span className="hidden sm:inline">{investorMode ? 'Investor Mode' : 'Investor Mode'}</span>
                    </button>

                    {/* Refresh */}
                    <button
                        onClick={onRefresh}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-zinc-500 hover:text-white hover:border-white/20 transition-all duration-300 hover:bg-white/5"
                    >
                        <RefreshCw size={13} />
                    </button>

                    {/* Back to App */}
                    <Link
                        href="/overview"
                        className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 text-xs font-medium text-zinc-400 hover:text-white transition-all duration-300"
                    >
                        <Home size={13} />
                        <span className="hidden sm:inline">Exit Admin</span>
                    </Link>
                </div>
            </div>
        </header>
    );
}
