import React from 'react';
import { X, CheckCircle2, AlertTriangle, Zap, Target, DollarSign, Clock, Search, Layers, ShieldCheck, Activity, HelpCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

import { type Idea } from '@/types/idea';

interface IdeaDetailPanelProps {
    idea: Idea | null;
    isOpen: boolean;
    onClose: () => void;
    onPromote: (id: string) => void;
    isPromoting: boolean;
}

export default function IdeaDetailPanel({ idea, isOpen, onClose, onPromote, isPromoting }: IdeaDetailPanelProps) {
    // Keep it in the DOM for animations, but only if we have an idea at some point
    if (!idea) return null;

    return (
        <>
            {/* Backdrop for mobile or to focus attention */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-opacity duration-500 ease-in-out",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            <div
                className={cn(
                    "fixed inset-y-0 right-0 w-full md:w-[650px] bg-[#0A0A0A] border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-50 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform",
                    isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0D0D0D] relative shrink-0">
                    <div className="flex items-center space-x-2">
                        <div className={cn("w-2 h-2 rounded-full", idea.is_discovery_only ? "bg-amber-500 animate-pulse" : "bg-green-500")} />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                            {idea.is_discovery_only ? "Deep Research in Progress" : "Investment Brief"}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onClose();
                        }}
                        className="absolute top-5 right-5 p-3 hover:bg-white/10 rounded-full transition-all text-zinc-400 hover:text-white z-[70] cursor-pointer pointer-events-auto flex items-center justify-center group/close"
                        aria-label="Close panel"
                    >
                        <X size={24} className="group-hover/close:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-8 space-y-12">

                        {/* SECTION 1: IDEA HEADER */}
                        <section className="space-y-6">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div className="space-y-2 max-w-sm">
                                    <h1 className="text-3xl font-bold text-white tracking-tight leading-tight">{idea.title}</h1>
                                    <p className="text-lg text-zinc-400 font-medium leading-relaxed">{idea.thesis || idea.description}</p>
                                </div>
                                <div className="flex flex-col items-end space-y-4 shrink-0">
                                    <div className="text-right">
                                        <div className="text-4xl font-black text-white font-mono">
                                            {idea.is_discovery_only ? "—" : (idea.confidence_score || 0)}
                                        </div>
                                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Confidence Score</div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <div className="text-sm font-bold text-white">
                                            {idea.is_discovery_only ? "Analyzing..." : idea.market_size}
                                        </div>
                                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Market Size</div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <div className="text-sm font-bold text-white">
                                            {idea.is_discovery_only ? "..." : (idea.execution_complexity || 0)}/10
                                        </div>
                                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Complexity</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <hr className="border-white/5" />

                        {/* PROGRESS TRACKER (Only when researching) */}
                        {idea.is_discovery_only && (
                            <section className="p-6 bg-white/[0.02] border border-white/10 rounded-2xl space-y-4">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                    <span>Intelligence Scan</span>
                                    <span className="text-amber-500 animate-pulse">Running</span>
                                </div>
                                <div className="space-y-3">
                                    <ProgressStep label="Aggregating Market Signals" active={true} />
                                    <ProgressStep label="Analyzing Competitor Landscape" active={true} />
                                    <ProgressStep label="Validating Demand via SerpAPI" active={false} />
                                    <ProgressStep label="Synthesizing Investment Thesis" active={false} />
                                </div>
                            </section>
                        )}

                        {/* SECTION 2: THE PROBLEM */}
                        <section className="space-y-4">
                            <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center">
                                <Activity size={14} className="mr-2 text-indigo-500" />
                                The Problem
                            </h3>
                            <ul className="space-y-3">
                                {(idea.problem_bullets && idea.problem_bullets.length > 0) ? (
                                    idea.problem_bullets.map((bullet, i) => (
                                        <li key={`prob-${i}`} className="flex items-start text-sm text-zinc-300 leading-relaxed font-medium">
                                            <span className="mr-3 text-zinc-600">—</span>
                                            {bullet}
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-sm text-zinc-600 italic">No specific pain points identified yet...</li>
                                )}
                            </ul>
                        </section>

                        {/* SECTION 3: WHO THIS IS FOR */}
                        <section className="space-y-4">
                            <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center">
                                <Target size={14} className="mr-2 text-indigo-500" />
                                Target Customer
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <DataBlock label="Primary User" value={idea.target_customer?.primary_user || 'N/A'} />
                                <DataBlock label="Company Size" value={idea.target_customer?.company_size || 'N/A'} />
                                <DataBlock label="Industry/Role" value={idea.target_customer?.industry_or_role || 'N/A'} />
                            </div>
                        </section>

                        {/* SECTION 4: HOW MONEY IS MADE */}
                        <section className="space-y-4">
                            <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center">
                                <DollarSign size={14} className="mr-2 text-indigo-500" />
                                Monetization Model
                            </h3>
                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl space-y-4">
                                <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                                    <span className="text-zinc-500">Pricing Structure</span>
                                    <span className="text-white font-bold">{idea.monetization?.pricing_structure || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                                    <span className="text-zinc-500">Who Pays</span>
                                    <span className="text-white font-bold">{idea.monetization?.who_pays || 'N/A'}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Value Proposition</span>
                                    <p className="text-sm text-zinc-300 font-medium italic">"{idea.monetization?.value_prop || 'N/A'}"</p>
                                </div>
                            </div>
                        </section>

                        {/* SECTION 5: WHY NOW */}
                        <section className="space-y-4">
                            <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center">
                                <Clock size={14} className="mr-2 text-indigo-500" />
                                Why Now
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {(idea.why_now_bullets || []).map((bullet, i) => (
                                    <div key={`wn-${i}`} className="p-4 border border-white/5 bg-white/[0.01] rounded-xl flex flex-col justify-between min-h-[100px]">
                                        <p className="text-xs text-zinc-300 font-medium leading-relaxed">{bullet}</p>
                                        <span className="text-[10px] text-zinc-600 mt-2">Signal {i + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* SECTION 6: EXISTING ALTERNATIVES */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Today</h3>
                                <div className="space-y-2">
                                    {(idea.alternatives_structured?.today || []).map((item, i) => (
                                        <div key={i} className="flex items-center text-xs text-zinc-400 bg-white/[0.02] px-3 py-2 rounded-lg border border-white/5 uppercase tracking-wide font-bold">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Critical Gaps</h3>
                                <div className="space-y-2">
                                    {(idea.alternatives_structured?.gaps || []).map((item, i) => (
                                        <div key={i} className="flex items-start text-xs text-zinc-500 leading-relaxed font-medium">
                                            <span className="text-red-500 mr-2">✕</span>
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* SECTION 7: MVP SCOPE */}
                        <section className="space-y-4">
                            <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center">
                                <Layers size={14} className="mr-2 text-indigo-500" />
                                MVP Scope
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                {(idea.mvp_scope_bullets || []).map((item, i) => (
                                    <div key={`mvp-${i}`} className="flex items-center space-x-3 text-sm text-zinc-300 border-b border-white/5 pb-3">
                                        <span className="text-[10px] font-mono text-zinc-600 font-bold">0{i + 1}</span>
                                        <span className="font-medium tracking-tight">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* SECTION 8: REAL-WORLD SIGNALS (Market Intelligence) */}
                        <section className="space-y-6">
                            <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center">
                                <Search size={14} className="mr-2 text-indigo-500" />
                                Market Intelligence Feed
                            </h3>
                            
                            {(idea.signals && idea.signals.length > 0) ? (
                                <div className="space-y-4">
                                    {idea.signals.slice(0, 5).map((signal: any, i: number) => (
                                        <a 
                                            key={`sig-${i}`} 
                                            href={signal.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="block p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-indigo-500/30 transition-all group"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400/70">{signal.source} signal</span>
                                                <div className="flex items-center space-x-1 text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                                                    <span>Score: {signal.signal_strength || 80}</span>
                                                </div>
                                            </div>
                                            <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors mb-1">{signal.title}</h4>
                                            <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{signal.description}</p>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 border border-white/5 border-dashed rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
                                    <div className="p-3 bg-white/5 rounded-full text-zinc-600">
                                        <Activity size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Scanning Live Nodes</p>
                                        <p className="text-[10px] text-zinc-600">Aggregating evidence from Reddit, HN, and Global News...</p>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* SECTION 8: AI CONFIDENCE REASONING */}
                        <section className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl relative overflow-hidden group">
                            <ShieldCheck className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform" size={120} />

                            <div className="relative z-10 space-y-4">
                                <h3 className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Why Smartbuilder is Confident</h3>
                                <div className="space-y-3">
                                    {(idea.confidence_reasoning_bullets || []).map((point, i) => (
                                        <div key={`conf-${i}`} className="flex items-start space-x-3 text-sm text-zinc-200">
                                            <CheckCircle2 size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                                            <span className="font-medium leading-relaxed">{point}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* SECTION 9: RISKS & OPEN QUESTIONS */}
                        <section className="space-y-4">
                            <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center">
                                <HelpCircle size={14} className="mr-2 text-zinc-500" />
                                Risks to Validate
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <RiskItem label="Adoption" value={idea.risks_structured?.adoption || 'N/A'} color="text-amber-500" />
                                <RiskItem label="Technical" value={idea.risks_structured?.technical || 'N/A'} color="text-orange-500" />
                                <RiskItem label="Market" value={idea.risks_structured?.market || 'N/A'} color="text-red-500" />
                            </div>
                        </section>

                        {/* Padding for footer */}
                        <div className="h-32" />
                    </div>
                </div>

                {/* SECTION 10: PRIMARY CTA (FOOTER) */}
                <div className="shrink-0 p-8 border-t border-white/5 bg-[#0D0D0D] backdrop-blur-xl space-y-4">
                    <button
                        onClick={() => onPromote(idea.id)}
                        disabled={isPromoting}
                        className="w-full group bg-white hover:bg-zinc-200 text-black py-5 rounded-xl font-bold text-sm transition-all flex flex-col items-center justify-center space-y-1 shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)] active:scale-[0.98]"
                    >
                        <div className="flex items-center space-x-2">
                            {isPromoting || idea.is_discovery_only ? (
                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Zap size={16} className="fill-current" />
                            )}
                            <span className="tracking-[0.2em] uppercase">
                                {isPromoting ? 'Initializing...' : (idea.is_discovery_only ? 'Analyzing Market...' : 'Research this opportunity')}
                            </span>
                        </div>
                        {!isPromoting && (
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                {idea.is_discovery_only ? 'Fetching real-time data & competitor analysis' : 'Initialize Deep Research & Signal Validation'}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full text-[10px] font-bold text-zinc-600 hover:text-zinc-400 uppercase tracking-[0.2em] py-2 transition-colors"
                    >
                        Save for later
                    </button>
                </div>
            </div>
        </>
    );
}

// --- Internal Components ---

function DataBlock({ label, value }: { label: string, value: string }) {
    return (
        <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-1">
            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest block">{label}</span>
            <span className="text-xs text-white font-bold leading-tight">{value}</span>
        </div>
    );
}

function RiskItem({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center space-x-2">
                <AlertTriangle size={12} className={color} />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed">{value}</p>
        </div>
    );
}

function ProgressStep({ label, active }: { label: string, active: boolean }) {
    return (
        <div className={cn("flex items-center space-x-3 text-[10px] font-bold uppercase tracking-widest transition-opacity", active ? "opacity-100" : "opacity-30")}>
            {active ? (
                <div className="w-4 h-4 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                </div>
            ) : (
                <div className="w-4 h-4 border border-zinc-800 rounded-full" />
            )}
            <span className={active ? "text-zinc-300" : "text-zinc-600"}>{label}</span>
        </div>
    );
}
