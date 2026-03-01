"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRunStore } from "@/store/useRunStore";
import {
    Layers,
    Share2,
    Sparkles,
    Target,
    Users,
    BarChart3,
    DollarSign,
    Zap,
    Code2,
    Megaphone,
    UserCheck,
    Gauge,
    Star,
    RefreshCw,
} from "lucide-react";
import StartupPipeline from "@/components/layout/StartupPipeline";
import GenerationLoader from "@/components/blueprint/GenerationLoader";
import BlueprintCard from "@/components/blueprint/BlueprintCard";
import ShareModal from "@/components/blueprint/ShareModal";

interface BlueprintData {
    name: string;
    problem: string;
    solution: string;
    customers: string;
    market: string;
    business_model: string;
    features: string[];
    tech_stack: string;
    go_to_market: string;
    first_customers: string;
    build_complexity: string;
    opportunity_score: number;
}

type PageState = "idle" | "generating" | "animating" | "done" | "error";

const COMPLEXITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    Low: { label: "Low", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
    Medium: { label: "Medium", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" },
    High: { label: "High", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30" },
};

function OpportunityScoreBadge({ score }: { score: number }) {
    const percent = (score / 10) * 100;
    const color =
        score >= 7.5
            ? "#22c55e"
            : score >= 5
                ? "#f59e0b"
                : "#ef4444";

    return (
        <div className="flex items-center gap-4">
            <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="22" fill="none" stroke="#27272a" strokeWidth="5" />
                    <circle
                        cx="28" cy="28" r="22" fill="none"
                        stroke={color} strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 22}`}
                        strokeDashoffset={`${2 * Math.PI * 22 * (1 - percent / 100)}`}
                        style={{ transition: "stroke-dashoffset 1s ease" }}
                    />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                    {score.toFixed(1)}
                </span>
            </div>
            <div>
                <p className="text-white font-bold text-lg">Opportunity Score</p>
                <p className="text-gray-500 text-xs">
                    {score >= 7.5 ? "Strong signal — worth building" : score >= 5 ? "Moderate opportunity" : "Needs more validation"}
                </p>
            </div>
        </div>
    );
}

export default function BlueprintPage() {
    const run = useRunStore();
    const [pageState, setPageState] = useState<PageState>("idle");
    const [blueprint, setBlueprint] = useState<BlueprintData | null>(null);
    const [showShare, setShowShare] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const canGenerate = !!(run.research as any)?.idea;

    const generate = useCallback(async () => {
        setPageState("generating");
        setErrorMsg(null);
        try {
            const idea = (run.research as any)?.idea;
            const res = await fetch("/api/generate-blueprint", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    idea: idea
                        ? `${idea.title || ""}: ${idea.description || ""}`
                        : "A startup idea",
                    research: run.research ?? {},
                    prd: run.prd ?? {},
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || `Server error ${res.status}`);
            }

            const data: BlueprintData = await res.json();
            setBlueprint(data);
            // Let the loader animation finish before showing the result
            setPageState("animating");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to generate blueprint";
            setErrorMsg(msg);
            setPageState("error");
        }
    }, [run.research, run.prd]);

    // Auto-generate if we have idea data
    useEffect(() => {
        if (pageState === "idle" && canGenerate) {
            generate();
        }
    }, [pageState, canGenerate, generate]);

    const handleAnimationDone = () => {
        setPageState("done");
    };

    // ── IDLE (no idea data) ─────────────────────────────────────────────────
    if (pageState === "idle" && !canGenerate) {
        return (
            <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center gap-8 px-6">
                <div className="text-center space-y-4 max-w-md">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                        <Layers className="w-10 h-10 text-violet-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Startup Blueprint</h1>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Generate a complete startup blueprint from your idea, market research,
                        and PRD data. Start by creating an idea in the <strong>Ideas</strong> section.
                    </p>
                </div>
            </div>
        );
    }

    // ── GENERATING / ANIMATING ──────────────────────────────────────────────
    if (pageState === "generating" || pageState === "animating") {
        return (
            <div className="min-h-screen bg-[#09090b] flex flex-col">
                <div className="max-w-7xl mx-auto w-full px-6 pt-8">
                    <div className="bg-[#18181b]/50 border border-[#27272a] rounded-3xl p-2 backdrop-blur-xl">
                        <StartupPipeline currentStage="prd" />
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center px-6">
                    <GenerationLoader onComplete={pageState === "animating" ? handleAnimationDone : undefined} />
                </div>
            </div>
        );
    }

    // ── ERROR ───────────────────────────────────────────────────────────────
    if (pageState === "error") {
        return (
            <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center gap-6 px-6">
                <div className="text-center space-y-4 max-w-md p-8 bg-[#18181b] border border-rose-500/20 rounded-3xl">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                        <Zap className="w-8 h-8 text-rose-400" />
                    </div>
                    <h2 className="text-white font-bold text-xl">Generation Failed</h2>
                    <p className="text-gray-400 text-sm">{errorMsg}</p>
                    <button
                        onClick={() => setPageState("idle")}
                        className="w-full flex items-center justify-center gap-2 bg-white text-black py-3 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-gray-200 transition-all"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // ── DONE ────────────────────────────────────────────────────────────────
    if (!blueprint) return null;

    const complexityConfig =
        COMPLEXITY_CONFIG[blueprint.build_complexity] ?? COMPLEXITY_CONFIG.Medium;

    return (
        <div id="blueprint-print-root" className="min-h-screen bg-[#09090b]">
            {/* Pipeline tracker */}
            <div className="max-w-7xl mx-auto px-6 pt-8">
                <div className="bg-[#18181b]/50 border border-[#27272a] rounded-3xl p-2 backdrop-blur-xl">
                    <StartupPipeline currentStage="prd" />
                </div>
            </div>

            {/* ── Hero header ── */}
            <div className="max-w-7xl mx-auto px-6 pt-10 pb-4">
                <div className="relative overflow-hidden bg-gradient-to-br from-violet-900/40 via-indigo-900/30 to-[#09090b] border border-violet-500/20 rounded-3xl p-8 md:p-12">
                    {/* Background glow */}
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-widest">
                                    <Sparkles className="w-3 h-3" />
                                    AI Blueprint
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
                                {blueprint.name}
                            </h1>
                            <p className="text-gray-400 text-base leading-relaxed max-w-xl">
                                {blueprint.problem}
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 items-end no-print">
                            <button
                                onClick={() => setShowShare(true)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#27272a] bg-[#18181b] text-gray-300 hover:text-white hover:border-violet-500/40 hover:bg-violet-500/5 transition-all text-sm font-semibold"
                            >
                                <Share2 className="w-4 h-4" />
                                Share
                            </button>
                            <button
                                onClick={generate}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-gray-500 hover:text-white transition-all text-xs uppercase tracking-widest font-bold"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Regenerate
                            </button>
                        </div>
                    </div>

                    {/* Score + Complexity row */}
                    <div className="relative mt-8 flex flex-wrap gap-6 items-center">
                        <OpportunityScoreBadge score={blueprint.opportunity_score} />
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest ${complexityConfig.bg} ${complexityConfig.color}`}>
                            <Gauge className="w-4 h-4" />
                            Build Complexity: {complexityConfig.label}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Blueprint sections grid ── */}
            <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">

                <BlueprintCard title="Solution" accent="violet" icon={<Sparkles className="w-4 h-4" />}>
                    {blueprint.solution}
                </BlueprintCard>

                <BlueprintCard title="Target Customers" accent="sky" icon={<Users className="w-4 h-4" />}>
                    {blueprint.customers}
                </BlueprintCard>

                <BlueprintCard title="Market Size" accent="indigo" icon={<BarChart3 className="w-4 h-4" />}>
                    {blueprint.market}
                </BlueprintCard>

                <BlueprintCard title="Business Model" accent="emerald" icon={<DollarSign className="w-4 h-4" />}>
                    {blueprint.business_model}
                </BlueprintCard>

                <BlueprintCard title="Core Features" accent="fuchsia" icon={<Zap className="w-4 h-4" />}>
                    <ul className="space-y-2">
                        {blueprint.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <Star className="w-3.5 h-3.5 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                                <span>{f}</span>
                            </li>
                        ))}
                    </ul>
                </BlueprintCard>

                <BlueprintCard title="Tech Stack" accent="amber" icon={<Code2 className="w-4 h-4" />}>
                    {blueprint.tech_stack}
                </BlueprintCard>

                <BlueprintCard title="Go-to-Market Strategy" accent="rose" icon={<Megaphone className="w-4 h-4" />}>
                    {blueprint.go_to_market}
                </BlueprintCard>

                <BlueprintCard title="First 10 Customers Plan" accent="sky" icon={<UserCheck className="w-4 h-4" />}>
                    {blueprint.first_customers}
                </BlueprintCard>

                {/* Remaining metrics — full width summary */}
                <div className="md:col-span-2 xl:col-span-1">
                    <BlueprintCard title="Quick Stats" accent="indigo" icon={<Target className="w-4 h-4" />}>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Opportunity Score</span>
                                <span className="font-bold text-white">{blueprint.opportunity_score}/10</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-[#27272a] overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                                    style={{ width: `${(blueprint.opportunity_score / 10) * 100}%`, transition: "width 1s ease" }}
                                />
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-gray-500">Build Complexity</span>
                                <span className={`font-bold ${complexityConfig.color}`}>{blueprint.build_complexity}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Core Features</span>
                                <span className="font-bold text-white">{blueprint.features.length} identified</span>
                            </div>
                        </div>
                    </BlueprintCard>
                </div>
            </div>

            {/* ── Sticky bottom CTA ── */}
            <div className="no-print fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4">
                <div className="bg-gradient-to-br from-[#18181b] to-[#0d0d10] border border-[#27272a] backdrop-blur-3xl rounded-2xl p-4 flex items-center gap-3 shadow-2xl">
                    <button
                        onClick={() => setShowShare(true)}
                        className="flex-1 flex items-center justify-center gap-2 border border-[#3f3f46] py-3.5 rounded-xl text-xs font-bold text-gray-300 uppercase tracking-widest hover:border-violet-500/40 hover:text-white hover:bg-violet-500/5 transition-all"
                    >
                        <Share2 className="w-4 h-4" />
                        Share
                    </button>
                    <button
                        onClick={() => (window.location.href = "/mvp")}
                        className="flex-[2] group relative overflow-hidden bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20"
                    >
                        <Sparkles className="w-4 h-4" />
                        Build the MVP →
                    </button>
                </div>
            </div>

            {/* Share modal */}
            {showShare && (
                <ShareModal
                    onClose={() => setShowShare(false)}
                    startupName={blueprint.name}
                />
            )}
        </div>
    );
}
