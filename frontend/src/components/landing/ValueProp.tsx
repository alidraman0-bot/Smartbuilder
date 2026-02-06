"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Ban, RefreshCcw, Layers, Zap, Search, AlertCircle } from 'lucide-react';

export function TheHook() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-orange-500 font-bold uppercase tracking-[0.3em] text-xs mb-8"
                >
                    Outcome &gt; Speed
                </motion.p>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 leading-tight"
                >
                    Most AI builders optimize for speed.<br />
                    <span className="relative inline-block">
                        <span className="relative z-10">Smartbuilder optimizes for outcome.</span>
                        <span className="absolute bottom-2 left-0 w-full h-3 bg-orange-200/50 -z-0 rounded-full"></span>
                    </span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-slate-500 leading-relaxed"
                >
                    Speed without structure creates fragile software. Smartbuilder was built for people who care about what happens after the demo.
                </motion.p>
            </div>

            {/* Soft background blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-100/40 rounded-full blur-3xl pointer-events-none" />
        </section>
    );
}

export function SocialProof() {
    const logos = ["Startup teams", "Indie founders", "Product studios"];
    return (
        <section className="py-12 border-y border-slate-100 bg-slate-50/50">
            <div className="max-w-7xl mx-auto px-6">
                <p className="text-center text-slate-400 text-sm mb-10 font-medium uppercase tracking-wider">Trusted by builders creating real software</p>
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    {logos.map((logo, i) => (
                        <span key={i} className="text-xl md:text-2xl font-bold tracking-tighter text-slate-800">{logo}</span>
                    ))}
                </div>
                <div className="mt-16 flex justify-center">
                    <div className="max-w-2xl p-8 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 text-center relative">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-serif text-xl">"</div>
                        <p className="text-slate-600 text-lg font-medium italic">“This is the first AI builder that feels like real engineering.”</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function TheProblem() {
    const problems = [
        { text: "Lose context between messages", icon: <Ban size={18} /> },
        { text: "Rewrite working code unexpectedly", icon: <RefreshCcw size={18} /> },
        { text: "Collapse complex logic into a single prompt", icon: <Layers size={18} /> },
        { text: "Mix building and deployment", icon: <Zap size={18} /> },
        { text: "Produce software that looks finished — but isn’t", icon: <Search size={18} /> },
    ];

    return (
        <section className="py-32 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div className="order-2 lg:order-1">
                    <div className="inline-block px-3 py-1 rounded-full bg-red-50 text-red-500 text-xs font-bold uppercase tracking-widest mb-6 border border-red-100">The Problem</div>
                    <h2 className="text-4xl font-bold text-slate-900 mb-6">AI made building easy.<br /><span className="text-slate-400">It didn’t make building right.</span></h2>
                    <p className="text-xl text-slate-500 mb-12">Today’s AI builders are impressive in <span className="text-indigo-600 font-semibold">demos</span>. They’re risky in <span className="text-red-500 font-semibold">production</span>.</p>

                    <div className="space-y-4">
                        {problems.map((p, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center space-x-4 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all"
                            >
                                <div className="text-red-400 bg-red-50 p-2 rounded-lg">{p.icon}</div>
                                <span className="text-slate-700 font-medium">{p.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="relative order-1 lg:order-2">
                    <div className="aspect-square rounded-[2.5rem] bg-gradient-to-br from-orange-50 to-rose-50 border border-orange-100/50 overflow-hidden flex items-center justify-center shadow-2xl shadow-orange-500/10">
                        <div className="text-center p-12 relative z-10">
                            <div className="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-8 text-orange-500 transform -rotate-6">
                                <AlertCircle size={48} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-3">The "Demo" Trap</h3>
                            <p className="text-slate-500 leading-relaxed">Pretty interfaces hiding non-existent logic and broken architectures. We've all seen it.</p>
                        </div>

                        {/* Decorative circles */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200/20 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-200/20 rounded-full blur-3xl" />
                    </div>
                </div>
            </div>
        </section>
    );
}

export function Philosophy() {
    return (
        <section className="py-32 bg-slate-50 border-y border-slate-200/60">
            <div className="max-w-5xl mx-auto px-6 text-center">
                <h2 className="text-indigo-500 font-bold uppercase tracking-[0.4em] text-xs mb-12">Structure Over Conversation</h2>
                <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-16 tracking-tight leading-[1.1]">Software deserves structure.</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {["Explicit", "Versioned", "Reproducible"].map((item, i) => (
                        <div key={i} className="p-10 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/40 hover:-translate-y-1 transition-transform duration-300">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mx-auto mb-6">
                                <CheckCircle2 size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">{item}</h3>
                        </div>
                    ))}
                </div>

                <p className="mt-16 text-2xl text-slate-400 font-medium italic font-serif">
                    “Because real products aren’t created in one prompt.”
                </p>
            </div>
        </section>
    );
}

function CheckCircle2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}
