"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MarketResearchPage() {
    const [idea, setIdea] = useState("");
    const [industry, setIndustry] = useState("");
    const [region, setRegion] = useState("Global");
    const [depth, setDepth] = useState("advanced");
    
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState<string[]>([]);
    const [report, setReport] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleResearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setReport(null);
        setProgress([]);
        setError(null);

        try {
            const response = await fetch('/api/market-research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idea, industry, region, depth })
            });

            if (!response.ok) {
                throw new Error("Failed to start research");
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) throw new Error("No reader stream available");

            let buffer = '';
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.trim()) {
                        const parsed = JSON.parse(line);
                        if (parsed.progress) {
                            setProgress(p => [...p, parsed.progress]);
                        } else if (parsed.result) {
                            setReport(parsed.result);
                        } else if (parsed.error) {
                            setError(parsed.error);
                        }
                    }
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">
                
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                        AI Market Intelligence
                    </h1>
                    <p className="text-neutral-400">
                        Institutional-grade research engine combining Bloomberg, Gartner, and AI signals.
                    </p>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl">
                    <form onSubmit={handleResearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Startup Idea</label>
                            <input 
                                required
                                value={idea}
                                onChange={(e) => setIdea(e.target.value)}
                                placeholder="e.g. AI CRM for Plumbers"
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Industry</label>
                            <input 
                                required
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                                placeholder="e.g. Field Services"
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Region</label>
                            <select 
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                <option>Global</option>
                                <option>North America</option>
                                <option>Europe</option>
                                <option>Asia Pacific</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 text-white font-medium rounded-lg p-3 transition-all shadow-lg hover:shadow-blue-500/25"
                            >
                                {loading ? "Scanning Intel..." : "Generate Intelligence"}
                            </button>
                        </div>
                    </form>
                </div>

                <AnimatePresence>
                    {loading && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                                <span className="font-medium text-blue-400">Pipeline Active</span>
                            </div>
                            <div className="space-y-2">
                                {progress.map((msg, i) => (
                                    <motion.div 
                                        key={i} 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-sm text-neutral-400 flex items-center gap-2"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        {msg}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-2xl p-6">
                        <p className="font-semibold mb-1">Pipeline Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {report && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <span className="text-emerald-400">●</span> Executive Summary
                                </h2>
                                <p className="text-neutral-300 leading-relaxed">
                                    {report.executive_summary}
                                </p>
                            </div>
                            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col justify-center items-center text-center">
                                <div className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-green-400 to-blue-500">
                                    {report.confidence_score}%
                                </div>
                                <div className="text-sm text-neutral-400 mt-2 uppercase tracking-widest font-semibold">
                                    Confidence Score
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                                <div className="text-xs text-neutral-500 uppercase font-bold tracking-wider mb-2">TAM</div>
                                <div className="text-2xl font-bold">{report.market_size?.tam || 'N/A'}</div>
                            </div>
                            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                                <div className="text-xs text-neutral-500 uppercase font-bold tracking-wider mb-2">SAM</div>
                                <div className="text-2xl font-bold">{report.market_size?.sam || 'N/A'}</div>
                            </div>
                            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                                <div className="text-xs text-neutral-500 uppercase font-bold tracking-wider mb-2">SOM</div>
                                <div className="text-2xl font-bold">{report.market_size?.som || 'N/A'}</div>
                            </div>
                            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                                <div className="text-xs text-emerald-500 uppercase font-bold tracking-wider mb-2">CAGR</div>
                                <div className="text-2xl font-bold text-emerald-400">{report.market_size?.cagr || 'N/A'}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
                                <h3 className="text-lg font-bold mb-4 border-b border-neutral-800 pb-2">Industry Trends</h3>
                                <ul className="space-y-3">
                                    {report.industry_trends?.map((t: string, i: number) => (
                                        <li key={i} className="text-neutral-300 text-sm flex gap-3">
                                            <span className="text-blue-500">→</span> {t}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
                                <h3 className="text-lg font-bold mb-4 border-b border-neutral-800 pb-2">Customer Pain Points</h3>
                                <ul className="space-y-3">
                                    {report.pain_points?.map((t: string, i: number) => (
                                        <li key={i} className="text-neutral-300 text-sm flex gap-3">
                                            <span className="text-red-500">→</span> {t}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
                            <h3 className="text-lg font-bold mb-4 border-b border-neutral-800 pb-2">Strategic Recommendations</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {report.strategic_recommendations?.map((r: string, i: number) => (
                                    <div key={i} className="bg-neutral-950 rounded-lg p-4 text-sm text-neutral-300 border border-neutral-800/50">
                                        {r}
                                    </div>
                                ))}
                            </div>
                        </div>

                    </motion.div>
                )}
            </div>
        </div>
    );
}
