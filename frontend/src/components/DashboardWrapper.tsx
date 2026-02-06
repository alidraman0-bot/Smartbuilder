"use client";

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useRunStore } from '@/store/useRunStore';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function DashboardWrapper({ children }: { children: React.ReactNode }) {
    const startPolling = useRunStore((state) => state.startPolling);
    const runState = useRunStore((state) => state.state);
    const pathname = usePathname();
    const isLandingPage = pathname === '/' || pathname === '/product' || pathname === '/how-it-works' || pathname === '/pricing' || pathname === '/resources' || pathname === '/login' || pathname === '/signup';

    useEffect(() => {
        if (!isLandingPage) {
            startPolling();
        }
    }, [startPolling, isLandingPage]);

    if (isLandingPage) {
        return (
            <div className="min-h-screen w-full bg-black text-white relative selection:bg-indigo-500/30">
                {/* Premium Noise Overlay */}
                <div className="noise-overlay" />

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
        </div>
    );
}

