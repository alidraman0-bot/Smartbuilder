"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Database, Zap, Monitor, Search, History, FileText, Box, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import Link from 'next/link';

export function MVPBuilderSection() {
    const features = [
        { label: "Real project file system", icon: <Database /> },
        { label: "Incremental AI code generation", icon: <Zap /> },
        { label: "Sandboxed execution environment", icon: <Box /> },
        { label: "Live preview tied to real runtime", icon: <Monitor /> },
        { label: "Automatic error detection & recovery", icon: <Search /> },
        { label: "Versioned build history", icon: <History /> },
        { label: "Readable, exportable code", icon: <FileText /> },
    ];

    return (
        <section className="py-32 bg-slate-50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div className="relative z-10 order-2 lg:order-1">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-100 mb-8">
                        <Heart size={12} className="text-pink-500" />
                        <span className="text-[10px] font-bold text-pink-500 uppercase tracking-widest">The Core Experience</span>
                    </div>
                    <h2 className="text-5xl font-bold text-slate-900 mb-8 tracking-tight">The MVP Builder</h2>
                    <p className="text-xl text-slate-500 mb-12 leading-relaxed">
                        This is where real products are built. No black boxes. No mystery state. This is <span className="text-slate-900 underline decoration-pink-200 underline-offset-4">Base44-class building</span>, with better lifecycle discipline.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center space-x-3 text-slate-600 font-medium group"
                            >
                                <div className="text-indigo-400 group-hover:text-indigo-600 transition-colors">{f.icon}</div>
                                <span className="text-sm">{f.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="relative order-1 lg:order-2">
                    <div className="aspect-[4/3] bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200 overflow-hidden group relative z-10">
                        {/* Mock IDE Interface */}
                        <div className="h-full flex flex-col">
                            <div className="h-10 border-b border-slate-100 bg-slate-50 flex items-center px-4 space-x-2">
                                <div className="w-3 h-3 rounded-full bg-red-400/20 border border-red-400/40" />
                                <div className="w-3 h-3 rounded-full bg-amber-400/20 border border-amber-400/40" />
                                <div className="w-3 h-3 rounded-full bg-emerald-400/20 border border-emerald-400/40" />
                            </div>
                            <div className="flex-1 flex bg-white">
                                <div className="w-1/4 border-r border-slate-100 bg-slate-50/50 p-4 space-y-3">
                                    <div className="w-full h-2 bg-slate-200 rounded-full" />
                                    <div className="w-3/4 h-2 bg-slate-200 rounded-full" />
                                    <div className="w-1/2 h-2 bg-indigo-100 rounded-full" />
                                    <div className="w-4/5 h-2 bg-slate-200 rounded-full" />
                                </div>
                                <div className="flex-1 p-8 space-y-6">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: "70%" }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="h-4 bg-indigo-50 rounded-full"
                                    />
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: "90%" }}
                                        transition={{ duration: 1, delay: 0.7 }}
                                        className="h-4 bg-slate-100 rounded-full"
                                    />
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: "60%" }}
                                        transition={{ duration: 1, delay: 0.9 }}
                                        className="h-4 bg-purple-50 rounded-full"
                                    />
                                    <div className="mt-12 p-6 rounded-2xl bg-white border border-indigo-100 shadow-lg shadow-indigo-100/50 text-center">
                                        <Zap size={32} className="text-indigo-500 mx-auto mb-3 animate-pulse" />
                                        <p className="text-indigo-900/60 text-[10px] font-bold uppercase tracking-widest">Executing build...</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Float Card */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 1.2 }}
                            className="absolute bottom-8 right-8 p-5 rounded-2xl bg-white/90 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-[220px]"
                        >
                            <div className="flex items-center space-x-2 mb-2">
                                <ShieldCheck size={18} className="text-emerald-500" />
                                <span className="text-[10px] font-bold text-slate-800 uppercase tracking-tighter">Safety Check Passed</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium">Memory context preserved across 14 iterations.</p>
                        </motion.div>
                    </div>

                    {/* Background Blobs */}
                    <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-3xl pointer-events-none -z-0" />
                    <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-pink-100/50 rounded-full blur-3xl pointer-events-none -z-0" />
                </div>
            </div>
        </section>
    );
}

export function HowItWorks() {
    const steps = [
        { title: "Describe your intent", desc: "Start with an idea, PRD, or change request. Smartbuilder understands product intent, not just syntax." },
        { title: "Build incrementally", desc: "Only what’s necessary changes. Your app stays stable as it grows." },
        { title: "Preview in real time", desc: "See your product running — not mocked." },
        { title: "Freeze the build", desc: "Lock the result into a deployable artifact. You choose when it ships." },
    ];

    return (
        <section id="how-it-works" className="py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-20 text-center">Software building, simplified.</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {steps.map((s, i) => (
                        <div key={i} className="relative group">
                            <div className="text-6xl font-extrabold text-slate-100 mb-6 group-hover:text-indigo-50 transition-colors duration-300">{i + 1}</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">{s.title}</h3>
                            <p className="text-slate-500 leading-relaxed font-medium">{s.desc}</p>
                            {i < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-10 -right-6 text-slate-200">
                                    <ArrowRight size={24} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function Mission() {
    return (
        <section className="py-32 bg-slate-50 border-t border-slate-200/60">
            <div className="max-w-3xl mx-auto px-6 text-center">
                <h2 className="text-3xl font-bold text-slate-900 mb-10">We built Smartbuilder because founders deserve better tools.</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
                    {["Respect complexity", "Encourage good decisions", "Reduce risk", "Scale with ambition"].map((item, i) => (
                        <div key={i} className="text-indigo-500/80 text-xs font-bold uppercase tracking-widest bg-indigo-50 py-2 px-3 rounded-lg">{item}</div>
                    ))}
                </div>
                <p className="text-2xl text-slate-400 italic font-serif">
                    “Smartbuilder is for people building something that matters.”
                </p>
            </div>
        </section>
    );
}
