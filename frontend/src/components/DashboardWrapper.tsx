"use client";

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useRunStore } from '@/store/useRunStore';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import AICoFounderPanel from './builder/AICoFounderPanel';
import { X } from 'lucide-react';

export default function DashboardWrapper({ children }: { children: React.ReactNode }) {
    const startPolling = useRunStore((state) => state.startPolling);
    const runState = useRunStore((state) => state.state);
    const isAiCofounderOpen = useRunStore((state) => state.isAiCofounderOpen);
    const toggleAiCofounder = useRunStore((state) => state.toggleAiCofounder);
    const runId = useRunStore((state) => state.runId);

    const pathname = usePathname();
    const isLandingPage = ['/', '/product', '/how-it-works', '/pricing', '/resources', '/login', '/signup', '/mvp'].some(p =>
        p === '/' ? pathname === '/' : pathname === p || pathname?.startsWith(p + '/')
    );

    useEffect(() => {
        if (!isLandingPage) {
            startPolling();
        }
    }, [startPolling, isLandingPage]);

    if (isLandingPage) {
        return (
            <div className="min-h-screen w-full bg-black text-white relative selection:bg-indigo-500/30">
                {/* Content */}
                <main className="relative z-10 w-full">
                    {children}
                </main>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-black text-white overflow-hidden relative">
            {/* Performance Optimized Background */}

            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                     linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '64px 64px'
            }} />

            {/* Left Sidebar */}
            <div className="w-72 glass-panel shrink-0 z-10 border-r border-white/5">
                <Sidebar currentStage={runState === "INIT" ? "IDEA" : runState} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 z-10 relative">
                {/* Premium Top Bar */}
                <header className="h-16 border-b border-white/8 bg-black/40 backdrop-blur-xl shrink-0 sticky top-0 z-20">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
                    <TopBar />
                </header>

                {/* Main Viewport with Enhanced Padding */}
                <main className="flex-1 overflow-y-auto p-10 bg-transparent scroll-smooth relative">
                    <div className="max-w-[1600px] mx-auto h-full animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>

            {/* Global AI Co-Founder Side Panel */}
            <div className={`fixed inset-y-0 right-0 w-[400px] z-50 transition-transform duration-500 ease-in-out transform shadow-2xl ${isAiCofounderOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Close Button overlay */}
                <button
                    onClick={() => toggleAiCofounder(false)}
                    className="absolute -left-12 top-6 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 text-white hover:bg-white/10 transition-all"
                >
                    <X size={20} />
                </button>
                <AICoFounderPanel projectId={runId} />
            </div>

            {/* Backdrop for mobile or global focus */}
            {isAiCofounderOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => toggleAiCofounder(false)}
                />
            )}
        </div>
    );
}
