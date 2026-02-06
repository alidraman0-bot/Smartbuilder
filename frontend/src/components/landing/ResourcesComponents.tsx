"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen, Sparkles, Target, Zap, Search, ShieldCheck,
    Rocket, GraduationCap, Users, RefreshCcw, ArrowRight,
    Check, Layout, Code, Database, FileText, Lock, Eye,
    MessageSquare, AlertCircle, TrendingUp, Info
} from 'lucide-react';
import Link from 'next/link';

// HERO SECTION
export function ResourcesHero() {
    return (
        <section className="pt-40 pb-24 bg-gradient-to-br from-white via-indigo-50/20 to-slate-50 relative overflow-hidden">
            <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
                        Learn how real <br />
                        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">products are built</span>
                    </h1>
                    <p className="text-xl text-slate-500 mb-12 max-w-3xl mx-auto leading-relaxed">
                        Smartbuilder Resources help you understand how MVPs should be built, why structure matters, and how to avoid common startup mistakes.
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <button className="py-4 px-8 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
                            Explore resources
                        </button>
                        <button className="py-4 px-8 rounded-full bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all">
                            View documentation
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

// RESOURCE CATEGORIES
export function ResourceCategories() {
    const categories = [
        {
            title: " Product Thinking",
            desc: "Learn how to turn ideas into real, testable products.",
            items: ["From idea → MVP → deployment", "Writing effective PRDs", "Feature prioritization", "Avoiding overbuilding"],
            cta: "View Product Guides →",
            icon: <Target className="text-emerald-500" />
        },
        {
            title: " MVP Building",
            desc: "Everything about building inside Smartbuilder.",
            items: ["How the MVP Builder works", "Sandbox & preview behavior", "Iteration best practices", "Freezing builds correctly"],
            cta: "Learn how to build →",
            icon: <Zap className="text-indigo-500" />
        },
        {
            title: " Market Research & Validation",
            desc: "Make sure you’re building the right thing.",
            items: ["Market sizing basics", "Competitive analysis", "Validation frameworks", "Using Smartbuilder research outputs"],
            cta: "Explore research →",
            icon: <Search className="text-amber-500" />
        },
        {
            title: " Architecture & Engineering",
            desc: "For technical founders and teams.",
            items: ["How Smartbuilder structures apps", "Build vs Deploy separation", "Why immutable artifacts matter", "Security & sandboxing concepts"],
            cta: "Read architecture →",
            icon: <Database className="text-blue-500" />
        },
        {
            title: " Deployment & Launch",
            desc: "Shipping without fear.",
            items: ["How deployment works", "Domain & SSL setup", "Production readiness checklist", "Monitoring & rollback strategies"],
            cta: "Prepare for launch →",
            icon: <Rocket className="text-purple-500" />
        }
    ];

    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories.map((cat, i) => (
                        <div key={i} className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex flex-col h-full group hover:bg-white hover:shadow-2xl hover:shadow-indigo-500/5 transition-all">
                            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                {cat.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">{cat.title}</h3>
                            <p className="text-slate-500 font-medium mb-8 leading-relaxed">{cat.desc}</p>
                            <ul className="space-y-4 mb-10 flex-1">
                                {cat.items.map((item, j) => (
                                    <li key={j} className="flex items-center text-sm text-slate-600 font-medium">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-4" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Link href="#" className="text-indigo-600 font-bold hover:text-indigo-700 inline-flex items-center group/link">
                                {cat.cta}
                                <ArrowRight size={16} className="ml-2 group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// FEATURED GUIDES
export function FeaturedGuides() {
    const guides = [
        {
            title: "How to Build an MVP Investors Actually Trust",
            desc: "A practical guide to building something demo-worthy and inspectable.",
            bullets: ["What investors look for", "Common red flags", "How Smartbuilder solves them"],
            cta: "Read guide →"
        },
        {
            title: "Why Most AI Builders Fail in Production",
            desc: "A breakdown of why chat-based tools break — and how structured builders win.",
            cta: "Read guide →"
        },
        {
            title: "From PRD to Real Software (Without Chaos)",
            desc: "How Smartbuilder turns product requirements into controlled execution.",
            cta: "Read guide →"
        }
    ];

    return (
        <section className="py-32 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-3xl font-bold text-slate-900 mb-16">Featured Guides</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {guides.map((guide, i) => (
                        <div key={i} className="p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm flex flex-col">
                            <h3 className="text-2xl font-bold text-slate-900 mb-6 leading-tight">{guide.title}</h3>
                            <p className="text-slate-500 font-medium mb-8 leading-relaxed max-w-xs">{guide.desc}</p>
                            {guide.bullets && (
                                <ul className="space-y-3 mb-10">
                                    {guide.bullets.map((b, j) => (
                                        <li key={j} className="flex items-center text-sm text-slate-600">
                                            <Check size={14} className="text-emerald-500 mr-3" />
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <Link href="#" className="mt-auto text-indigo-600 font-bold hover:text-indigo-700">
                                {guide.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// DEEP DIVES
export function DeepDives() {
    const dives = [
        {
            title: "The Smartbuilder Build Lifecycle",
            desc: "Understand iteration, validation, freezing, and deployment handoff. This explains why Smartbuilder feels stable.",
            cta: "Read deep dive →"
        },
        {
            title: "Freeze Build™ Explained",
            desc: "Why immutable artifacts matter for teams, investors, and long-term maintenance.",
            cta: "Read deep dive →"
        },
        {
            title: "Build vs Deploy: Why We Separate Them",
            desc: "A foundational philosophy behind Smartbuilder and why mixing them causes friction.",
            cta: "Read deep dive →"
        }
    ];

    return (
        <section className="py-32 bg-white">
            <div className="max-w-5xl mx-auto px-6">
                <h2 className="text-3xl font-bold text-slate-900 mb-16">Deep Dives</h2>
                <div className="space-y-8">
                    {dives.map((dive, i) => (
                        <div key={i} className="p-12 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                            <div className="max-w-xl">
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">{dive.title}</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">{dive.desc}</p>
                            </div>
                            <Link href="#" className="text-indigo-600 font-bold hover:text-indigo-700 whitespace-nowrap">
                                {dive.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// DOCUMENTATION & REFERENCE
export function DocsAndReference() {
    return (
        <section className="py-32 bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-black/80" />
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <div className="p-12 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl">
                        <FileText size={32} className="text-indigo-400 mb-8" />
                        <h3 className="text-3xl font-bold mb-6">Official Documentation</h3>
                        <p className="text-slate-400 mb-10 text-lg leading-relaxed">For builders who want precision. Explore references for the MVP Builder, project structure, and build states.</p>
                        <ul className="grid grid-cols-2 gap-4 mb-12 text-sm text-slate-300 font-medium">
                            <li className="flex items-center"><div className="w-1 h-1 rounded-full bg-indigo-500 mr-3" /> MVP Builder reference</li>
                            <li className="flex items-center"><div className="w-1 h-1 rounded-full bg-indigo-500 mr-3" /> Project structure</li>
                            <li className="flex items-center"><div className="w-1 h-1 rounded-full bg-indigo-500 mr-3" /> Build states</li>
                            <li className="flex items-center"><div className="w-1 h-1 rounded-full bg-indigo-500 mr-3" /> Error handling</li>
                        </ul>
                        <button className="py-4 px-8 rounded-full bg-white text-slate-900 font-bold hover:bg-slate-100 transition-all">
                            View documentation
                        </button>
                    </div>
                    <div className="p-12 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col justify-center">
                        <Code size={32} className="text-emerald-400 mb-8" />
                        <h3 className="text-3xl font-bold mb-6">API & Integrations</h3>
                        <p className="text-slate-400 mb-10 text-lg leading-relaxed">Connect Smartbuilder to your existing stack. Learn about deployment platforms and CI/CD concepts.</p>
                        <button className="py-4 px-8 rounded-full border border-white/20 text-white font-bold hover:bg-white/5 transition-all self-start">
                            View integrations
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

// FOUNDER EDUCATION
export function FounderEducation() {
    return (
        <section className="py-32 bg-white">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Founder Education</h2>
                    <p className="text-slate-500 font-medium">Non-technical friendly guides to building software.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="p-12 rounded-[3rem] bg-slate-50 border border-slate-100">
                        <GraduationCap size={40} className="text-indigo-500 mb-8" />
                        <h3 className="text-2xl font-bold text-slate-900 mb-6">For Non-Technical Founders</h3>
                        <p className="text-slate-500 font-medium mb-10 leading-relaxed">Plain-English explanations of what code structure means, why previews break, and how to work with technical teammates.</p>
                        <Link href="#" className="py-4 px-8 rounded-full bg-white border border-slate-200 text-slate-900 font-bold hover:bg-slate-50 transition-all inline-block">
                            Start learning
                        </Link>
                    </div>
                    <div className="p-12 rounded-[3rem] bg-indigo-50/50 border border-indigo-100">
                        <Users size={40} className="text-indigo-600 mb-8" />
                        <h3 className="text-2xl font-bold text-slate-900 mb-6">For First-Time Founders</h3>
                        <p className="text-slate-500 font-medium mb-10 leading-relaxed">Avoid mistakes like overbuilding, shipping demos, mixing build & deploy, or losing context mid-project.</p>
                        <Link href="#" className="py-4 px-8 rounded-full bg-white border border-slate-200 text-slate-900 font-bold hover:bg-slate-50 transition-all inline-block">
                            Read founder guides
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

// COMMUNITY & UPDATES
export function CommunityUpdates() {
    return (
        <section className="py-32 bg-slate-50">
            <div className="max-w-4xl mx-auto px-6">
                <div className="p-12 rounded-[3rem] bg-white border border-slate-100 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Product Updates</h3>
                            <p className="text-slate-500 font-medium">Transparent, changelog-style updates.</p>
                        </div>
                        <Link href="#" className="text-indigo-600 font-bold hover:text-indigo-700">
                            View updates →
                        </Link>
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="text-xs font-bold text-slate-400 mt-1 whitespace-nowrap">JAN 28</div>
                            <div className="text-slate-600 font-medium">Improved sandbox isolation for Next.js builds</div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="text-xs font-bold text-slate-400 mt-1 whitespace-nowrap">JAN 24</div>
                            <div className="text-slate-600 font-medium">Enhanced project memory compression</div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="text-xs font-bold text-slate-400 mt-1 whitespace-nowrap">JAN 20</div>
                            <div className="text-slate-600 font-medium">Freeze Build™ stability improvements</div>
                        </div>
                    </div>
                    <div className="mt-16 pt-12 border-t border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Case Studies</h3>
                            <p className="text-slate-500 text-sm">How founders built real MVPs.</p>
                        </div>
                        <span className="text-slate-400 text-sm font-bold uppercase tracking-widest italic">Coming soon</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

// RESOURCES FINAL CTA
export function ResourcesFinalCTA() {
    return (
        <section className="py-40 bg-white text-center">
            <div className="max-w-3xl mx-auto px-6">
                <h2 className="text-5xl font-extrabold text-slate-900 mb-8 leading-tight">Ready to build something real?</h2>
                <p className="text-xl text-slate-500 mb-12">
                    Resources teach you how. <br />
                    Smartbuilder gives you the system.
                </p>
                <Link href="/overview" className="inline-flex items-center py-5 px-12 rounded-full bg-slate-900 text-white text-lg font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 group">
                    Start building with Smartbuilder
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-all" />
                </Link>
            </div>
        </section>
    );
}
