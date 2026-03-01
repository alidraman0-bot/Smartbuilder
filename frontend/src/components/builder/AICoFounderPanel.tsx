"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    Lightbulb,
    ArrowRight,
    Loader2,
    Send,
    TrendingUp,
    ShieldAlert,
    Zap
} from 'lucide-react';
import { AICofounderAdvice } from '@/types/cofounder';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface AICoFounderPanelProps {
    projectId: string;
}

export default function AICoFounderPanel({ projectId }: AICoFounderPanelProps) {
    const [advice, setAdvice] = useState<AICofounderAdvice | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [query, setQuery] = useState('');
    const [analysisResponse, setAnalysisResponse] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchAdvice();
    }, [projectId]);

    useEffect(() => {
        if (analysisResponse) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [analysisResponse]);

    const fetchAdvice = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/v1/cofounder/${projectId}`);
            if (res.ok) {
                const data = await res.json();
                if (data) {
                    setAdvice(data);
                } else {
                    // If no advice yet, generate it
                    await generateAdvice();
                }
            }
        } catch (err) {
            console.error("Failed to fetch co-founder advice:", err);
        } finally {
            setLoading(false);
        }
    };

    const generateAdvice = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/v1/cofounder/${projectId}/generate`, {
                method: 'POST'
            });
            if (res.ok) {
                const data = await res.json();
                setAdvice(data);
            }
        } catch (err) {
            console.error("Failed to generate co-founder advice:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeeperAnalysis = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || analyzing) return;

        setAnalyzing(true);
        try {
            const res = await fetch(`/api/v1/cofounder/${projectId}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });
            if (res.ok) {
                const data = await res.json();
                setAnalysisResponse(data.response);
                setQuery('');
            }
        } catch (err) {
            console.error("Deeper analysis failed:", err);
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4 p-8">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">
                    AI Co-Founder analyzing project...
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#0d0d10] border-l border-[#27272a] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-[#27272a] bg-gradient-to-r from-blue-500/10 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Zap className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">AI Co-Founder</h2>
                        <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">Live Strategic Advisor</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                {/* Health Score Gauge */}
                <div className="relative p-6 rounded-2xl bg-[#18181b] border border-[#27272a] overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Startup Health Score</span>
                        <TrendingUp className="text-blue-500 w-4 h-4" />
                    </div>
                    <div className="flex items-end gap-3">
                        <span className="text-5xl font-black text-white tabular-nums tracking-tighter">
                            {advice?.health_score || 0}
                        </span>
                        <span className="text-gray-500 text-lg font-bold mb-1">/100</span>
                    </div>
                    <div className="mt-4 w-full h-2 bg-[#27272a] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000"
                            style={{ width: `${advice?.health_score || 0}%` }}
                        />
                    </div>
                </div>

                {/* Key Insights */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-blue-400">
                        <Lightbulb size={18} />
                        <h3 className="text-sm font-bold uppercase tracking-widest">Key Insights</h3>
                    </div>
                    <div className="space-y-3">
                        {advice?.key_insights.map((insight, i) => (
                            <div key={i} className="flex gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 group hover:border-blue-500/30 transition-all">
                                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-gray-300 text-sm leading-relaxed">{insight}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Risks */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-amber-500">
                        <ShieldAlert size={18} />
                        <h3 className="text-sm font-bold uppercase tracking-widest">Critical Risks</h3>
                    </div>
                    <div className="space-y-3">
                        {advice?.risks.map((risk, i) => (
                            <div key={i} className="flex gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/30 transition-all">
                                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-gray-300 text-sm leading-relaxed">{risk}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Next Best Actions */}
                <section className="space-y-4 pb-20">
                    <div className="flex items-center gap-2 text-emerald-500">
                        <ArrowRight size={18} />
                        <h3 className="text-sm font-bold uppercase tracking-widest">Next Best Actions</h3>
                    </div>
                    <div className="space-y-3">
                        {advice?.next_actions.map((action, i) => (
                            <div key={i} className="group flex items-center justify-between p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 hover:border-emerald-500/30 transition-all cursor-pointer">
                                <p className="text-gray-300 text-sm font-medium">{action}</p>
                                <ArrowRight className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Analysis Result (if any) */}
                {analysisResponse && (
                    <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 animate-in fade-in slide-in-from-bottom-4">
                        <p className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">Deep Analysis Result</p>
                        <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{analysisResponse}</p>
                        <div ref={chatEndRef} />
                    </div>
                )}
            </div>

            {/* Input Box */}
            <div className="p-6 bg-[#18181b] border-t border-[#27272a]">
                <form onSubmit={handleDeeperAnalysis} className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask for deeper analysis..."
                        className="w-full bg-[#0d0d10] border border-[#27272a] rounded-xl py-4 pl-5 pr-14 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all shadow-inner"
                    />
                    <button
                        type="submit"
                        disabled={!query.trim() || analyzing}
                        className="absolute right-2 top-2 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white hover:bg-blue-600 transition-all disabled:opacity-30 shadow-lg shadow-blue-500/20"
                    >
                        {analyzing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                    <p className="mt-3 text-[10px] text-center text-gray-600 font-medium uppercase tracking-[0.2em]">
                        Your AI Co-Founder is always thinking
                    </p>
                </form>
            </div>
        </div>
    );
}
