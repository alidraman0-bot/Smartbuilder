"use client";

import React from 'react';
import { useFounderStore } from '@/store/useFounderStore';
import { Shield, ShieldAlert, User, Cpu } from 'lucide-react';
import clsx from 'clsx';

export default function FounderHqBar() {
    const { systemStatus, emergencyMode, investorMode, toggleInvestorMode } = useFounderStore();

    return (
        <header className="sticky top-0 z-[100] bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between font-sans selection:bg-black selection:text-white">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-black flex items-center justify-center">
                        <Cpu className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold tracking-tighter text-lg uppercase">Smartbuilder HQ</span>
                </div>

                <div className="h-4 w-[1px] bg-gray-200" />

                <div className="flex items-center gap-4">
                    <select className="text-[10px] font-bold uppercase tracking-wider bg-gray-50 border border-gray-200 px-2 py-1 focus:outline-none focus:ring-0">
                        <option>Production</option>
                        <option>Staging</option>
                        <option>Internal</option>
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                    <div className={clsx(
                        "w-2 h-2 rounded-full",
                        systemStatus === 'operational' ? "bg-emerald-500" :
                            systemStatus === 'degraded' ? "bg-amber-500" : "bg-red-500"
                    )} />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                        System: {systemStatus.replace('_', ' ')}
                    </span>
                </div>

                <div className="h-4 w-[1px] bg-gray-200" />

                <div className="flex items-center gap-6">
                    <button
                        onClick={toggleInvestorMode}
                        className={clsx(
                            "text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 border transition-colors",
                            investorMode ? "bg-black text-white border-black" : "bg-white text-gray-400 border-gray-200 hover:border-gray-400"
                        )}
                    >
                        {investorMode ? "Investor Mode Active" : "Investor Mode"}
                    </button>

                    <div className="flex items-center gap-2 text-gray-400">
                        {emergencyMode ? (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-2 py-1">
                                <ShieldAlert className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase">Unlocked</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-2 py-1">
                                <Shield className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase">Locked</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-black uppercase tracking-tight">Founder</span>
                        <div className="w-8 h-8 bg-gray-100 flex items-center justify-center border border-gray-200">
                            <User className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
