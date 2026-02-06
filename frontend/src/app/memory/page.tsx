"use client";

import React, { useEffect } from 'react';
import { useMemoryStore, MemoryEvent } from '@/store/memoryStore';
import {
    History, Lightbulb, Search, FileText, Code, Rocket,
    ShieldCheck, AlertCircle, User, Bot, Clock, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const getEventIcon = (type: string) => {
    switch (type) {
        case 'idea_created': return <Lightbulb className="w-4 h-4 text-amber-400" />;
        case 'research_snapshot_created': return <Search className="w-4 h-4 text-blue-400" />;
        case 'business_plan_versioned': return <FileText className="w-4 h-4 text-indigo-400" />;
        case 'prd_created': return <Code className="w-4 h-4 text-purple-400" />;
        case 'prd_locked': return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
        case 'deployment_triggered': return <Rocket className="w-4 h-4 text-emerald-400" />;
        default: return <History className="w-4 h-4 text-zinc-400" />;
    }
};

export default function MemoryTimelinePage() {
    const { timeline, fetchTimeline, isLoading } = useMemoryStore();
    const projectId = "00000000-0000-0000-0000-000000000000"; // Placeholder

    useEffect(() => {
        fetchTimeline(projectId);
    }, [fetchTimeline]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
                <p className="text-zinc-500 font-medium">Accessing Project Memory...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <div className="flex items-center gap-4 mb-12">
                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                    <History className="w-8 h-8 text-indigo-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Project Memory</h1>
                    <p className="text-zinc-500 font-medium">Trace every decision, evolution, and outcome</p>
                </div>
            </div>

            <div className="relative space-y-8">
                {/* Timeline Line */}
                <div className="absolute left-[21px] top-4 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 via-zinc-800 to-transparent" />

                {timeline.map((event, idx) => (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={event.id}
                        className="relative pl-12 group"
                    >
                        {/* Dot/Icon */}
                        <div className={`absolute left-0 w-11 h-11 rounded-full border bg-black flex items-center justify-center z-10 transition-all duration-300 group-hover:scale-110 shadow-lg ${event.actor === 'user' ? 'border-emerald-500/30' : 'border-zinc-800'
                            }`}>
                            {getEventIcon(event.type)}
                        </div>

                        {/* Content */}
                        <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30 backdrop-blur-sm hover:bg-zinc-900/50 transition-all duration-300">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-white tracking-wide">{event.title}</span>
                                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${event.actor === 'user' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                                        }`}>
                                        {event.actor === 'user' ? <User className="w-2.5 h-2.5" /> : <Bot className="w-2.5 h-2.5" />}
                                        {event.actor === 'user' ? 'Owner' : 'Smartbuilder AI'}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
                                    <Clock className="w-3 h-3" />
                                    {new Date(event.created_at).toLocaleTimeString()}
                                </div>
                            </div>

                            <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
                                {event.description}
                            </p>

                            {event.artifact_ref_id && (
                                <button className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">
                                    View Artifact Detail
                                    <ChevronRight className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        {/* Timestamp Grouping Label (If first of day) */}
                        <div className="absolute -left-32 top-3 w-24 text-right hidden xl:block">
                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                                {new Date(event.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    </motion.div>
                ))}

                {timeline.length === 0 && (
                    <div className="text-center py-20 bg-zinc-900/20 rounded-3xl border border-dashed border-white/10">
                        <AlertCircle className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                        <p className="text-zinc-500 font-medium">No memory events recorded yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
