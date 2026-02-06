"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function Pricing() {
    const plans = [
        {
            name: "Starter",
            price: "$39",
            desc: "For individual builders",
            features: ["MVP Builder", "Live preview", "Project memory", "Build history"],
            cta: "Start building",
            popular: false
        },
        {
            name: "Pro",
            price: "$99",
            desc: "For founders shipping real products",
            features: ["Advanced sandboxing", "Freeze Build™", "Code export", "Priority execution"],
            cta: "Start building",
            popular: true
        },
        {
            name: "Team",
            price: "$249",
            desc: "For teams and studios",
            features: ["Team access & permissions", "Shared projects", "Execution reporting", "Priority support"],
            cta: "Contact sales",
            popular: false
        }
    ];

    return (
        <section id="pricing" className="py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-indigo-500 font-bold uppercase tracking-[0.4em] text-xs mb-4">Pricing</h2>
                    <h2 className="text-4xl font-bold text-slate-900 mb-4">Simple pricing. Serious software.</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, i) => (
                        <div
                            key={i}
                            className={`relative p-10 rounded-[2rem] border flex flex-col transition-all duration-300 ${plan.popular ? 'bg-slate-900 text-white border-slate-900 shadow-2xl shadow-slate-900/20 scale-105 z-10' : 'bg-white text-slate-900 border-slate-100 hover:border-slate-200 hover:shadow-xl'}`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-10 -translate-y-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg">
                                    Most Popular
                                </div>
                            )}
                            <div className="mb-8">
                                <h3 className={`text-lg font-bold mb-2 ${plan.popular ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                                <div className="flex items-baseline space-x-1">
                                    <span className={`text-4xl font-black ${plan.popular ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                                    <span className={`font-medium ${plan.popular ? 'text-slate-400' : 'text-slate-500'}`}>/ month</span>
                                </div>
                                <p className={`mt-4 text-sm font-medium ${plan.popular ? 'text-slate-400' : 'text-slate-500'}`}>{plan.desc}</p>
                            </div>

                            <ul className="space-y-4 mb-10 flex-1">
                                {plan.features.map((f, j) => (
                                    <li key={j} className={`flex items-center space-x-3 text-sm ${plan.popular ? 'text-slate-300' : 'text-slate-600'}`}>
                                        <Check size={16} className={plan.popular ? 'text-indigo-400' : 'text-indigo-500'} />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link href="/signup" className={`w-full py-4 px-6 rounded-xl font-bold text-sm text-center transition-all ${plan.popular ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10'}`}>
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function FAQ() {
    const faqs = [
        { q: "Is this just another AI code generator?", a: "No. Smartbuilder is an execution system, not a chat tool. It manages the entire lifecycle from PRD to production-ready build." },
        { q: "Do I own my code?", a: "Yes. Always. You can export your code at any time and host it anywhere." },
        { q: "Can I deploy with Smartbuilder?", a: "Deployment is intentionally separate to prevent mistakes. We integrate with leading platforms like Vercel, Netlify, and Railway." },
        { q: "Who is this for?", a: "Founders, startups, and teams building real MVPs who care about architecture and long-term sustainability." },
    ];

    return (
        <section className="py-32 bg-slate-50 border-t border-slate-200">
            <div className="max-w-3xl mx-auto px-6">
                <h2 className="text-3xl font-bold text-slate-900 mb-16 text-center">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <FAQItem key={i} question={faq.q} answer={faq.a} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden hover:shadow-md transition-shadow">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
            >
                <span className="font-bold text-slate-900">{question}</span>
                {isOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-100 mt-2">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function FinalCTA() {
    return (
        <section className="py-40 relative overflow-hidden bg-slate-900">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-purple-900/50" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />

            <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tighter">Build something real.</h2>
                <p className="text-xl text-indigo-200 mb-12 max-w-2xl mx-auto">
                    Stop wrestling with tools that weren’t designed for real products.
                </p>
                <Link href="/signup" className="inline-flex items-center py-5 px-10 rounded-full bg-white text-slate-900 text-lg font-bold hover:bg-indigo-50 transition-colors shadow-xl shadow-indigo-900/20 group">
                    Start building with Smartbuilder
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </section>
    );
}

export function Footer() {
    return (
        <footer className="py-20 bg-white border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center font-bold text-white">
                        S
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900 uppercase">Smartbuilder</span>
                </div>

                <div className="flex items-center space-x-8 text-slate-500 text-sm font-medium">
                    <Link href="#" className="hover:text-slate-900 transition-colors">Twitter</Link>
                    <Link href="#" className="hover:text-slate-900 transition-colors">GitHub</Link>
                    <Link href="#" className="hover:text-slate-900 transition-colors">Privacy</Link>
                    <Link href="#" className="hover:text-slate-900 transition-colors">Terms</Link>
                </div>

                <div className="text-slate-400 text-xs font-medium uppercase tracking-widest">
                    © 2026 Smartbuilder Execution Ltd.
                </div>
            </div>
        </footer>
    );
}
