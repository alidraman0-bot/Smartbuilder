/**
 * S4: Left Orchestrator
 * 
 * - Prompt Composer (Input)
 * - Execution Timeline (Trust Artifact)
 */

"use client";

import React, { useState } from 'react';
import { Send, Sparkles, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useMvpBuilderStore } from '@/store/useMvpBuilderStore';

export default function LeftOrchestrator() {
    const {
        executionTimeline, iterate, isLoading, uiState,
        buildMode, autoFixAttempts
    } = useMvpBuilderStore();

    const [prompt, setPrompt] = useState('');

    const isFrozen = uiState === 'S6';
    const isRecovering = uiState === 'S5';
    const isStable = uiState === 'S4';

    const handleSubmit = async () => {
        if (!prompt.trim() || isLoading || isFrozen) return;

        try {
            const currentPrompt = prompt;
            setPrompt(''); // Clear immediate
            await iterate(currentPrompt);
        } catch (error) {
            console.error('Iteration failed:', error);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="w-[320px] flex flex-col border-r border-[#27272a] bg-[#0a0a0f] h-full">

            {/* Prompt Composer (Hidden in S6 Frozen) */}
            {!isFrozen && (
                <div className="p-4 border-b border-[#27272a] bg-[#0f0f12]">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 flex justify-between">
                        <span>Orchestrator</span>
                        <span className="text-indigo-400">{buildMode} Mode</span>
                    </div>

                    <div className="relative">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={!isStable}
                            placeholder={
                                isRecovering ? "Auto-fix in progress..." :
                                    isLoading ? "Executing..." :
                                        `Describe ${buildMode.toLowerCase()} changes...`
                            }
                            className="w-full h-24 bg-[#18181b] border border-[#27272a] rounded-lg p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={!prompt.trim() || !isStable || isLoading}
                            className="absolute bottom-2 right-2 p-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md disabled:opacity-0 transition-opacity"
                        >
                            <Send size={12} />
                        </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-600">
                        <span>Shift+Enter for newline</span>
                        {isLoading && <Loader />}
                    </div>
                </div>
            )}

            {/* Execution Timeline (Trust Artifact) */}
            <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0f]">
                <div className="px-4 py-2 border-b border-[#27272a] bg-[#0f0f12]/50 flex items-center space-x-2">
                    <Clock size={12} className="text-zinc-500" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        System Timeline
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
                    {/* Reverse order to show newest first? Or standard log? Standard top-down usually better for timelines */}
                    {executionTimeline.length === 0 && (
                        <div className="text-center py-8 text-zinc-700 text-xs">
                            No activity recorded
                        </div>
                    )}

                    {executionTimeline.map((event, idx) => (
                        <div key={idx} className="flex gap-3 group">
                            <div className="flex flex-col items-center">
                                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${event.type === 'success' ? 'bg-emerald-500' :
                                    event.type === 'error' ? 'bg-red-500' :
                                        event.type === 'warning' ? 'bg-amber-500' :
                                            'bg-indigo-500'
                                    }`} />
                                {idx !== executionTimeline.length - 1 && (
                                    <div className="w-px h-full bg-[#27272a] my-0.5 group-hover:bg-[#3f3f46] transition-colors" />
                                )}
                            </div>
                            <div className="pb-1">
                                <div className="flex items-baseline space-x-2 mb-0.5">
                                    <span className="text-[10px] font-mono text-zinc-500">
                                        {event.timestamp}
                                    </span>
                                </div>
                                <p className={`text-[11px] leading-relaxed ${event.type === 'error' ? 'text-red-400' :
                                    'text-zinc-400'
                                    }`}>
                                    {event.message}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Auto-Fix Status (if active) */}
            {autoFixAttempts > 0 && (
                <div className="p-3 bg-amber-500/10 border-t border-amber-500/20">
                    <div className="flex items-center space-x-2 text-amber-500 mb-1">
                        <AlertCircle size={14} />
                        <span className="text-xs font-bold">Stability Check</span>
                    </div>
                    <p className="text-[10px] text-amber-200/70">
                        Auto-fix attempt {autoFixAttempts}/3 in progress.
                    </p>
                </div>
            )}
        </div>
    );
}

const Loader = () => (
    <div className="flex items-center space-x-1.5 text-indigo-400">
        <Sparkles size={10} className="animate-spin" />
        <span>Processing</span>
    </div>
);
