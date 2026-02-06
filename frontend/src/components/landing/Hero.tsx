"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, FileCode, Folder, Play, CheckCircle2, Lock } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
    return (
        <section className="relative pt-40 pb-32 overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
            {/* Centered Content */}
            <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-black/5 mb-8 shadow-sm"
                >
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-xs font-semibold text-black/70">Version 2.0 now live</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-extrabold tracking-tight text-black mb-8 leading-[1.1]"
                >
                    From idea to <br />
                    <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">real MVP</span> — <br />
                    <span className="text-black/50">without losing control.</span>
                </motion.h1>

                {/* Description */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lg md:text-xl text-black/60 mb-4 max-w-3xl mx-auto leading-relaxed"
                >
                    Smartbuilder is an AI-powered MVP execution platform that turns ideas, PRDs, and product decisions into real, production-ready web apps — with structure, safety, and transparency.
                </motion.p>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-lg font-semibold text-black mb-12"
                >
                    Built for founders who intend to ship.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16"
                >
                    <Link href="/signup" className="px-8 py-4 rounded-full bg-black text-white font-semibold text-base hover:bg-black/90 transition-all shadow-lg hover:shadow-xl hover:scale-105 transform">
                        Start building
                    </Link>
                    <Link href="#how-it-works" className="text-black/70 hover:text-black transition-colors flex items-center font-semibold group text-base">
                        See how it works
                        <ChevronRight className="ml-1 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>

                {/* Hero Visual */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="relative max-w-4xl mx-auto"
                >
                    <div className="relative aspect-video bg-white rounded-3xl border border-black/10 shadow-2xl overflow-hidden">
                        <HeroAnimation />
                    </div>
                    {/* Soft glow underneath */}
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl -z-10" />
                </motion.div>
            </div>

            {/* Soft Background Gradients */}
            <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-300/30 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-300/30 to-transparent rounded-full blur-3xl pointer-events-none" />
        </section>
    );
}

function HeroAnimation() {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setStep((s) => (s + 1) % 6);
        }, 3500);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="w-full h-full flex flex-col font-mono text-[10px] md:text-xs">
            {/* Simulation Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-4">
                <div className="flex space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                </div>
                <div className="text-zinc-500 text-[10px] uppercase tracking-tighter">smartbuilder-v2.core</div>
                <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${step === 5 ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
                    <span className="text-zinc-500">{step === 5 ? 'STABLE' : 'EXECUTING'}</span>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-4 h-full relative overflow-hidden">
                {/* 1. Prompt Phase */}
                <AnimatePresence>
                    {step === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute inset-0 flex items-center justify-center z-10 p-8"
                        >
                            <div className="w-full max-w-md p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl">
                                <div className="flex items-center space-x-2 text-zinc-500 mb-3">
                                    <Play size={14} className="text-indigo-400" />
                                    <span className="uppercase tracking-widest text-[10px]">Describe intent</span>
                                </div>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 2, ease: "linear" }}
                                    className="text-white text-sm overflow-hidden whitespace-nowrap border-r-2 border-indigo-500 pr-1"
                                >
                                    "Build a SaaS landing page with elegant animations..."
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 2. File Tree Phase */}
                <div className="col-span-4 border-r border-white/5 pr-4 flex flex-col space-y-2 opacity-50">
                    <div className="flex items-center space-x-2 text-zinc-500">
                        <Folder size={12} />
                        <span>src</span>
                    </div>
                    <motion.div
                        animate={{ opacity: step >= 1 ? 1 : 0.3, x: step >= 1 ? 0 : -10 }}
                        className="flex items-center space-x-2 text-zinc-300 ml-4"
                    >
                        <Folder size={12} className="text-indigo-400" />
                        <span>components</span>
                    </motion.div>
                    <motion.div
                        animate={{ opacity: step >= 1 ? 1 : 0, x: step >= 1 ? 0 : -10 }}
                        className="flex items-center space-x-2 text-zinc-400 ml-8"
                    >
                        <FileCode size={12} />
                        <span>Hero.tsx</span>
                    </motion.div>
                    <motion.div
                        animate={{ opacity: step >= 1 ? 1 : 0, x: step >= 1 ? 0 : -10 }}
                        className="flex items-center space-x-2 text-zinc-400 ml-8"
                    >
                        <FileCode size={12} />
                        <span>Navbar.tsx</span>
                    </motion.div>
                    <motion.div
                        animate={{ opacity: step >= 1 ? 1 : 0.3, x: step >= 1 ? 0 : -10 }}
                        className="flex items-center space-x-2 text-zinc-300 ml-4"
                    >
                        <Folder size={12} className="text-purple-400" />
                        <span>app</span>
                    </motion.div>
                    <motion.div
                        animate={{ opacity: step >= 1 ? 1 : 0, x: step >= 1 ? 0 : -10 }}
                        className="flex items-center space-x-2 text-zinc-400 ml-8"
                    >
                        <FileCode size={12} />
                        <span>page.tsx</span>
                    </motion.div>
                </div>

                {/* 3. Code Generation Phase */}
                <div className="col-span-8 overflow-hidden relative">
                    <AnimatePresence mode="wait">
                        {step >= 2 && step <= 3 && (
                            <motion.div
                                key="code"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-1.5"
                            >
                                {[...Array(15)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: `${Math.random() * 60 + 20}%`, opacity: 1 }}
                                        transition={{ delay: i * 0.05, duration: 0.5 }}
                                        className={`h-1.5 rounded-full ${i % 3 === 0 ? 'bg-indigo-500/40' : i % 2 === 0 ? 'bg-purple-500/40' : 'bg-zinc-700/40'}`}
                                    />
                                ))}
                            </motion.div>
                        )}

                        {/* 4. Live Preview Phase */}
                        {step === 4 && (
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="absolute inset-0 flex flex-col p-2 bg-zinc-950 rounded-lg border border-white/10"
                            >
                                <div className="flex items-center space-x-1.5 pb-2 mb-2 border-b border-white/5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                    <div className="px-2 py-0.5 rounded bg-white/5 text-[6px] text-zinc-500">localhost:3000</div>
                                </div>
                                <div className="flex-1 rounded-sm bg-zinc-900 flex items-center justify-center relative overflow-hidden">
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center"
                                    >
                                        <div className="w-12 h-1 bg-indigo-500 mx-auto mb-2 rounded-full" />
                                        <div className="w-16 h-1 bg-zinc-700 mx-auto rounded-full" />
                                    </motion.div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent" />
                                </div>
                            </motion.div>
                        )}

                        {/* 5. Freeze Phase */}
                        {step === 5 && (
                            <motion.div
                                key="freeze"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute inset-0 flex items-center justify-center"
                            >
                                <div className="text-center">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", damping: 10 }}
                                        className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mb-4 mx-auto"
                                    >
                                        <Lock className="text-emerald-500" size={32} />
                                    </motion.div>
                                    <motion.h3
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-xl font-bold text-white mb-2"
                                    >
                                        Build Frozen
                                    </motion.h3>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest"
                                    >
                                        Ready for deployment
                                    </motion.p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer Info */}
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[8px] text-zinc-600 uppercase tracking-widest">
                <span>Iteration 42</span>
                <div className="flex space-x-4">
                    <span className="flex items-center"><CheckCircle2 size={8} className="mr-1 text-emerald-500" /> Context Match</span>
                    <span className="flex items-center"><CheckCircle2 size={8} className="mr-1 text-emerald-500" /> Type Safety</span>
                </div>
            </div>
        </div>
    );
}
