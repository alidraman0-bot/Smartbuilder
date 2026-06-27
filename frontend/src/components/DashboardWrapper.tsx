"use client";

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useRunStore } from '@/store/useRunStore';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import AICoFounderPanel from './builder/AICoFounderPanel';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DashboardWrapper({ children }: { children: React.ReactNode }) {
    const startPolling = useRunStore((state) => state.startPolling);
    const runState = useRunStore((state) => state.state);
    const isAiCofounderOpen = useRunStore((state) => state.isAiCofounderOpen);
    const toggleAiCofounder = useRunStore((state) => state.toggleAiCofounder);
    const runId = useRunStore((state) => state.runId);

    const pathname = usePathname();
    const isLandingPage = ['/', '/product', '/how-it-works', '/pricing', '/resources', '/login', '/signup', '/mvp', '/mock-preview'].some(p =>
        p === '/' ? pathname === '/' : pathname === p || pathname?.startsWith(p + '/')
    );
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
    const [isMounted, setIsMounted] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (!isLandingPage) {
            return startPolling();
        }
    }, [startPolling, isLandingPage]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    if (isMounted && isMobile) {
        return (
            <div className="h-screen w-full bg-[#06060a] flex items-center justify-center p-6 text-white overflow-hidden relative">
                {/* Ambient Background Glows */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full z-0" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full z-0" />
                <div className="noise-overlay opacity-[0.03] absolute inset-0 pointer-events-none z-0" />

                <div className="text-center z-10 max-w-sm px-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/5">
                        <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Desktop Workspace Required</h2>
                    <p className="text-[#8a8a9a] text-sm leading-relaxed mb-8">
                        Smartbuilder is a powerful development environment optimized for building software.
                        To use the dashboard, monitor systems, and build your applications, please log in from a <strong>laptop or desktop computer</strong>.
                    </p>
                    <a 
                        href="/" 
                        className="inline-flex items-center justify-center px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold text-white transition-all"
                    >
                        Return to Homepage
                    </a>
                </div>
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
            <div className={`${isSidebarCollapsed ? 'w-20' : 'w-72'} transition-all duration-300 glass-panel shrink-0 z-10 border-r border-white/5 relative group`}>
                <Sidebar 
                    currentStage={runState === "INIT" ? "IDEA" : runState} 
                    isCollapsed={isSidebarCollapsed} 
                    onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 z-10 relative">
                {/* Premium Top Bar */}
                {pathname !== '/deploy' && (
                    <header className="h-16 border-b border-white/8 bg-black/40 backdrop-blur-xl shrink-0 sticky top-0 z-20">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
                        <TopBar />
                    </header>
                )}

                {/* Main Viewport with Enhanced Padding */}
                <main className={`flex-1 overflow-y-auto ${pathname === '/deploy' ? 'p-0' : 'p-10'} bg-transparent scroll-smooth relative`}>
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
                {runId && runId !== "CONNECTING..." && (
                    <AICoFounderPanel projectId={runId} />
                )}
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
