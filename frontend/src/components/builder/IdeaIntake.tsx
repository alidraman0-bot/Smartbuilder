/**
 * S1: Idea Intake (Home UI)
 * 
 * A centered, non-intimidating interface for capturing the initial idea.
 * - Single textarea input (max-width: 640px)
 * - "Build MVP" CTA
 * - Recent projects list
 * - No validation errors, no configuration choices
 */

"use client";

import React, { useState } from 'react';
import { Sparkles, ArrowRight, Clock } from 'lucide-react';
import { useMvpBuilderStore } from '@/store/useMvpBuilderStore';
import { useRunStore } from '@/store/useRunStore';

export default function IdeaIntake() {
    const [idea, setIdea] = useState('');
    const { submitIdea, isLoading } = useMvpBuilderStore();
    const run = useRunStore();

    const handleSubmit = async () => {
        if (!idea.trim() || isLoading) return;

        try {
            await submitIdea(idea, run.runId);
        } catch (error) {
            console.error('Failed to submit idea:', error);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 py-12">
            {/* Centered Input */}
            <div className="w-full max-w-[640px] space-y-8">
                {/* Header */}
                <div className="text-center space-y-4 mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 mb-6 shadow-lg shadow-indigo-500/30">
                        <Sparkles size={32} className="text-white" strokeWidth={2.5} />
                    </div>

                    <h1 className="text-4xl font-bold text-white mb-2">
                        Build Your MVP
                    </h1>
                    <p className="text-lg text-zinc-400">
                        Describe your product idea. We'll handle the rest.
                    </p>
                </div>

                {/* Idea Input */}
                <div className="space-y-4">
                    <textarea
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Describe your MVP idea... (e.g., A task management app for remote teams with real-time collaboration)"
                        className="w-full h-40 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-zinc-500 resize-none focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                        disabled={isLoading}
                    />

                    {/* CTA Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!idea.trim() || isLoading}
                        className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2 group"
                    >
                        {isLoading ? (
                            <>
                                <Clock size={20} className="animate-spin" />
                                <span>Initializing...</span>
                            </>
                        ) : (
                            <>
                                <span>Build MVP</span>
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <p className="text-xs text-zinc-600 text-center">
                        Press <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded">Enter</kbd> to submit
                    </p>
                </div>

                {/* Recent Projects (Placeholder) */}
                <div className="pt-12 border-t border-white/5">
                    <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                        Recent Projects
                    </h3>
                    <div className="space-y-2">
                        {[
                            { name: 'Task Manager Pro', time: '2 hours ago' },
                            { name: 'AI Analytics Dashboard', time: '1 day ago' },
                            { name: 'Social Media Scheduler', time: '3 days ago' }
                        ].map((project, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border border-white/5 rounded-lg hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer group"
                            >
                                <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">
                                    {project.name}
                                </span>
                                <span className="text-xs text-zinc-600">
                                    {project.time}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
