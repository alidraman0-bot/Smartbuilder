"use client";

import React from 'react';
import { useFounderStore } from '@/store/useFounderStore';
import { AlertCircle, FileSearch, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

export default function FailureIntelligence() {
    const { failures } = useFounderStore();

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                <FileSearch className="w-3 h-3" /> Failure Intelligence Engine
            </div>

            <div className="grid grid-cols-1 gap-4">
                {failures.map((fail, i) => (
                    <div key={i} className="border border-gray-200 bg-white p-5 flex items-start justify-between group hover:border-black transition-colors">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className={clsx(
                                    "px-2 py-0.5 text-[10px] font-black uppercase tracking-widest",
                                    fail.impact === 'Critical' ? "bg-red-600 text-white" :
                                        fail.impact === 'High' ? "bg-black text-white" : "bg-gray-100 text-gray-600"
                                )}>
                                    {fail.impact} Impact
                                </div>
                                <h4 className="text-sm font-bold text-black uppercase tracking-tight">{fail.category}</h4>
                                <span className="text-[10px] font-mono text-gray-400">Occurrences: {fail.count}</span>
                            </div>

                            <div className="space-y-1">
                                <div className="text-[10px] font-bold uppercase text-gray-400 tracking-tighter">Primary Root Cause</div>
                                <p className="text-xs text-gray-600 font-medium italic">"{fail.root_cause}"</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                            <div className="text-right">
                                <div className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Fix Effectiveness</div>
                                <div className="text-lg font-black text-black leading-none">{fail.fix_effectiveness}</div>
                            </div>
                            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black/40 group-hover:text-black transition-colors">
                                View Sample <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
