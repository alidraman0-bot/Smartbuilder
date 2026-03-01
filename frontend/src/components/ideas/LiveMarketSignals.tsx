'use client';

import React, { useEffect, useState } from 'react';
import { Activity, ExternalLink, RefreshCw, Zap, TrendingUp, AlertCircle, Package } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export interface MarketSignal {
    id?: string;
    source: string;
    title: string;
    description?: string;
    url: string;
    signal_strength: number;
    category: string;
}

interface LiveMarketSignalsProps {
    onSignalClick: (signal: MarketSignal) => void;
    isGenerating?: boolean;
}

export default function LiveMarketSignals({ onSignalClick, isGenerating }: LiveMarketSignalsProps) {
    const [signals, setSignals] = useState<MarketSignal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSignals = async () => {
        try {
            setLoading(true);
            setError(null);
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            const res = await fetch('/api/market-signals', {
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`
                }
            });

            if (!res.ok) {
                throw new Error('Failed to fetch market signals');
            }

            const data = await res.json();
            setSignals(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSignals();

        // Auto refresh every 30 minutes
        const interval = setInterval(() => {
            fetchSignals();
        }, 30 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    const getSourceStyle = (source: string) => {
        if (source === 'reddit') return 'bg-[#FF4500]/10 text-[#FF4500] border-[#FF4500]/20';
        if (source === 'hn') return 'bg-[#FF6600]/10 text-[#FF6600] border-[#FF6600]/20';
        if (source === 'news') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    };

    const getCategoryIcon = (category: string) => {
        if (category === 'problem') return <AlertCircle className="w-3 h-3 mr-1" />;
        if (category === 'product') return <Package className="w-3 h-3 mr-1" />;
        return <TrendingUp className="w-3 h-3 mr-1" />;
    };

    return (
        <div className="flex flex-col h-full bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h2 className="text-sm font-bold text-white tracking-wide uppercase">Live Market Signals</h2>
                </div>
                <button
                    onClick={fetchSignals}
                    disabled={loading}
                    className="p-1.5 text-zinc-500 hover:text-white rounded-md hover:bg-white/5 disabled:opacity-50 transition-colors"
                    title="Refresh Signals"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {loading && signals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-zinc-500 space-y-3">
                        <RefreshCw className="w-6 h-6 animate-spin text-indigo-500/50" />
                        <p className="text-xs">Scanning the web for opportunities...</p>
                    </div>
                ) : error ? (
                    <div className="text-xs text-red-400 p-4 bg-red-500/10 rounded-lg text-center">
                        {error}
                    </div>
                ) : signals.length === 0 ? (
                    <div className="text-xs text-zinc-500 text-center p-4">
                        No signals found recently.
                    </div>
                ) : (
                    signals.map((signal, idx) => (
                        <div
                            key={signal.id || idx}
                            onClick={() => !isGenerating && onSignalClick(signal)}
                            className={`group relative p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-indigo-500/30 transition-all cursor-pointer ${isGenerating ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getSourceStyle(signal.source)}`}>
                                    {signal.source === 'hn' ? 'Hacker News' : signal.source}
                                </span>

                                <span className="flex items-center text-[10px] text-zinc-400 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded">
                                    {getCategoryIcon(signal.category)}
                                    {signal.category}
                                </span>

                                <div className="ml-auto flex items-center space-x-1">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Strength</span>
                                    <div className="flex items-center">
                                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                                style={{ width: `${signal.signal_strength}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-sm font-semibold text-white leading-snug mb-2 group-hover:text-indigo-300 transition-colors">
                                {signal.title}
                            </h3>

                            {signal.description && (
                                <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed mb-3 group-hover:text-zinc-300">
                                    {signal.description}
                                </p>
                            )}

                            <div className="flex items-center justify-between mt-4">
                                <a
                                    href={signal.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center text-[10px] text-zinc-500 hover:text-indigo-400 uppercase tracking-widest transition-colors"
                                >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    View Source
                                </a>

                                <span className="flex items-center text-[10px] font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
                                    <Zap className="w-3 h-3 mr-1" />
                                    Generate Idea
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
