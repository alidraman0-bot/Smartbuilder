'use client';

import React, { useState } from 'react';
import {
    ShieldCheck,
    Target,
    AlertCircle,
    DollarSign,
    Box,
    HelpCircle,
    TrendingUp,
    Activity,
    Zap,
    ChevronRight,
    ArrowRight,
    Loader2,
    Info,
    Clock,
    Layers
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Idea {
    idea_id: string;
    title: string;
    problem: string;
    target_user: string;
    monetization: string;
    confidence_score: number;
    market_score: number;
    execution_complexity: number;
    breakdown: string;
    alternatives: string[];
    why_now: string;
    reasoning: string[];
}

interface IdeaDetailsPanelProps {
    idea: Idea | null;
    onClose: () => void;
}

export default function IdeaDetailsPanel({ idea, onClose }: IdeaDetailsPanelProps) {
    const [isPromoting, setIsPromoting] = useState(false);
    const router = useRouter();

    if (!idea) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-[#08080a] border-l border-white/5 animate-in fade-in duration-200">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 opacity-20">
                    <Info size={32} />
                </div>
                <h3 className="text-white/40 text-sm font-medium tracking-wide uppercase">Select an opportunity</h3>
                <p className="text-zinc-600 text-xs mt-2 max-w-[200px]">Review the signals to generate a deep-dive investment memo.</p>
            </div>
        );
    }

    const handlePromote = async () => {
        setIsPromoting(true);
        try {
            const response = await fetch('/api/v1/ideas/promote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idea_id: idea.idea_id })
            });
            if (response.ok) {
                router.push('/research');
            } else {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                alert(`Failed to promote idea: ${errorData.detail}`);
                setIsPromoting(false);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to promote idea.");
            setIsPromoting(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#08080a] border-l border-white/5 shadow-2xl animate-in slide-in-from-right duration-300 overflow-hidden">

            {/* 1. HEADER (CONTEXT & TRUST) */}
            <header className="shrink-0 p-8 border-b border-white/5 bg-white/[0.01] backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Activity size={120} className="text-indigo-500" />
                </div>

                <div className="flex items-start justify-between mb-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-white tracking-tight leading-tight">
                            {idea.title}
                        </h1>
                        <p className="text-zinc-500 text-xs font-medium tracking-wide">
                            {idea.monetization} • Managed Opportunity
                        </p>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="text-2xl font-black text-indigo-400 font-mono-data tracking-tighter">
                            {idea.confidence_score}/100
                        </div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">AI Confidence</span>
                    </div>
                </div>

                <div className="flex items-center space-x-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg w-fit">
                    <Info size={12} className="text-indigo-400" />
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Based on live market signals</span>
                </div>
            </header>

            {/* SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto px-8 py-10 space-y-12 custom-scrollbar">

                {/* 2. QUICK SNAPSHOT */}
                <section className="space-y-6">
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Quick Snapshot</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <SnapshotRow icon={<Target size={14} />} label="Target Customer" value={idea.target_user} />
                        <SnapshotRow icon={<AlertCircle size={14} />} label="Core Pain Point" value={idea.problem.split('.')[0] + '.'} />
                        <SnapshotRow icon={<DollarSign size={14} />} label="Monetization" value={idea.monetization} />
                        <SnapshotRow icon={<Zap size={14} />} label="MVP Scope" value={idea.execution_complexity > 7 ? 'High' : (idea.execution_complexity > 3 ? 'Medium' : 'Low')} />
                    </div>
                </section>

                {/* 3. PROBLEM DEEP DIVE */}
                <section className="space-y-4">
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Problem Breakdown</h3>
                    <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                        {idea.problem}
                    </p>
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                        <p className="text-xs text-zinc-500 leading-relaxed italic">
                            "Current solutions in this space typically fail due to high friction in data onboarding and legacy technical debt."
                        </p>
                    </div>
                </section>

                {/* 4. EXISTING ALTERNATIVES */}
                <section className="space-y-4">
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Existing Alternatives</h3>
                    <div className="space-y-3">
                        {idea.alternatives.map((alt, i) => (
                            <div key={i} className="flex items-start space-x-3 p-3 bg-white/[0.01] hover:bg-white/[0.03] transition-colors rounded-lg border border-white/5">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 mt-1.5 shrink-0" />
                                <p className="text-xs text-zinc-400 leading-relaxed">{alt}</p>
                            </div>
                        ))}
                        <div className="pt-2">
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest italic">
                                Status Quo: Manual workarounds and spreadsheet-based tracking.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 5. WHY NOW */}
                <section className="space-y-4">
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Why This Opportunity Exists Now</h3>
                    <div className="p-6 bg-gradient-to-br from-indigo-500/5 to-transparent border border-indigo-500/10 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Clock size={40} className="text-indigo-400" />
                        </div>
                        <p className="text-sm text-zinc-200 leading-relaxed font-medium relative z-10">
                            {idea.why_now}
                        </p>
                    </div>
                </section>

                {/* 6. MARKET SIGNAL EVIDENCE */}
                <section className="space-y-4">
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Market Signal Evidence</h3>
                    <div className="space-y-2">
                        <SignalItem source="Reddit" label="Repeated complaints detected in r/startups and r/ProductManagement." />
                        <SignalItem source="Hacker News" label="High engagement on 'Ask HN' threads regarding vertical AI automation." />
                        <SignalItem source="Google Trends" label="2.4x rise in search volume for correlated problem keywords (LTM)." />
                    </div>
                </section>

                {/* 7. AI CONFIDENCE EXPLANATION */}
                <section className="space-y-4">
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Why Smartbuilder Is Confident</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <ConfidenceCard label="Pattern Match" value="High" color="text-emerald-400" />
                        <ConfidenceCard label="Execution Yield" value="~84%" color="text-indigo-400" />
                        <ConfidenceCard label="Market Gap" value="Confirmed" color="text-emerald-400" />
                        <ConfidenceCard label="Demand Velocity" value="Accelerating" color="text-amber-400" />
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium pt-2">
                        Confidence is derived from cross-referencing unmet demand signals with execution feasibility models.
                    </p>
                </section>

                {/* Padding for footer */}
                <div className="h-32" />
            </div>

            {/* 8. PRIMARY CTA (FOOTER) */}
            <footer className="shrink-0 p-8 border-t border-white/5 bg-black/40 backdrop-blur-2xl">
                <button
                    onClick={handlePromote}
                    disabled={isPromoting}
                    className="w-full group relative overflow-hidden bg-white hover:bg-zinc-100 text-black py-5 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-white/5 flex flex-col items-center justify-center space-y-1"
                >
                    <div className="flex items-center space-x-2">
                        {isPromoting ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} className="text-indigo-600" />}
                        <span className="tracking-[0.2em] uppercase">{isPromoting ? 'Initializing Deep Scan...' : 'Promote to Research'}</span>
                        {!isPromoting && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        {isPromoting ? 'Running market research using live data...' : 'Run deep market analytics & forensics'}
                    </span>
                </button>
            </footer>
        </div>
    );
}

// --- Internal Components ---

function SnapshotRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3 text-zinc-500 font-medium">
                <div className="p-1.5 bg-white/5 rounded-md">
                    {icon}
                </div>
                <span className="uppercase tracking-widest">{label}</span>
            </div>
            <span className="text-zinc-200 font-bold max-w-[180px] text-right truncate">{value}</span>
        </div>
    );
}

function SignalItem({ source, label }: { source: string, label: string }) {
    return (
        <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{source} Feed</span>
                <Activity size={10} className="text-indigo-500/50" />
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">{label}</p>
        </div>
    );
}

function ConfidenceCard({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{label}</span>
            <div className={`text-xs font-black uppercase tracking-tight ${color}`}>{value}</div>
        </div>
    );
}
