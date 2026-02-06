"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, TrendingUp, Lock, Check, X, Box, Database, MonitorPlay, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export function WhatIsSmartbuilder() {
    const features = [
        { title: "Translate ideas into real architecture", description: "Not just code snippets, but a cohesive system design.", icon: <Database /> },
        { title: "Build incrementally, not destructively", description: "Every change respects the existing foundation.", icon: <Box /> },
        { title: "Preview real execution, not mockups", description: "See your app running in a live sandbox environment.", icon: <MonitorPlay /> },
        { title: "Decide when to deploy — safely", description: "Decouple building from deployment for total control.", icon: <ShieldCheck /> },
    ];

    return (
        <section className="py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-20 text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Smartbuilder is an AI-native MVP execution platform.</h2>
                    <p className="text-xl text-slate-500 max-w-2xl">This is AI for shipping, not experimenting.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-8 rounded-3xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-indigo-500 mb-6 shadow-sm group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                {f.icon}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-3">{f.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center">
                    <Link href="/product" className="inline-flex items-center text-indigo-600 font-bold hover:text-indigo-700 group">
                        Learn more about how it works
                        <TrendingUp size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

export function Comparison() {
    const oldWay = ["Prompt → rewrite → hope", "Fragile previews", "No memory", "No rollback", "No control"];
    const smartbuilderWay = ["Incremental builds", "Persistent project memory", "Live runtime preview", "Versioned history", "Deployment separated by design"];

    return (
        <section className="py-32 bg-slate-50 overflow-hidden relative">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-bold text-slate-900 mb-4">Result: calm, predictable progress.</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Old Way */}
                    <div className="p-12 rounded-3xl bg-white border border-slate-100 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                        <h3 className="text-xl font-bold text-slate-500 mb-10 flex items-center">
                            <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 mr-4">
                                <X size={20} />
                            </span>
                            The old way
                        </h3>
                        <ul className="space-y-6">
                            {oldWay.map((item, i) => (
                                <li key={i} className="flex items-center text-slate-500 text-lg">
                                    <div className="w-2 h-2 rounded-full bg-slate-200 mr-4" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Smartbuilder Way */}
                    <div className="p-12 rounded-3xl bg-white border border-indigo-100 shadow-2xl shadow-indigo-500/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-bl-full -z-0 opacity-50" />

                        <h3 className="text-xl font-bold text-slate-900 mb-10 flex items-center relative z-10">
                            <span className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white mr-4 shadow-lg shadow-indigo-500/30">
                                <Check size={20} />
                            </span>
                            The Smartbuilder way
                        </h3>
                        <ul className="space-y-6 relative z-10">
                            {smartbuilderWay.map((item, i) => (
                                <li key={i} className="flex items-center text-slate-800 text-lg font-medium">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        whileInView={{ scale: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="w-2 h-2 rounded-full bg-indigo-500 mr-4"
                                    />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function CoreBenefits() {
    const benefits = [
        { title: "Build with confidence", desc: "Your MVP evolves safely. No surprises.", icon: <Shield size={24} /> },
        { title: "Move faster — sustainably", desc: "Smartbuilder removes rework, not rigor.", icon: <Zap size={24} /> },
        { title: "Investor-ready by default", desc: "Clean structure. Clear execution history. Real code.", icon: <TrendingUp size={24} /> },
        { title: "Control every release", desc: "Nothing ships unless you decide it does.", icon: <Lock size={24} /> },
    ];

    return (
        <section className="py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {benefits.map((b, i) => (
                        <div key={i} className="space-y-6 p-6 rounded-2xl hover:bg-slate-50 transition-colors">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">{b.icon}</div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{b.title}</h3>
                                <p className="text-slate-500 leading-relaxed font-medium">{b.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}


