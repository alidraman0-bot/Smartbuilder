"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Zap, Shield, Search, History, MessageSquare, Layers,
    ArrowRight, Check, X, Ban, Terminal, Box, Monitor,
    Database, Lock, Server, Share2, Eye, User, Sparkles,
    CheckCircle2, AlertCircle, RefreshCcw, TrendingUp
} from 'lucide-react';
import Link from 'next/link';

// SECTION 1 — OPENING FRAME
export function OpeningFrame() {
    return (
        <section className="pt-40 pb-24 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 overflow-hidden text-center">
            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
                        From idea to <br />
                        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">production-ready MVP</span> — safely.
                    </h1>
                    <p className="text-xl text-slate-500 mb-12 max-w-3xl mx-auto leading-relaxed">
                        Smartbuilder turns ideas, PRDs, and prompts into real web apps by separating thinking, building, and shipping — the way serious teams work.
                    </p>
                    <div className="flex flex-wrap justify-center gap-6 text-sm font-bold text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center"><X size={16} className="mr-2 text-red-400" /> No demos</span>
                        <span className="flex items-center"><X size={16} className="mr-2 text-red-400" /> No broken previews</span>
                        <span className="flex items-center"><X size={16} className="mr-2 text-red-400" /> No accidental deployments</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

// SECTION 2 — THE PROBLEM
export function TheProblem() {
    const problems = [
        { text: "Chat-based tools forget context", icon: <MessageSquare size={18} /> },
        { text: "Code gets rewritten instead of improved", icon: <RefreshCcw size={18} /> },
        { text: "Previews break without explanation", icon: <AlertCircle size={18} /> },
        { text: "Build and deploy are mixed together", icon: <Box size={18} /> },
        { text: "You don’t trust what you’re shipping", icon: <Shield size={18} /> },
    ];

    return (
        <section className="py-32 bg-white">
            <div className="max-w-5xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Building with AI today feels like this:</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {problems.map((p, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center space-x-4">
                            <div className="text-red-400">{p.icon}</div>
                            <span className="text-slate-600 font-medium">{p.text}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-20 text-center">
                    <p className="text-2xl font-bold text-slate-900 mb-2">AI feels fast — until it isn’t.</p>
                    <p className="text-xl text-slate-500">Speed without control becomes risk.</p>
                </div>
            </div>
        </section>
    );
}

// SECTION 3 — THE SMARTBUILDER DIFFERENCE
export function TheDifference() {
    return (
        <section className="py-32 bg-slate-50">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-bold text-slate-900 mb-6">Smartbuilder works like a real engineering system</h2>
                    <p className="text-xl text-slate-500 max-w-3xl mx-auto">
                        Most AI builders treat your app like a conversation. <br />
                        <span className="text-indigo-600 font-bold">Smartbuilder treats your app like infrastructure.</span>
                    </p>
                    <p className="mt-4 text-slate-400 font-medium italic">It introduces structure where AI usually creates chaos.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { title: "Understand", sub: "(intent & requirements)", icon: <Search />, color: "bg-blue-500" },
                        { title: "Build", sub: "(safe, incremental execution)", icon: <Zap />, color: "bg-indigo-500" },
                        { title: "Ship", sub: "(only when you choose)", icon: <Server />, color: "bg-purple-500" },
                    ].map((step, i) => (
                        <div key={i} className="p-10 rounded-3xl bg-white border border-slate-100 shadow-sm text-center group hover:shadow-xl transition-all">
                            <div className={`w-16 h-16 rounded-2xl ${step.color} text-white flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:scale-110 transition-transform`}>
                                {step.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">{step.title}</h3>
                            <p className="text-slate-500 font-medium">{step.sub}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// SECTION 4 — STEP-BY-STEP FLOW
export function StepByStepFlow() {
    const steps = [
        {
            num: "Step 1",
            title: "Start with intent, not code",
            desc: "You begin by describing what you want to build or change.",
            details: ["An idea", "A feature request", "A PRD", "A UI change", "A bug fix"],
            highlight: "Smartbuilder doesn’t blindly generate code. It classifies intent first (UI/UX, App Logic, Data).",
            impact: "Most AI tools rewrite too much. Smartbuilder changes only what’s necessary."
        },
        {
            num: "Step 2",
            title: "Build inside an isolated sandbox",
            desc: "Every change runs inside a private, local sandbox.",
            details: ["Real Node.js runtime", "Real framework (Next.js, Vite, etc.)", "Real file system", "No deployment involved"],
            highlight: "Your app builds incrementally, not from scratch. If something breaks, the preview pauses and stabilizes automatically.",
            impact: "This is how professional teams iterate."
        },
        {
            num: "Step 3",
            title: "See changes instantly (live preview)",
            desc: "The preview updates in real time as Smartbuilder builds.",
            details: ["Only modified files change", "Errors are detected immediately", "Real, running app — not screenshots"],
            highlight: "No refresh loops. No “try again” prompts.",
            impact: "You’re always looking at a real, running app."
        },
        {
            num: "Step 4",
            title: "Smartbuilder remembers everything",
            desc: "Project Memory saves the evolution of your product.",
            details: ["Ideas & Research snapshots", "Build iterations & Decisions", "Changes over time"],
            highlight: "You don’t “save files.” You preserve decision states.",
            impact: "Build history and versioned changes give you trust when sharing with teams."
        },
        {
            num: "Step 5",
            title: "Freeze the build (critical moment)",
            desc: "When your app is ready, you Freeze the build.",
            details: ["Locks the code", "Creates an immutable artifact", "Prevents accidental changes"],
            highlight: "Stable, reproducible, and ready for deployment. No AI touches it again unless explicitly duplicated.",
            impact: "This is the moment where AI builders usually fail. Smartbuilder is designed around it."
        },
        {
            num: "Step 6",
            title: "Deploy separately (by design)",
            desc: "Deployment does not happen inside the MVP Builder.",
            details: ["Choose environment", "Manage domains & SSL", "Control rollouts", "Add teams & permissions"],
            highlight: "Mixing build and deploy causes mistakes. Separation gives enterprise-level safety.",
            impact: "This is what gives Smartbuilder enterprise-level safety."
        }
    ];

    return (
        <section className="py-32 bg-white">
            <div className="max-w-5xl mx-auto px-6">
                <div className="space-y-32">
                    {steps.map((step, i) => (
                        <div key={i} className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                            <div className="sticky top-32">
                                <span className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-4 inline-block">{step.num}</span>
                                <h2 className="text-4xl font-bold text-slate-900 mb-6">{step.title}</h2>
                                <p className="text-xl text-slate-500 mb-8 leading-relaxed">{step.desc}</p>
                                <div className="space-y-4">
                                    {step.details.map((d, j) => (
                                        <div key={j} className="flex items-center text-slate-600 font-medium">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-4" />
                                            {d}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-8">
                                <div className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-sm">
                                    <p className="text-lg text-slate-800 font-medium leading-relaxed mb-6">
                                        {step.highlight}
                                    </p>
                                    <div className="pt-6 border-t border-slate-200">
                                        <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-2">Why this matters:</p>
                                        <p className="text-slate-500">{step.impact}</p>
                                    </div>
                                </div>
                                <div className="aspect-video rounded-[2.5rem] bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-300">
                                    <Sparkles size={48} className="opacity-50" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// SECTION 5 — WHAT YOU GET
export function Outcomes() {
    const outcomes = [
        "A real web app — not a demo",
        "A structured file system",
        "Live preview with stability guarantees",
        "Versioned builds",
        "Exportable source code",
        "Investor-ready artifacts",
        "Full control over shipping"
    ];

    return (
        <section className="py-32 bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-black/80" />
            <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div>
                    <h2 className="text-4xl font-bold mb-10 text-white">With Smartbuilder, you get:</h2>
                    <div className="space-y-4">
                        {outcomes.map((item, i) => (
                            <div key={i} className="flex items-center text-xl text-slate-300 font-medium">
                                <CheckCircle2 className="text-emerald-500 mr-4" />
                                {item}
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 pt-12 border-t border-white/10">
                        <p className="text-2xl font-bold text-indigo-400">AI works for you, not against you.</p>
                    </div>
                </div>
                <div className="relative">
                    <div className="aspect-square rounded-full bg-indigo-500/10 absolute -inset-20 blur-3xl animate-pulse" />
                    <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-xl relative z-10">
                        <div className="space-y-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-4 bg-white/5 rounded-full w-full" style={{ width: `${100 - i * 15}%` }} />
                            ))}
                            <div className="h-40 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                <Box className="text-indigo-400 opacity-50" size={40} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// SECTION 6 — WHO THIS IS FOR
export function TargetAudience() {
    return (
        <section className="py-32 bg-white">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <h2 className="text-3xl font-bold text-slate-900 mb-16">Smartbuilder is built for:</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                        "Founders building real MVPs",
                        "Startups preparing for demos or funding",
                        "Teams who want speed and control",
                        "Builders tired of fragile AI tools"
                    ].map((item, i) => (
                        <div key={i} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-center">
                            <p className="text-lg font-bold text-slate-800">{item}</p>
                        </div>
                    ))}
                </div>
                <p className="mt-16 text-xl text-slate-500 max-w-2xl mx-auto">
                    If you care about shipping something real — <span className="text-indigo-600 font-bold">this is for you.</span>
                </p>
            </div>
        </section>
    );
}

// SECTION 7 — QUICK FAQ
export function HowItWorksFAQ() {
    const faqs = [
        {
            q: "Is this just another AI code generator?",
            a: "No. Smartbuilder is a structured execution system, not a chat interface."
        },
        {
            q: "Do I own my code?",
            a: "Yes. You can export at any time."
        },
        {
            q: "Can I iterate after freezing a build?",
            a: "Yes — by duplicating the build. The original remains immutable."
        },
        {
            q: "Is this for non-technical founders?",
            a: "Yes. You don’t need to write code — but you’ll still get real software."
        }
    ];

    return (
        <section className="py-32 bg-slate-50">
            <div className="max-w-4xl mx-auto px-6">
                <h2 className="text-3xl font-bold text-slate-900 mb-16 text-center">Quick FAQ</h2>
                <div className="space-y-6">
                    {faqs.map((f, i) => (
                        <div key={i} className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">{f.q}</h3>
                            <p className="text-slate-500 leading-relaxed font-medium">{f.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// SECTION 8 — FINAL CTA
export function HowItWorksCTA() {
    return (
        <section className="py-40 bg-white text-center">
            <div className="max-w-3xl mx-auto px-6">
                <h2 className="text-5xl font-extrabold text-slate-900 mb-8">Build the right way.</h2>
                <p className="text-xl text-slate-500 mb-12">
                    Stop fighting tools that weren’t built for real products.
                </p>
                <Link href="/overview" className="inline-flex items-center py-5 px-10 rounded-full bg-slate-900 text-white text-lg font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 group">
                    Start building with Smartbuilder
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-all" />
                </Link>
            </div>
        </section>
    );
}
