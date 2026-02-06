"use client";

import React from 'react';
import { AlertCircle, ArrowRight, Check, Code, FileText, Split, Zap } from 'lucide-react';
import clsx from 'clsx';

interface ConflictResolverProps {
    isOpen: boolean;
    fileName: string;
    humanChanges: string;
    aiAttempt: string;
    onResolve: (mode: 'adapt' | 'skip' | 'overwrite') => void;
    onClose: () => void;
}

export default function ConflictResolver({ isOpen, fileName, humanChanges, aiAttempt, onResolve, onClose }: ConflictResolverProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-12 bg-black/60 backdrop-blur-md selection:bg-blue-500 selection:text-white">
            <div className="max-w-5xl w-full bg-white border border-black shadow-[32px_32px_0px_rgba(0,0,0,0.2)] flex flex-col h-[85vh]">
                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3 text-black">
                            <Split className="w-6 h-6" />
                            <h2 className="text-xl font-black uppercase tracking-tighter">System Conflict Detected</h2>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">
                            Manual changes detected in <span className="font-mono text-black">{fileName}</span>. AI generation paused to prevent data loss.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 transition-colors">
                        <Check className="w-5 h-5" />
                    </button>
                </div>

                {/* Diff View Area */}
                <div className="flex-1 overflow-hidden grid grid-cols-2 divide-x divide-gray-100">
                    <div className="flex flex-col h-full">
                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Human Version (Local/Git)</span>
                        </div>
                        <pre className="flex-1 p-6 overflow-auto font-mono text-xs leading-relaxed text-gray-600 bg-white">
                            {humanChanges}
                        </pre>
                    </div>
                    <div className="flex flex-col h-full bg-gray-50/20">
                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                            <Zap className="w-3 h-3 text-amber-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">AI Proposed Logic</span>
                        </div>
                        <pre className="flex-1 p-6 overflow-auto font-mono text-xs leading-relaxed text-blue-600 bg-blue-50/30">
                            {aiAttempt}
                        </pre>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-8 border-t border-gray-100 bg-white grid grid-cols-3 gap-6">
                    <ResolutionCard
                        title="Adapt to Human"
                        desc="Smartbuilder will rewrite its proposal to include and respect your manual changes."
                        icon={<Zap className="w-4 h-4" />}
                        onClick={() => onResolve('adapt')}
                        primary
                    />
                    <ResolutionCard
                        title="Skip This File"
                        desc="Discard AI changes for this file only. Your manual code remains untouched."
                        icon={<FileText className="w-4 h-4" />}
                        onClick={() => onResolve('skip')}
                    />
                    <ResolutionCard
                        title="Force Overwrite"
                        desc="Discard manual changes and apply AI version. (Caution: Irreversible)"
                        icon={<Split className="w-4 h-4" />}
                        onClick={() => onResolve('overwrite')}
                        danger
                    />
                </div>
            </div>
        </div>
    );
}

function ResolutionCard({ title, desc, icon, onClick, primary = false, danger = false }: { title: string, desc: string, icon: any, onClick: () => void, primary?: boolean, danger?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "p-5 border text-left flex flex-col justify-between transition-all group",
                primary ? "bg-black text-white border-black" :
                    danger ? "bg-white border-red-100 hover:border-red-600" :
                        "bg-white border-gray-200 hover:border-black"
            )}
        >
            <div className="space-y-2">
                <div className={clsx(
                    "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                    primary ? "text-blue-400" : danger ? "text-red-600" : "text-gray-400 group-hover:text-black"
                )}>
                    {icon} {title}
                </div>
                <p className={clsx(
                    "text-[11px] leading-relaxed",
                    primary ? "text-gray-400" : "text-gray-500"
                )}>{desc}</p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Select Option <ArrowRight className="w-3 h-3" />
            </div>
        </button>
    );
}
