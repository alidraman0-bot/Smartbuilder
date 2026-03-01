"use client";

import React from 'react';

interface FactorBarProps {
    label: string;
    score: number; // 1 to 10
    color: string;
}

export default function FactorBar({ label, score, color }: FactorBarProps) {
    const percentage = (score / 10) * 100;

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">{label}</span>
                <span className="text-sm font-black text-white">{score.toFixed(1)}<span className="text-[10px] text-gray-600 font-medium">/10</span></span>
            </div>

            <div className="h-2 w-full bg-[#18181b] border border-[#27272a] rounded-full overflow-hidden relative">
                <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                        width: `${percentage}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 10px ${color}40`
                    }}
                />
            </div>
        </div>
    );
}
