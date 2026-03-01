"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    TrendingUp,
    RefreshCw,
    MessageSquare,
    Zap,
    ExternalLink,
    AlertCircle
} from 'lucide-react';

interface MarketSignal {
    id: string;
    source: string;
    topic: string;
    summary: string;
    trend_score: number;
    created_at: string;
}

export default function LiveStartupSignals() {
    const [signals, setSignals] = useState<MarketSignal[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSignals = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/v1/market-signals');
            if (!res.ok) throw new Error('Failed to fetch signals');
            const data = await res.json();
            setSignals(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        try {
            setIsSyncing(true);
            const res = await fetch('/api/v1/market-signals/sync', { method: 'POST' });
            if (!res.ok) throw new Error('Failed to trigger sync');
            // Give it a few seconds to run in background before fetching fresh data
            setTimeout(fetchSignals, 5000);
        } catch (err: any) {
            setError(err.message);
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        fetchSignals();
        // Auto-refresh every 5 minutes
        const interval = setInterval(fetchSignals, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const getSourceIcon = (source: string) => {
        const s = source.toLowerCase();
        if (s.includes('reddit')) return <MessageSquare className="w-4 h-4 text-[#ff4500]" />;
        if (s.includes('product hunt')) return <Zap className="w-4 h-4 text-[#da552f]" />;
        if (s.includes('hacker news') || s.includes('hn')) return <Activity className="w-4 h-4 text-[#ff6600]" />;
        if (s.includes('google trends')) return <TrendingUp className="w-4 h-4 text-[#4285f4]" />;
        return <Activity className="w-4 h-4 text-violet-400" />;
    };

    return (
        <div className="bg-[#18181b] border border-[#27272a] rounded-[2rem] overflow-hidden flex flex-col h-full shadow-2xl relative">
            {/* Header */}
            <div className="p-6 border-b border-[#27272a] flex items-center justify-between bg-[#09090b]/50 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur animate-pulse" />
                        <div className="w-2 h-2 bg-emerald-500 rounded-full relative z-10" />
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Live Startup Signals</h3>
                </div>
                <button
                    onClick={handleSync}
                    disabled={isSyncing || loading}
                    className="p-2 hover:bg-[#27272a] rounded-lg transition-colors group disabled:opacity-50"
                    title="Force sync new signals"
                >
                    <RefreshCw className={`w-4 h-4 text-gray-400 group-hover:text-white transition-colors ${isSyncing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar relative z-10">
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-xs">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {loading && signals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 gap-4 text-gray-500">
                        <RefreshCw className="w-6 h-6 animate-spin text-violet-500/50" />
                        <span className="text-xs font-bold uppercase tracking-widest">Scanning market data...</span>
                    </div>
                ) : signals.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 text-sm">
                        No live signals found. Try syncing.
                    </div>
                ) : (
                    <AnimatePresence>
                        {signals.map((signal, idx) => (
                            <motion.div
                                key={signal.id || idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group relative bg-[#09090b] border border-[#27272a] hover:border-violet-500/30 rounded-2xl p-4 transition-all hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.1)]"
                            >
                                <div className="flex justify-between items-start mb-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        {getSourceIcon(signal.source)}
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{signal.source}</span>
                                    </div>
                                    {signal.trend_score > 80 && (
                                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                            <TrendingUp className="w-3 h-3 text-emerald-400" />
                                            <span className="text-[10px] font-bold text-emerald-400">HOT</span>
                                        </div>
                                    )}
                                </div>
                                <h4 className="text-sm font-semibold text-white mb-2 leading-snug group-hover:text-violet-300 transition-colors">
                                    {signal.topic}
                                </h4>
                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                    {signal.summary}
                                </p>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Background Glow */}
            <div className="absolute top-1/4 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        </div>
    );
}
