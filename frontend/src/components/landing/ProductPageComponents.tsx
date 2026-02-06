"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Database, Zap, Monitor, Search, History, FileText, Box, ArrowRight,
    ShieldCheck, Heart, Lock, Check, X, Layers, RefreshCcw, Ban,
    Terminal, User, Users, Eye, FileCode, GitBranch, Server, AlertCircle, Folder
} from 'lucide-react';
import Link from 'next/link';

export function ProductHero() {
    return (
        <section className="pt-40 pb-24 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 overflow-hidden">
            <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-slate-200 mb-8 shadow-sm"
                >
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-widest">Product</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]"
                >
                    Build real MVPs — with <br />
                    <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">control, structure, and confidence</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-xl text-slate-500 mb-12 max-w-3xl mx-auto leading-relaxed"
                >
                    Smartbuilder is an AI-powered MVP builder designed for founders and teams who want to ship real products — not demos, not experiments.
                    It turns ideas, PRDs, and prompts into production-grade web applications, while preserving structure, history, and safety at every step.
                </motion.p>
            </div >

            {/* Soft Background Gradients */}
            < div className="absolute top-20 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-300/20 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-300/20 to-transparent rounded-full blur-3xl pointer-events-none" />
        </section >
    );
}

export function ChatbotComparison() {
    const chatbotFlaws = [
        { text: "Lose context", icon: <Ban size={16} /> },
        { text: "Rewrite code unpredictably", icon: <RefreshCcw size={16} /> },
        { text: "Break between sessions", icon: <X size={16} /> },
        { text: "Mix building and deployment", icon: <Zap size={16} /> },
        { text: "Produce fragile demos", icon: <AlertCircle size={16} /> },
    ];

    const smartbuilderStrengths = [
        { text: "Orchestrates intent", icon: <Check size={16} /> },
        { text: "Preserves state", icon: <Database size={16} /> },
        { text: "Enforces structure", icon: <Layers size={16} /> },
        { text: "Separates build from deploy", icon: <ShieldCheck size={16} /> },
        { text: "Produces inspectable, reproducible software", icon: <FileCode size={16} /> },
    ];

    return (
        <section className="py-32 bg-white">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-bold text-slate-900 mb-6">Smartbuilder is not a chatbot</h2>
                    <p className="text-xl text-slate-500">Most AI builders are conversations. <span className="text-indigo-600 font-semibold">Smartbuilder is a system.</span></p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Chat-based tools */}
                    <div className="p-10 rounded-[2rem] bg-slate-50 border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-500 mb-8 flex items-center">
                            <span className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 mr-4">
                                <Terminal size={20} />
                            </span>
                            Chat-based tools
                        </h3>
                        <ul className="space-y-4">
                            {chatbotFlaws.map((item, i) => (
                                <li key={i} className="flex items-center text-slate-500 font-medium">
                                    <span className="mr-3 text-red-400">{item.icon}</span>
                                    {item.text}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Smartbuilder */}
                    <div className="p-10 rounded-[2rem] bg-white border border-indigo-100 shadow-xl shadow-indigo-500/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-bl-full -z-0 opacity-50" />
                        <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center relative z-10">
                            <span className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white mr-4 shadow-lg shadow-indigo-500/30">
                                <Server size={20} />
                            </span>
                            Smartbuilder
                        </h3>
                        <ul className="space-y-4 relative z-10">
                            {smartbuilderStrengths.map((item, i) => (
                                <li key={i} className="flex items-center text-slate-800 font-medium">
                                    <span className="mr-3 text-emerald-500">{item.icon}</span>
                                    {item.text}
                                </li>
                            ))}
                        </ul>
                        <div className="mt-10 pt-8 border-t border-slate-100 relative z-10">
                            <p className="text-center text-indigo-600 font-bold text-lg">Result: software you can actually trust.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function CoreProduct() {
    const features = [
        { title: "A real file system", desc: "(not hidden blobs)", icon: <Folder size={20} /> },
        { title: "An isolated sandbox runtime", desc: "", icon: <Box size={20} /> },
        { title: "Incremental, targeted code changes", desc: "", icon: <GitBranch size={20} /> },
        { title: "Live preview with hot reload", desc: "", icon: <Zap size={20} /> },
        { title: "Automatic error detection and recovery", desc: "", icon: <Search size={20} /> },
        { title: "Versioned build history", desc: "", icon: <History size={20} /> },
    ];

    return (
        <section className="py-32 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-100 mb-6">
                        <Heart size={12} className="text-pink-500" />
                        <span className="text-[10px] font-bold text-pink-500 uppercase tracking-widest">Core Product</span>
                    </div>
                    <h2 className="text-4xl font-bold text-slate-900 mb-4">The MVP Builder</h2>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">The MVP Builder is where ideas become running applications.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {features.map((f, i) => (
                        <div key={i} className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                                {f.icon}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">{f.title}</h3>
                            {f.desc && <p className="text-slate-400 text-sm">{f.desc}</p>}
                        </div>
                    ))}
                </div>

                <div className="max-w-3xl mx-auto p-8 rounded-3xl bg-white border border-slate-200 text-center">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">You always know:</h3>
                    <div className="flex justify-center space-x-8 md:space-x-16 text-slate-600 font-medium">
                        <span className="flex items-center"><Check size={16} className="text-emerald-500 mr-2" /> What changed</span>
                        <span className="flex items-center"><Check size={16} className="text-emerald-500 mr-2" /> Why it changed</span>
                        <span className="flex items-center"><Check size={16} className="text-emerald-500 mr-2" /> When it changed</span>
                    </div>
                    <p className="mt-8 text-slate-400 text-sm font-bold uppercase tracking-widest">Nothing happens silently.</p>
                </div>
            </div>
        </section>
    );
}

export function SafetySection() {
    return (
        <section className="py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-bold text-slate-900 mb-6">Build without fear</h2>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">Smartbuilder is designed to remove the two biggest fears founders have.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="p-10 rounded-[2rem] bg-slate-50 border border-slate-100">
                        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-8">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-6">1. “What if the AI breaks everything?”</h3>
                        <p className="text-xl font-bold text-slate-900 mb-6">It won’t.</p>
                        <ul className="space-y-4 text-slate-600">
                            <li className="flex items-center"><Check size={18} className="text-emerald-500 mr-3" /> Only modified files are touched</li>
                            <li className="flex items-center"><Check size={18} className="text-emerald-500 mr-3" /> Last stable build is always preserved</li>
                            <li className="flex items-center"><Check size={18} className="text-emerald-500 mr-3" /> One-click rollback is always available</li>
                        </ul>
                    </div>

                    <div className="p-10 rounded-[2rem] bg-slate-50 border border-slate-100">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-8">
                            <Server size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-6">2. “What if I deploy by accident?”</h3>
                        <p className="text-xl font-bold text-slate-900 mb-6">You can’t.</p>
                        <ul className="space-y-4 text-slate-600">
                            <li className="flex items-center"><Check size={18} className="text-emerald-500 mr-3" /> Building and deployment are intentionally separated</li>
                            <li className="flex items-center"><Check size={18} className="text-emerald-500 mr-3" /> Builds must be explicitly frozen before deployment</li>
                            <li className="flex items-center"><Check size={18} className="text-emerald-500 mr-3" /> Nothing ships unless you say so</li>
                        </ul>
                    </div>
                </div>

                <p className="text-center mt-16 text-slate-400 font-medium italic">This is how serious teams work.</p>
            </div>
        </section>
    );
}

export function LivePreview() {
    const features = [
        "Full Node.js runtime",
        "Framework-aware (Next.js, Vite, etc.)",
        "No external network access by default",
        "Mocked secrets and APIs",
        "Graceful error handling (no red screens)"
    ];

    return (
        <section className="py-32 bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 to-purple-900/30" />
            <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div>
                    <h2 className="text-4xl font-bold mb-6">Live Preview, done right</h2>
                    <p className="text-xl text-slate-400 mb-10">Every build runs inside a local-first sandbox.</p>
                    <ul className="space-y-4 mb-10">
                        {features.map((f, i) => (
                            <li key={i} className="flex items-center text-slate-300">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 mr-4" />
                                {f}
                            </li>
                        ))}
                    </ul>
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                        <h4 className="font-bold text-white mb-2">If something breaks:</h4>
                        <p className="text-slate-400 text-sm">“Preview paused — stabilizing build.”<br />The system auto-fixes or safely rolls back.</p>
                    </div>
                </div>
                <div className="relative">
                    <div className="aspect-video bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center shadow-2xl">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <Monitor size={32} className="text-indigo-400" />
                            </div>
                            <p className="text-slate-500 font-mono text-sm">Initializing sandbox environment...</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function FreezeBuild() {
    return (
        <section className="py-32 bg-white">
            <div className="max-w-5xl mx-auto px-6 text-center">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-100 mb-8">
                    <Lock size={12} className="text-cyan-600" />
                    <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest">Investor-grade control</span>
                </div>
                <h2 className="text-4xl font-bold text-slate-900 mb-6">Freeze Build™</h2>
                <p className="text-xl text-slate-500 mb-16">When your build is ready, you freeze it.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Freezing a build:</h3>
                        <ul className="space-y-4 text-slate-600">
                            <li className="flex items-center"><Check size={18} className="text-cyan-500 mr-3" /> Locks the entire codebase</li>
                            <li className="flex items-center"><Check size={18} className="text-cyan-500 mr-3" /> Generates an immutable artifact</li>
                            <li className="flex items-center"><Check size={18} className="text-cyan-500 mr-3" /> Tags it with PRD version, research snapshot, and timestamp</li>
                            <li className="flex items-center"><Check size={18} className="text-cyan-500 mr-3" /> Makes it ready for deployment</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Frozen builds:</h3>
                        <ul className="space-y-4 text-slate-600">
                            <li className="flex items-center"><Lock size={18} className="text-slate-400 mr-3" /> Cannot be edited</li>
                            <li className="flex items-center"><Lock size={18} className="text-slate-400 mr-3" /> Cannot drift</li>
                            <li className="flex items-center"><Check size={18} className="text-emerald-500 mr-3" /> Are always reproducible</li>
                        </ul>
                    </div>
                </div>

                <p className="mt-16 text-xl text-slate-400 font-medium italic">This is what turns an MVP into a real asset.</p>
            </div>
        </section>
    );
}

export function ProjectMemory() {
    const memories = [
        "Ideas and their evolution",
        "Market research snapshots",
        "Business plans and PRDs",
        "Build versions and changes",
        "Who made what decision, and when"
    ];

    return (
        <section className="py-32 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div className="order-2 lg:order-1">
                    <div className="grid grid-cols-1 gap-4">
                        {memories.map((m, i) => (
                            <div key={i} className="p-6 rounded-xl bg-white border border-slate-100 flex items-center shadow-sm">
                                <Database size={20} className="text-indigo-500 mr-4" />
                                <span className="text-slate-700 font-medium">{m}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="order-1 lg:order-2">
                    <h2 className="text-4xl font-bold text-slate-900 mb-6">Project Memory</h2>
                    <p className="text-lg text-indigo-600 font-semibold mb-6">What makes Smartbuilder different</p>
                    <p className="text-xl text-slate-500 mb-8 leading-relaxed">
                        Smartbuilder doesn’t just store files. <br />
                        <span className="text-slate-900 font-bold">It stores decisions over time.</span>
                    </p>
                    <div className="space-y-2 text-slate-600 font-medium">
                        <p>You never lose context.</p>
                        <p>You never lose progress.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function Transparency() {
    return (
        <section className="py-32 bg-white">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <h2 className="text-4xl font-bold text-slate-900 mb-12">Transparent by design</h2>
                <p className="text-xl text-slate-500 mb-12">Smartbuilder is not a black box.</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                    {["View the real file tree", "Inspect generated code", "See exactly what the AI changed", "Export your source at any time"].map((item, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center h-full">
                            <Eye size={24} className="text-slate-400 mb-4" />
                            <span className="text-sm text-slate-700 font-medium">{item}</span>
                        </div>
                    ))}
                </div>

                <h3 className="text-3xl font-bold text-slate-900">You own your code.<br /><span className="text-indigo-600">Always.</span></h3>
            </div>
        </section>
    );
}

export function Teams() {
    return (
        <section className="py-32 bg-slate-900 text-white">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <h2 className="text-4xl font-bold mb-16">Built for teams, not just solo founders</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                    {["Role-based access", "Draft vs locked artifacts", "Shared project history", "Executive visibility", "Audit-ready logs"].map((item, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4">
                                <Users size={20} className="text-indigo-400" />
                            </div>
                            <span className="text-sm font-medium text-slate-300">{item}</span>
                        </div>
                    ))}
                </div>
                <p className="mt-16 text-slate-400">Whether you’re solo or a growing team, the system stays calm and predictable.</p>
            </div>
        </section>
    );
}

export function Manifesto() {
    return (
        <section className="py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-20">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-8">Why Smartbuilder exists</h2>
                    <p className="text-lg text-slate-500 mb-6">We didn’t build Smartbuilder to be flashy.</p>
                    <p className="text-lg text-slate-500 mb-8">We built it because:</p>
                    <ul className="space-y-4 text-slate-700 font-medium mb-10">
                        <li className="flex items-center"><Check size={18} className="text-indigo-500 mr-3" /> Founders deserve tools they can trust</li>
                        <li className="flex items-center"><Check size={18} className="text-indigo-500 mr-3" /> AI should reduce anxiety, not increase it</li>
                        <li className="flex items-center"><Check size={18} className="text-indigo-500 mr-3" /> Shipping software should feel controlled, not chaotic</li>
                    </ul>
                    <p className="text-xl font-bold text-slate-900">Smartbuilder is infrastructure for builders who want to do things properly.</p>
                </div>
                <div className="bg-slate-50 p-10 rounded-[2rem] border border-slate-100">
                    <h2 className="text-3xl font-bold text-slate-900 mb-8">Who Smartbuilder is for</h2>
                    <ul className="space-y-4 text-slate-700 font-medium mb-12">
                        <li className="flex items-center"><User size={18} className="text-slate-400 mr-3" /> Founders building real MVPs</li>
                        <li className="flex items-center"><User size={18} className="text-slate-400 mr-3" /> Startups preparing for investors</li>
                        <li className="flex items-center"><User size={18} className="text-slate-400 mr-3" /> Teams prototyping production software</li>
                        <li className="flex items-center"><User size={18} className="text-slate-400 mr-3" /> Builders tired of fragile AI tools</li>
                    </ul>
                    <div className="space-y-4">
                        <p className="text-red-500 font-medium">If you want demos, Smartbuilder is not for you.</p>
                        <p className="text-emerald-600 font-bold text-xl">If you want real products, it is.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function ProductCTA() {
    return (
        <section className="py-40 bg-gradient-to-br from-slate-900 to-indigo-950 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <h2 className="text-5xl font-bold text-white mb-8">Start building with confidence</h2>
                <p className="text-xl text-indigo-200 mb-12">Stop fighting tools that weren’t built for real software.<br />Build your MVP with structure, safety, and control.</p>
                <Link href="/overview" className="inline-flex items-center py-5 px-10 rounded-full bg-white text-slate-900 text-lg font-bold hover:bg-indigo-50 transition-colors shadow-xl shadow-indigo-900/20 group">
                    Start building with Smartbuilder
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </section>
    );
}
