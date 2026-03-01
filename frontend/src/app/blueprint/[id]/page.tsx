"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
    Download,
    Share2,
    Link as LinkIcon,
    CheckCircle,
    FileText,
    Target,
    Users,
    TrendingUp,
    Layers,
    Cpu,
    Twitter,
    Linkedin,
    ExternalLink,
    ChevronRight,
    Search,
    Compass
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BlueprintData {
    startup_name: string;
    overview: string;
    problem: string;
    solution: string;
    market_size: string;
    target_customers: string;
    revenue_model: string;
    competitive_landscape: string;
    mvp_features: string;
    tech_architecture: string;
    is_public: boolean;
    share_token: string;
    created_at?: string;
}

export default function BlueprintPage() {
    const { id } = useParams();
    const [blueprint, setBlueprint] = useState<BlueprintData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchBlueprint = async () => {
            try {
                const res = await fetch(`/api/blueprint/share/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setBlueprint(data);
                } else {
                    setError("Blueprint not found or not public.");
                }
            } catch (err) {
                setError("Failed to load blueprint.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchBlueprint();
    }, [id]);

    const handleCopyLink = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleExportPDF = () => {
        window.print();
    };

    const shareOnTwitter = () => {
        const text = `Check out this startup blueprint for ${blueprint?.startup_name} on Smartbuilder!`;
        const url = window.location.href;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    };

    const shareOnLinkedIn = () => {
        const url = window.location.href;
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">Studying Intelligence...</span>
                </div>
            </div>
        );
    }

    if (error || !blueprint) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd]">
                <div className="text-center space-y-4 max-w-sm px-6">
                    <h1 className="text-xl font-bold text-black border-b border-black pb-2">Access Denied</h1>
                    <p className="text-gray-500 text-sm leading-relaxed">{error || "This startup memo is private or does not exist."}</p>
                    <button onClick={() => window.location.href = '/'} className="text-xs font-bold uppercase tracking-widest text-black underline underline-offset-4">Return Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fdfdfd] text-[#1a1a1a] selection:bg-black selection:text-white pb-32">
            {/* Minimalist Floating Nav */}
            <nav className="fixed top-0 inset-x-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 print:hidden transition-all">
                <div className="max-w-4xl mx-auto h-full px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                            <FileText size={12} className="text-white" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black">Venture Intelligence</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExportPDF}
                            className="group p-2 text-gray-400 hover:text-black transition-colors"
                            title="Download Memo"
                        >
                            <Download size={18} />
                        </button>
                        <button
                            onClick={handleCopyLink}
                            className={cn(
                                "flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all",
                                copied ? "bg-emerald-500 border-emerald-500 text-white" : "border-black text-black hover:bg-black hover:text-white"
                            )}
                        >
                            {copied ? <CheckCircle size={12} /> : <LinkIcon size={12} />}
                            <span>{copied ? "Copied" : "Share Link"}</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Document Container */}
            <main className="max-w-3xl mx-auto px-8 pt-32 space-y-20 font-serif" ref={printRef}>

                {/* Executive Header */}
                <header className="space-y-8 pb-12 border-b border-gray-100">
                    <div className="flex items-end justify-between gap-4">
                        <div className="space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 font-sans">Internal Research Memo</span>
                            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-black leading-[0.9] font-sans italic">
                                {blueprint.startup_name}
                            </h1>
                        </div>
                        <div className="text-right font-sans">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Document No.</p>
                            <p className="text-xs font-mono font-bold text-black">{blueprint.share_token.slice(0, 8).toUpperCase()}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 font-sans border-t border-gray-50">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-300">Date/</span>
                            <span className="text-black">{new Date(blueprint.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-300">Author/</span>
                            <span className="text-black">Smartbuilder AI</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-300">Classification/</span>
                            <span className="px-1.5 py-0.5 bg-black text-white text-[8px]">PROPRIETARY</span>
                        </div>
                    </div>
                </header>

                {/* Summary / Overview */}
                <section className="space-y-6">
                    <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-gray-400 font-sans border-l-2 border-black pl-4">01. Investment Thesis</h2>
                    <p className="text-2xl text-gray-800 leading-snug font-medium italic">
                        "{blueprint.overview}"
                    </p>
                </section>

                {/* Core Memo Sections */}
                <div className="space-y-24">
                    {/* Problem & Solution */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <section className="space-y-6">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 font-sans">Market Friction</h3>
                            <div className="space-y-4">
                                <h4 className="text-lg font-bold text-black font-sans leading-tight">The Problem Space</h4>
                                <p className="text-base text-gray-600 leading-relaxed">{blueprint.problem}</p>
                            </div>
                        </section>
                        <section className="space-y-6">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 font-sans">Value Proposition</h3>
                            <div className="space-y-4">
                                <h4 className="text-lg font-bold text-black font-sans leading-tight">The Solution Architecture</h4>
                                <p className="text-base text-gray-600 leading-relaxed">{blueprint.solution}</p>
                            </div>
                        </section>
                    </div>

                    {/* Market & Customers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <section className="space-y-6">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 font-sans">Market Dynamics</h3>
                            <div className="space-y-4">
                                <h4 className="text-lg font-bold text-black font-sans leading-tight">Addressable Size</h4>
                                <p className="text-base text-gray-600 leading-relaxed">{blueprint.market_size}</p>
                            </div>
                        </section>
                        <section className="space-y-6">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 font-sans">Persona Profile</h3>
                            <div className="space-y-4">
                                <h4 className="text-lg font-bold text-black font-sans leading-tight">Target Segments</h4>
                                <p className="text-base text-gray-600 leading-relaxed">{blueprint.target_customers}</p>
                            </div>
                        </section>
                    </div>

                    {/* Revenue & Strategy */}
                    <section className="space-y-8 bg-gray-50 p-10 rounded-sm border border-gray-100">
                        <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-gray-400 font-sans border-l-2 border-black pl-4">02. Economic Flywheel</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-black font-sans uppercase tracking-widest">Revenue Model</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">{blueprint.revenue_model}</p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-black font-sans uppercase tracking-widest">Go-to-Market Approach</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">{blueprint.competitive_landscape}</p>
                            </div>
                        </div>
                    </section>

                    {/* Product Features */}
                    <section className="space-y-8">
                        <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-gray-400 font-sans border-l-2 border-black pl-4">03. Product Core</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                            {blueprint.mvp_features.split(',').map((feature, i) => (
                                <div key={i} className="flex gap-4 p-5 items-start border-b border-gray-100 group hover:bg-gray-50 transition-colors">
                                    <span className="text-[10px] font-mono text-gray-300 group-hover:text-black transition-colors">{String(i + 1).padStart(2, '0')}</span>
                                    <span className="text-sm font-bold text-gray-800 tracking-tight">{feature.trim()}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Tech Architecture */}
                    <section className="space-y-6">
                        <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-gray-400 font-sans border-l-2 border-black pl-4">04. Engineering Foundation</h2>
                        <div className="p-8 bg-[#fdfdfd] border-2 border-black rounded-lg font-mono text-xs leading-loose text-black shadow-[8px_8px_0px_rgba(0,0,0,0.05)]">
                            <div className="flex items-center gap-2 mb-4 text-[10px] font-bold uppercase tracking-widest opacity-50">
                                <Cpu size={12} />
                                <span>Technical Specification</span>
                            </div>
                            {blueprint.tech_architecture}
                        </div>
                    </section>
                </div>

                {/* Footer Social sharing */}
                <footer className="pt-24 pb-32 border-t border-gray-100 flex flex-col items-center space-y-8 print:hidden">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300">End of Intelligence Memo</span>
                        <div className="w-12 h-0.5 bg-gray-100" />
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={shareOnTwitter}
                            className="text-gray-400 hover:text-black transition-colors p-2"
                        >
                            <Twitter size={20} />
                        </button>
                        <button
                            onClick={shareOnLinkedIn}
                            className="text-gray-400 hover:text-black transition-colors p-2"
                        >
                            <Linkedin size={20} />
                        </button>
                        <button
                            onClick={handleCopyLink}
                            className="text-gray-400 hover:text-black transition-colors p-2"
                        >
                            <ExternalLink size={20} />
                        </button>
                    </div>
                </footer>
            </main>

            {/* Global Memo Styles */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&family=Lora:ital,wght@0,400;0,500;0,700;1,400&display=swap');
                
                body {
                    font-family: 'Inter', sans-serif;
                }

                .font-serif {
                    font-family: 'Lora', serif;
                }

                @media print {
                    body {
                        background: white !important;
                    }
                    nav {
                        display: none !important;
                    }
                    main {
                        padding-top: 0 !important;
                        margin: 0 !important;
                        max-width: 100% !important;
                    }
                    footer {
                        display: none !important;
                    }
                    .pt-32 {
                        padding-top: 0 !important;
                    }
                    .shadow-\[8px_8px_0px_rgba(0\,0\,0\,0\.05\)\] {
                        box-shadow: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
