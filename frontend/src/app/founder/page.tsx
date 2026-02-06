"use client";

import React, { useEffect, useState } from 'react';
import { useFounderStore } from '@/store/useFounderStore';
import FounderHqBar from '@/components/founder/FounderHqBar';
import ExecutiveSnapshot from '@/components/founder/ExecutiveSnapshot';
import SystemAiControl from '@/components/founder/SystemAiControl';
import FailureIntelligence from '@/components/founder/FailureIntelligence';
import BuildPipelineView from '@/components/founder/BuildPipelineView';
import RevenueGrowthRisk from '@/components/founder/RevenueGrowthRisk';
import VcsCodeHealth from '@/components/founder/VcsCodeHealth';
import EmergencyModeModal from '@/components/founder/EmergencyModeModal';
import { ShieldAlert, Info } from 'lucide-react';

export default function FounderDashboard() {
    const { fetchAll, isLoading, emergencyMode } = useFounderStore();
    const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

    useEffect(() => {
        fetchAll();
        const interval = setInterval(fetchAll, 10000); // 10s refresh for live signals
        return () => clearInterval(interval);
    }, [fetchAll]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-black selection:bg-black selection:text-white">
            <FounderHqBar />

            <main className="flex-1 p-8 space-y-12 max-w-[1600px] mx-auto w-full animate-in fade-in duration-700">
                {/* 1. EXECUTIVE HEALTH SNAPSHOT */}
                <section className="space-y-4">
                    <ExecutiveSnapshot />
                </section>

                <div className="grid grid-cols-12 gap-12">
                    {/* LEFT COLUMN: SYSTEM & AI CONTROL */}
                    <div className="col-span-12 lg:col-span-12 space-y-12">
                        <SystemAiControl />
                        <VcsCodeHealth />
                    </div>

                    {/* MIDDLE COLUMN: PRODUCT & TRUST */}
                    <div className="col-span-12 lg:col-span-8 space-y-12">
                        <BuildPipelineView />
                        <FailureIntelligence />
                    </div>

                    {/* RIGHT COLUMN: REVENUE & RISK */}
                    <div className="col-span-12 lg:col-span-12 pt-8 border-t border-gray-200">
                        <RevenueGrowthRisk />
                    </div>
                </div>

                {/* FOOTER CONTROLS */}
                <footer className="pt-12 border-t border-gray-200 flex items-center justify-between pb-12">
                    <div className="flex items-center gap-2 text-gray-400">
                        <Info className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                            Internal Company Control Plane — Authorized Access Only
                        </span>
                    </div>

                    <button
                        onClick={() => setIsEmergencyOpen(true)}
                        className="flex items-center gap-3 px-6 py-3 bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white transition-all group"
                    >
                        <ShieldAlert className="w-4 h-4 group-hover:animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Emergency Override</span>
                    </button>
                </footer>
            </main>

            {/* EMERGENCY MODAL */}
            <EmergencyModeModal
                isOpen={isEmergencyOpen}
                onClose={() => setIsEmergencyOpen(false)}
            />

            {/* GLOBAL EMERGENCY OVERLAY */}
            {emergencyMode && (
                <div className="fixed inset-0 pointer-events-none border-[12px] border-red-600/20 z-[300] animate-pulse" />
            )}
        </div>
    );
}
