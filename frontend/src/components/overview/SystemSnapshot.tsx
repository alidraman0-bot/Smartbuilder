"use client";

import React from 'react';
import { Activity, Shield, Clock, Cpu } from 'lucide-react';

interface SystemSnapshotProps {
    health: string;
    confidence: number;
    stage: string;
    elapsed: string;
}

export default function SystemSnapshot({ health, confidence, stage, elapsed }: SystemSnapshotProps) {
    return (
        <div className="grid grid-cols-2 gap-px bg-[#27272a] border border-[#27272a] rounded-md overflow-hidden h-full">
            {/* Health */}
            <div className="bg-[#18181b] p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-[#52525b] uppercase tracking-wider">System Health</span>
                    <Activity size={14} className={health === 'NOMINAL' ? 'text-[#10b981]' : 'text-[#ef4444]'} />
                </div>
                <div className="mt-2 text-xl font-mono font-bold text-white">
                    {health || 'OFFLINE'}
                </div>
            </div>

            {/* Confidence */}
            <div className="bg-[#18181b] p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-[#52525b] uppercase tracking-wider">Confidence</span>
                    <Shield size={14} className="text-blue-500" />
                </div>
                <div className="mt-2 text-xl font-mono font-bold text-white">
                    {confidence}%
                </div>
            </div>

            {/* Stage */}
            <div className="bg-[#18181b] p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-[#52525b] uppercase tracking-wider">Active Process</span>
                    <Cpu size={14} className="text-[#f59e0b]" />
                </div>
                <div className="mt-2 text-sm font-mono font-bold text-[#f4f4f5] break-words">
                    {stage}
                </div>
            </div>

            {/* Duration */}
            <div className="bg-[#18181b] p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-[#52525b] uppercase tracking-wider">Runtime</span>
                    <Clock size={14} className="text-[#a1a1aa]" />
                </div>
                <div className="mt-2 text-xl font-mono font-bold text-[#f4f4f5]">
                    {elapsed || '00:00:00'}
                </div>
            </div>
        </div>
    );
}
