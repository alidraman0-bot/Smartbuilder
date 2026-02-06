"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, ArrowRight, Shield, Zap, TrendingUp, Lock, Users, Building, ShieldCheck, Database, History, FileOutput, RefreshCcw, Ban, Terminal, Box, Target, Rocket, Brain, Layers, Layout, Eye, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

// SECTION 1 — PRICING HERO
export function PricingHero() {
    return (
        <section className="pt-40 pb-24 bg-gradient-to-br from-white via-indigo-50/20 to-slate-50 relative overflow-hidden text-center">
            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
                        One platform to go from <br />
                        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">idea to deployed product</span>
                    </h1>
                    <p className="text-xl text-slate-500 mb-12 max-w-3xl mx-auto leading-relaxed">
                        Smartbuilder replaces fragmented tools, chaotic workflows, and fragile AI builders with a single execution system.
                        You’re not paying for features — you’re paying for <span className="text-slate-900 font-bold">clarity, speed, and control</span> across the entire product lifecycle.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}

// SECTION 2 — HOW SMARTBUILDER PRICES
export function PricingOverview() {
    const pricingItems = [
        { label: "Product lifecycle depth", icon: <Layers size={18} /> },
        { label: "Execution power", icon: <Zap size={18} /> },
        { label: "Organizational readiness", icon: <ShieldCheck size={18} /> },
    ];

    return (
        <section className="py-24 bg-white border-t border-slate-100">
            <div className="max-w-5xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-6 uppercase tracking-tight">How Smartbuilder prices</h2>
                        <p className="text-lg text-slate-500 mb-8 leading-relaxed">
                            Most tools charge for seats, tokens, or prompts. <br />
                            <span className="text-slate-900 font-bold">Smartbuilder charges for output value and ecosystem depth.</span>
                        </p>
                        <p className="text-xl font-bold text-indigo-600 italic">Because Smartbuilder is not a tool — it’s infrastructure.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {pricingItems.map((item, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center space-x-6">
                                <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-500">
                                    {item.icon}
                                </div>
                                <span className="text-lg font-bold text-slate-800">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

// SECTION 3 — PRICING GRID
export function PricingGrid() {
    const plans = [
        {
            name: "Starter",
            price: "$29",
            period: "/ month",
            desc: "For founders turning ideas into real direction",
            sub: "Everything needed to go from idea → validated plan.",
            includes: [
                "Idea workspace & structured idea cards",
                "Market research engine (TAM, competitors)",
                "AI-generated business plans",
                "AI-generated PRDs",
                "Saved ideas, plans, and documents",
                "Versioned edits (nothing gets lost)"
            ],
            notIncluded: [
                "MVP Builder",
                "Deployment",
                "Team collaboration"
            ],
            bestFor: "Early-stage founders, Ideation phase, Pre-build exploration",
            cta: "Start validating ideas →",
            color: "bg-slate-900",
            hover: "hover:bg-slate-800"
        },
        {
            name: "Builder",
            price: "$99",
            period: "/ month",
            desc: "For founders building real MVPs",
            sub: "Everything in Starter, plus full product execution.",
            popular: true,
            includes: [
                "Full MVP Builder (sandboxed, real apps)",
                "Live preview with hot reload",
                "Incremental, state-aware builds",
                "Automatic error detection & auto-fix",
                "Project memory (idea → PRD → code)",
                "Code transparency & file system view",
                "Freeze Build™ (immutable artifacts)",
                "Export source code anytime"
            ],
            notIncluded: [
                "Team permissions",
                "Advanced deployment controls"
            ],
            bestFor: "Solo founders, YC-style MVPs, Pre-seed startups",
            cta: "Build a real MVP →",
            color: "bg-indigo-600",
            hover: "hover:bg-indigo-700"
        },
        {
            name: "Pro",
            price: "$199",
            period: "/ month",
            desc: "For startups shipping investor-ready products",
            sub: "Everything in Builder, plus production readiness.",
            includes: [
                "Advanced MVP Builder capabilities",
                "Unlimited iterations per project",
                "Multiple active projects",
                "Deployment page access",
                "Domain management & SSL flow",
                "Environment separation (preview/prod)",
                "Rollbacks & version history",
                "Monitoring & health insights",
                "Executive-ready reports"
            ],
            bestFor: "Seed-stage startups, Founders raising capital",
            cta: "Ship with confidence →",
            color: "bg-slate-900",
            hover: "hover:bg-slate-800"
        },
        {
            name: "Team",
            price: "$399",
            period: "/ month",
            desc: "For teams building serious software together",
            sub: "Everything in Pro, plus collaboration & governance.",
            includes: [
                "Team access & permissions",
                "Shared projects & memory",
                "Role-based controls",
                "Activity & decision logs",
                "Compliance & readiness layer",
                "Multi-stakeholder visibility",
                "Priority support & onboarding"
            ],
            bestFor: "Startup teams, Agencies, Innovation labs",
            cta: "Build as a team →",
            color: "bg-slate-900",
            hover: "hover:bg-slate-800"
        }
    ];

    return (
        <section className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.map((p, i) => (
                        <div key={i} className={`p-8 rounded-[2.5rem] bg-white border ${p.popular ? 'border-indigo-200 ring-4 ring-indigo-50 shadow-2xl relative z-10' : 'border-slate-100 shadow-sm'} flex flex-col h-full`}>
                            {p.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-500/30">
                                    Most Popular
                                </div>
                            )}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{p.name}</h3>
                                <p className="text-sm text-slate-500 mb-6 font-medium h-10">{p.desc}</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold text-slate-900">{p.price}</span>
                                    <span className="text-slate-400 font-medium">{p.period}</span>
                                </div>
                            </div>

                            <p className="text-sm font-bold text-slate-800 mb-6">{p.sub}</p>

                            <div className="space-y-4 mb-8 flex-1">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Includes</p>
                                    {p.includes.map((f, j) => (
                                        <div key={j} className="flex items-start text-xs text-slate-500 font-medium">
                                            <Check className="w-3.5 h-3.5 text-emerald-500 mr-2.5 mt-0.5 shrink-0" />
                                            {f}
                                        </div>
                                    ))}
                                </div>
                                {p.notIncluded && (
                                    <div className="space-y-4 pt-4 border-t border-slate-50">
                                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Does NOT include</p>
                                        {p.notIncluded.map((f, j) => (
                                            <div key={j} className="flex items-start text-xs text-slate-400 font-medium">
                                                <X className="w-3.5 h-3.5 text-slate-200 mr-2.5 mt-0.5 shrink-0" />
                                                {f}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="pt-8 border-t border-slate-100 mt-auto">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Best for:</p>
                                <p className="text-xs text-slate-600 font-bold mb-8 leading-relaxed">{p.bestFor}</p>
                                <Link href="/overview" className={`block text-center py-4 px-6 rounded-2xl font-bold text-white transition-all shadow-lg ${p.color} ${p.hover}`}>
                                    {p.cta}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// SECTION 4 — VALUE SECTION
export function PricingValue() {
    const values = [
        {
            title: "One Source of Truth",
            desc: "Ideas, research, PRDs, code, and deployments all live together — permanently linked.",
            sub: "No context loss. No “what changed?” moments.",
            icon: <Brain />
        },
        {
            title: "From Idea to Running Software",
            desc: "Smartbuilder covers everything from idea creation to final monitoring.",
            sub: "No stitching tools together.",
            icon: <Rocket />
        },
        {
            title: "Safety by Design",
            desc: "Builds don’t deploy accidentally, code doesn’t get overwritten, and errors are stabilized automatically.",
            sub: "This is why investors trust it.",
            icon: <ShieldCheck />
        },
        {
            title: "Ownership & Portability",
            desc: "Export everything, freeze builds, and deploy anywhere. Leave anytime.",
            sub: "Smartbuilder never traps you.",
            icon: <Lock />
        }
    ];

    return (
        <section className="py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-bold text-slate-900 mb-6">What this pricing unlocks</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {values.map((v, i) => (
                        <div key={i} className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex flex-col group hover:bg-white hover:shadow-2xl hover:shadow-indigo-500/5 transition-all">
                            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-500 mb-8 group-hover:scale-110 transition-transform">
                                {v.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">{v.title}</h3>
                            <p className="text-slate-500 text-sm font-medium mb-4 leading-relaxed">{v.desc}</p>
                            <p className="text-indigo-600 text-xs font-bold italic">{v.sub}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// SECTION 5 — COMPARISON TABLE
export function PricingComparison() {
    const rows = [
        { feature: "Idea → MVP in one system", sm: true, other: false },
        { feature: "Market research included", sm: true, other: false },
        { feature: "PRD-driven builds", sm: true, other: false },
        { feature: "Real sandbox runtime", sm: true, other: false },
        { feature: "Deployment separation", sm: true, other: false },
        { feature: "Team-ready", sm: true, other: false },
        { feature: "Investor-grade artifacts", sm: true, other: false },
    ];

    return (
        <section className="py-32 bg-slate-50">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-slate-900 mb-4">Smartbuilder vs The World</h2>
                </div>
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="p-8 text-sm font-bold text-slate-400 uppercase tracking-widest">Capability</th>
                                <th className="p-8 text-sm font-bold text-indigo-600 uppercase tracking-widest text-center">Smartbuilder</th>
                                <th className="p-8 text-sm font-bold text-slate-400 uppercase tracking-widest text-center">Typical AI Builder</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, i) => (
                                <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                    <td className="p-8 text-slate-700 font-bold">{row.feature}</td>
                                    <td className="p-8 text-center">
                                        {row.sm ? (
                                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600">
                                                <Check size={18} />
                                            </div>
                                        ) : <X className="inline-block text-slate-200" size={18} />}
                                    </td>
                                    <td className="p-8 text-center text-red-400">
                                        {row.other ? <Check size={18} /> : <X size={18} className="inline-block opacity-30" />}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

// SECTION 6 — FAQ
export function DetailedPricingFAQ() {
    const faqs = [
        {
            q: "Is Smartbuilder just an AI app builder?",
            a: "No. It’s a full product execution platform that handles everything from initial idea validation to production monitoring."
        },
        {
            q: "Do I need to know how to code?",
            a: "No. But the system is transparent if you do—you can export every file and inspect the entire architecture anytime."
        },
        {
            q: "Can I start small and upgrade later?",
            a: "Yes. Your work carries forward across plans. All your ideas, PRDs, and builds are preserved regardless of tier."
        },
        {
            q: "Who is Smartbuilder NOT for?",
            a: "People who want quick demos, throwaway prototypes, or toy apps. It's built for founders shipping real software."
        }
    ];

    return (
        <section className="py-32 bg-white">
            <div className="max-w-4xl mx-auto px-6">
                <h2 className="text-3xl font-bold text-slate-900 mb-16 text-center">Platform FAQ</h2>
                <div className="space-y-6">
                    {faqs.map((f, i) => (
                        <div key={i} className="p-10 rounded-[2rem] bg-slate-50 border border-slate-100 group hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                                <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center mr-4 text-indigo-500 shadow-sm group-hover:bg-indigo-500 group-hover:text-white transition-colors">?</div>
                                {f.q}
                            </h3>
                            <p className="text-slate-500 leading-relaxed font-medium pl-12">{f.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// SECTION 8 — FINAL CTA
export function PricingFinalCTA() {
    return (
        <section className="py-40 bg-slate-900 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-black/80" />
            <div className="max-w-3xl mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-5xl font-extrabold mb-8 leading-tight">Build products the way <br />serious teams do.</h2>
                    <p className="text-xl text-slate-400 mb-12">
                        From idea to deployment — without chaos.
                    </p>
                    <Link href="/overview" className="inline-flex items-center py-5 px-12 rounded-full bg-indigo-600 text-white text-lg font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/30 group">
                        Start with Smartbuilder
                        <ArrowRight className="ml-2 group-hover:translate-x-1 transition-all" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
