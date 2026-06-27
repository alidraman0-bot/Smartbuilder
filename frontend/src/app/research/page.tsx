"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
    Search, 
    Globe, 
    Briefcase, 
    TrendingUp, 
    AlertTriangle, 
    Lightbulb, 
    DollarSign, 
    Loader2, 
    CheckCircle2,
    ArrowRight,
    Zap,
    Shield,
    Target,
    BarChart3,
    Layers,
    Activity,
    FileText,
    TrendingDown,
    Building2,
    FileSpreadsheet
} from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';
import { getAuthHeaders } from '@/utils/supabase/auth';
import { useRunStore } from '@/store/useRunStore';

// VC-Grade Research Subcomponents
import ExecutiveSummary from '@/components/research/ExecutiveSummary';
import CompetitiveLandscape from '@/components/research/CompetitiveLandscape';
import MarketTaxonomy from '@/components/research/MarketTaxonomy';
import MarketEconomics from '@/components/research/MarketEconomics';
import GrowthTrends from '@/components/research/GrowthTrends';
import DemandAnalysis from '@/components/research/DemandAnalysis';
import CustomerSegmentation from '@/components/research/CustomerSegmentation';
import MonetizationAnalysis from '@/components/research/MonetizationAnalysis';
import RegulatoryFactors from '@/components/research/RegulatoryFactors';
import RiskAnalysis from '@/components/research/RiskAnalysis';
import SynthesisScorecard from '@/components/research/SynthesisScorecard';
import IdeaContextBar from '@/components/research/IdeaContextBar';
import { parseResearchData } from '@/utils/researchParser';

function ResearchPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const run = useRunStore();
    
    const ideaParam = searchParams.get('idea');
    const autoRunParam = searchParams.get('autoRun');
    const modeParam = searchParams.get('mode') as 'basic' | 'deep' | null;
    
    const [idea, setIdea] = useState(ideaParam || '');
    const [industry, setIndustry] = useState('');
    const [region, setRegion] = useState('Global');
    const [mode, setMode] = useState<'basic' | 'deep'>(modeParam || 'basic');
    const [isProcessing, setIsProcessing] = useState(false);
    const [report, setReport] = useState<any>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [activeTab, setActiveTab] = useState<'verdict' | 'competition' | 'economics' | 'growth' | 'demand' | 'monetization'>('verdict');
    const [progressMsgs, setProgressMsgs] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const steps = [
        "Scanning web data...",
        "Analyzing companies...",
        "Evaluating financial data...",
        "Detecting trends...",
        "Generating insights..."
    ];

    const runResearch = async () => {
        if (!idea.trim()) return;

        setIsProcessing(true);
        setReport(null);
        setCurrentStep(0);
        setProgressMsgs([]);
        setError(null);

        // Simulate step progression for the visual UI alongside the real SSE stream
        const progressInterval = setInterval(() => {
            setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
        }, 2000);

        try {
            const response = await fetch('/api/market-research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idea, industry: industry || 'Technology', region, depth: mode })
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
                        try {
                            const parsed = JSON.parse(line);
                            if (parsed.progress) {
                                setProgressMsgs(p => [...p, parsed.progress]);
                            } else if (parsed.result) {
                                setReport(parsed.result);
                                setCurrentStep(steps.length);
                            } else if (parsed.error) {
                                setError(parsed.error);
                            }
                        } catch(e) {}
                    }
                }
            }
        } catch (err: any) {
            console.error("Research failed:", err);
            setError(err.message);
        } finally {
            clearInterval(progressInterval);
            setIsProcessing(false);
            setCurrentStep(steps.length);
        }
    };

    const handlePrdGeneration = () => {
        if (!report) return;
        
        // Map the new report format back to old expected structure for PRD
        const marketOverview = report.executive_summary || '';
        const idea_id = report.run_id || 'run_research';
        
        run.setRunState({ 
            research: { 
                idea: { title: idea, description: marketOverview, id: idea_id },
                report: report 
            } 
        });
        router.push(`/builder?idea=${encodeURIComponent(idea)}&idea_id=${idea_id}&autoRun=true`);
    };

    const handleExportDeck = () => {
        alert("Exporting Investor Deck... (Feature coming soon to Pro users)");
    };
    
    // Auto-run logic when coming from Discovery/Genesis
    useEffect(() => {
        if (autoRunParam === 'true' && ideaParam) {
            setIdea(ideaParam);
            const timer = setTimeout(() => {
                runResearch();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [autoRunParam, ideaParam]);

    // Parse the data if available
    const parsedData = report ? parseResearchData(report) : null;

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans selection:bg-indigo-500/30">
            {/* Header */}
            <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center space-x-2 text-indigo-400 mb-4">
                        <Zap size={18} className="fill-current animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Bloomberg-Level Intelligence</span>
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-6xl font-black tracking-tighter">
                        Market <span className="text-zinc-700">Intelligence.</span>
                    </motion.h1>
                </div>
                
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center space-x-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        <span>BrightData Scraper Live</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        <span>VC Signal DB Connected</span>
                    </div>
                </motion.div>
            </header>

            <main className="max-w-7xl mx-auto space-y-10 pb-24">
                {/* Input Section */}
                <motion.section initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-2 rounded-[2.5rem] bg-white/[0.01] border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity">
                        <Activity size={120} />
                    </div>
                    <div className="p-6 md:p-10 space-y-8 relative z-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 ml-1">Startup Idea Hypothesis</label>
                            <div className="relative">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 focus-within:text-indigo-400 transition-colors" size={24} />
                                <input 
                                    type="text" 
                                    value={idea}
                                    onChange={(e) => setIdea(e.target.value)}
                                    placeholder="Enter your startup idea for deep intelligence scan..."
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-800"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 ml-1">Target Industry</label>
                                <input 
                                    type="text" 
                                    value={industry}
                                    onChange={(e) => setIndustry(e.target.value)}
                                    placeholder="e.g. B2B SaaS, HealthTech..."
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-800"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 ml-1">Target Region</label>
                                <select 
                                    value={region}
                                    onChange={(e) => setRegion(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white"
                                >
                                    <option className="bg-black text-white">Global</option>
                                    <option className="bg-black text-white">North America</option>
                                    <option className="bg-black text-white">Europe</option>
                                    <option className="bg-black text-white">Asia Pacific</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex bg-white/[0.03] p-1.5 rounded-2xl border border-white/5 w-full md:w-auto backdrop-blur-md">
                                <button onClick={() => setMode('basic')} className={`flex-1 md:flex-none md:px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'basic' ? 'bg-white text-black shadow-xl shadow-white/10' : 'text-zinc-500 hover:text-white'}`}>Basic Scan</button>
                                <button onClick={() => setMode('deep')} className={`flex-1 md:flex-none md:px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'deep' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30' : 'text-zinc-500 hover:text-white'}`}>Deep Intelligence</button>
                            </div>

                            <button onClick={runResearch} disabled={isProcessing || !idea.trim()} className="w-full md:w-auto bg-white text-black px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all disabled:opacity-20 flex items-center justify-center space-x-4 shadow-[0_20px_40px_-15px_rgba(255,255,255,0.15)] active:scale-[0.98]">
                                {isProcessing ? <><Loader2 size={16} className="animate-spin" /><span>Processing Scan</span></> : <><Zap size={16} /><span>Run Deep Analysis</span><ArrowRight size={16} /></>}
                            </button>
                        </div>
                    </div>
                </motion.section>

                {/* Progress Tracking */}
                <AnimatePresence>
                    {isProcessing && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6 max-w-2xl mx-auto text-center py-10">
                            <h3 className="text-xl font-bold tracking-tight text-indigo-400">{progressMsgs.length > 0 ? progressMsgs[progressMsgs.length - 1] : "Initializing Scanner..."}</h3>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden max-w-sm mx-auto">
                                <motion.div className="h-full bg-indigo-500" initial={{ width: 0 }} animate={{ width: `${Math.min(((progressMsgs.length + 1) / 5) * 100, 100)}%` }} transition={{ duration: 0.8 }} />
                            </div>
                            <div className="flex flex-col items-center gap-2 pt-4">
                                {progressMsgs.map((msg, idx) => (
                                    <div key={idx} className="flex items-center space-x-2 text-zinc-400 text-sm">
                                        <CheckCircle2 size={14} className="text-indigo-400" />
                                        <span>{msg}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && (
                    <div className="max-w-2xl mx-auto bg-red-500/10 border border-red-500/50 text-red-400 rounded-2xl p-6 text-center">
                        <AlertTriangle size={24} className="mx-auto mb-2 text-red-500" />
                        <p className="font-semibold mb-1">Intelligence Pipeline Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {/* VC-Grade Interactive Panel */}
                <AnimatePresence>
                    {parsedData && (
                        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            
                            {/* Sticky Metadata Bar */}
                            <IdeaContextBar context={parsedData.context} />

                            {/* Tab Bar Navigation */}
                            <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
                                <TabButton active={activeTab === 'verdict'} onClick={() => setActiveTab('verdict')} icon={<Lightbulb size={16} />} label="Verdict & Memo" />
                                <TabButton active={activeTab === 'competition'} onClick={() => setActiveTab('competition')} icon={<Briefcase size={16} />} label="Competitor Mapping" />
                                <TabButton active={activeTab === 'economics'} onClick={() => setActiveTab('economics')} icon={<BarChart3 size={16} />} label="Economics & TAM" />
                                <TabButton active={activeTab === 'growth'} onClick={() => setActiveTab('growth')} icon={<TrendingUp size={16} />} label="Growth Trends" />
                                <TabButton active={activeTab === 'demand'} onClick={() => setActiveTab('demand')} icon={<Target size={16} />} label="Demand & Segments" />
                                <TabButton active={activeTab === 'monetization'} onClick={() => setActiveTab('monetization')} icon={<DollarSign size={16} />} label="Monetization & Risk" />
                            </div>

                            {/* Main Content Area */}
                            <div className="space-y-10 min-h-[400px]">
                                {activeTab === 'verdict' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                                        <SynthesisScorecard scorecard={parsedData.synthesis_scorecard} />
                                        <ExecutiveSummary summary={parsedData.executive_summary} />
                                        
                                        {/* Verified VC Data Sources */}
                                        <section className="space-y-6">
                                            <div className="flex items-center space-x-3">
                                                <Layers size={18} className="text-indigo-500" />
                                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Verified Data Sources</h3>
                                                <div className="flex-1 h-px bg-white/5" />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {parsedData.data_sources.map((src, i) => (
                                                    <div key={i} className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center justify-between">
                                                        <div>
                                                            <h4 className="text-sm font-bold text-white mb-1">{src.source_name}</h4>
                                                            <p className="text-xs text-zinc-500">{src.data_type}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-[9px] font-black bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20 uppercase tracking-widest">{src.reliability} Reliability</span>
                                                            <p className="text-[9px] text-zinc-600 font-mono mt-1">{src.freshness}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    </motion.div>
                                )}

                                {activeTab === 'competition' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <CompetitiveLandscape landscape={parsedData.competitive_landscape} />
                                    </motion.div>
                                )}

                                {activeTab === 'economics' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                                        <MarketEconomics economics={parsedData.market_economics} />
                                        <MarketTaxonomy taxonomy={parsedData.market_taxonomy} />
                                    </motion.div>
                                )}

                                {activeTab === 'growth' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <GrowthTrends trends={parsedData.growth_trends} />
                                    </motion.div>
                                )}

                                {activeTab === 'demand' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                                        <DemandAnalysis demand={parsedData.demand_analysis} />
                                        <CustomerSegmentation segmentation={parsedData.customer_segmentation} />
                                    </motion.div>
                                )}

                                {activeTab === 'monetization' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                                        <MonetizationAnalysis monetization={parsedData.monetization_analysis} />
                                        <RiskAnalysis risk={parsedData.risk_analysis} />
                                        <RegulatoryFactors factors={parsedData.regulatory_factors} />
                                    </motion.div>
                                )}
                            </div>

                            {/* Floating Call to Action Bar */}
                            <section className="relative pt-12">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 blur-3xl opacity-20" />
                                <div className="glass-card p-10 md:p-14 rounded-[3.5rem] bg-white/[0.01] border border-white/5 relative z-10 text-center space-y-8 group">
                                    <h3 className="text-xs font-black uppercase tracking-[0.6em] text-indigo-400">Institutional Verdict</h3>
                                    <h2 className="text-2xl md:text-4xl font-bold text-white max-w-3xl mx-auto tracking-tight leading-tight">
                                        {parsedData.synthesis_scorecard.rationale}
                                    </h2>
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                                        <button 
                                            onClick={handlePrdGeneration}
                                            className="w-full sm:w-auto bg-white text-black px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(255,255,255,0.25)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2"
                                        >
                                            <Zap size={14} className="fill-current" />
                                            <span>Build Business Plan & PRD</span>
                                        </button>
                                        <button 
                                            onClick={handleExportDeck}
                                            className="w-full sm:w-auto bg-transparent border border-white/10 hover:bg-white/5 text-zinc-400 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all"
                                        >
                                            Export Investor Deck
                                        </button>
                                    </div>
                                </div>
                            </section>

                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <button 
            onClick={onClick} 
            className={`flex items-center space-x-2.5 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                active 
                    ? 'bg-white text-black shadow-xl shadow-white/5 font-extrabold' 
                    : 'text-zinc-500 hover:text-zinc-200 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5'
            }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}

export default function ResearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            </div>
        }>
            <ResearchPageContent />
        </Suspense>
    );
}
