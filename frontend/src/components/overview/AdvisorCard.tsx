"use client";

import React from 'react';
import { Bot, Maximize2, Send, Paperclip, Sparkles } from 'lucide-react';
import { useRunStore } from '@/store/useRunStore';

export default function AdvisorCard() {
    const { advisor } = useRunStore();

    return (
        <div className="glass-card rounded-2xl p-6 flex flex-col h-full relative overflow-hidden group">
            {/* Gradient Accent */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50" />
            
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 p-2.5 rounded-xl border border-indigo-500/30 scale-90 group-hover:scale-100 transition-transform duration-300 shadow-lg shadow-indigo-500/20">
                            <Bot size={20} className="text-indigo-400" strokeWidth={2.5} />
                        </div>
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-black animate-pulse shadow-lg shadow-emerald-400/50" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-base tracking-tight">Strategic Advisor</h3>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-wider mt-0.5">AI Intelligence</p>
                    </div>
                </div>
                <div className="flex space-x-2 items-center">
                    <button className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-300 hover:scale-110">
                        <Maximize2 size={14} />
                    </button>
                    <div className="w-2 h-2 rounded-full bg-indigo-400 glow-primary animate-pulse shadow-lg shadow-indigo-400/50" />
                </div>
            </div>

            <div className="flex-1 flex flex-col space-y-4">
                {/* User Prompt */}
                <div className="self-end max-w-[85%] bg-white/5 border border-white/10 rounded-2xl rounded-tr-none p-4 text-xs text-zinc-300 leading-relaxed backdrop-blur-sm hover:bg-white/8 transition-all duration-300">
                    <div className="flex items-center space-x-2 mb-1.5">
                        <div className="w-2 h-2 rounded-full bg-white/20" />
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Your Query</span>
                    </div>
                    Evaluate market entry risks for EU region in Q3.
                </div>

                {/* AI Response */}
                <div className="self-start max-w-[90%] bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl rounded-tl-none p-4 border border-indigo-500/20 relative backdrop-blur-sm hover:border-indigo-500/30 transition-all duration-300">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50 rounded-t-2xl" />
                    <div className="flex items-center space-x-2 mb-2.5">
                        <Sparkles size={12} className="text-indigo-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{advisor.analysis.toUpperCase()}</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/20 to-transparent ml-2" />
                    </div>
                    <p className="text-[11px] text-white leading-relaxed font-medium">
                        {advisor.suggestion}
                    </p>
                </div>
            </div>

            {/* Input Area */}
            <div className="mt-6 pt-5 border-t border-white/5 relative">
                <div className="group/input flex items-center bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 focus-within:border-primary/30 transition-all focus-within:bg-white/[0.05]">
                    <input
                        type="text"
                        placeholder="Direct inquiry to Intelligence..."
                        className="flex-1 bg-transparent border-none outline-none text-[11px] text-white placeholder-muted font-medium"
                    />
                    <button className="text-primary hover:glow-primary transition-all ml-3 scale-90 hover:scale-100">
                        <Send size={16} />
                    </button>
                </div>
                <div className="flex items-center space-x-4 mt-3 px-1">
                    <IconButton icon={<Paperclip size={12} />} />
                    <IconButton icon={<Sparkles size={12} />} />
                    <span className="text-[9px] text-muted font-mono-data ml-auto">ESTIMATED COST: 0.002 AC</span>
                </div>
            </div>
        </div>
    );
}

function IconButton({ icon }: { icon: React.ReactNode }) {
    return (
        <button className="text-muted hover:text-primary transition-colors hover:scale-110">
            {icon}
        </button>
    );
}
