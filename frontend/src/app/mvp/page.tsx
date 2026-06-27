'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, BrainCircuit, Terminal, Globe, Layout, Layers, 
  Database, Settings, Zap, ArrowRight, Activity, ShieldCheck,
  Code, RefreshCw, MessageSquare, Play, Box, Search, 
  Cpu, FileText, CheckCircle2, ChevronRight, Github, 
  Monitor, Smartphone, Download, ExternalLink, Clock,
  Sparkles, AlertCircle
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================
type AppState = 'HOMEPAGE' | 'BUILDING' | 'PREVIEW';

interface BuildLog {
  id: string;
  message: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  timestamp: string;
}

interface Intelligence {
  decision: string;
  reasoning: string;
  risks: string[];
  scalability: number;
  security: number;
  performance: number;
  confidence: number;
}

// ============================================================================
// Mock Data (to simulate the real-time Base44-like experience)
// ============================================================================
const RECOMMENDED_IDEAS = [
  { title: 'AI Customer Support SaaS', desc: 'Trending on Product Hunt: Automated L1 support for Shopify.', signal: 'High Demand' },
  { title: 'B2B Fintech Dashboard', desc: 'High conversion rate for African SMBs needing multi-currency.', signal: 'Market Gap' },
  { title: 'Freelancer Marketplace', desc: 'Niche marketplace for AI prompt engineers.', signal: 'Viral' },
];

const RECENT_APPS = [
  { name: 'NexPay', framework: 'Next.js', status: 'Deployed', time: '2 hrs ago' },
  { name: 'AI CRM', framework: 'Next.js', status: 'Building', time: '5 hrs ago' },
];

const STREAMING_STATES = [
  "Understanding product context...",
  "Designing system architecture...",
  "Generating UI/UX system...",
  "Building backend APIs...",
  "Designing Supabase schema...",
  "Wiring authentication...",
  "Connecting internal APIs...",
  "Generating React components...",
  "Validating architectural integrity...",
  "Preparing live preview environment...",
  "Ready to deploy."
];

// ============================================================================
// Main Component
// ============================================================================
export default function BuilderPage() {
  const [appState, setAppState] = useState<AppState>('HOMEPAGE');
  const [idea, setIdea] = useState('');
  
  // Building State
  const [buildLogs, setBuildLogs] = useState<BuildLog[]>([]);
  const [intelligence, setIntelligence] = useState<Intelligence | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Preview State
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile' | 'tablet'>('desktop');

  // Auto-scroll logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [buildLogs]);

  const handleStartBuild = async (selectedIdea?: string) => {
    const targetIdea = selectedIdea || idea;
    if (targetIdea) setIdea(targetIdea);
    setAppState('BUILDING');
    setBuildLogs([]);
    setCurrentStep(0);
    setIntelligence(null);
    
    try {
      const response = await fetch('/api/mvp/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea: targetIdea }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let stepCount = 0;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.replace('data: ', ''));
              
              if (data.step === 'intelligence') {
                setIntelligence(data.data);
              } else if (data.step === 'done') {
                setTimeout(() => setAppState('PREVIEW'), 1500);
              } else if (data.step === 'error') {
                setBuildLogs(prev => [...prev, {
                  id: Math.random().toString(),
                  message: data.message,
                  status: 'error',
                  timestamp: new Date().toLocaleTimeString()
                }]);
              } else {
                setBuildLogs(prev => {
                  // Mark previous active as completed
                  const updated = prev.map(log => 
                    log.status === 'active' ? { ...log, status: 'completed' as const } : log
                  );
                  return [...updated, {
                    id: Math.random().toString(),
                    message: data.message,
                    status: 'active',
                    timestamp: new Date().toLocaleTimeString()
                  }];
                });
                setCurrentStep(parseInt(data.step));
                stepCount++;
              }
            }
          }
        }
      }
      
      // Mark last step completed
      setBuildLogs(prev => prev.map(log => 
        log.status === 'active' ? { ...log, status: 'completed' as const } : log
      ));
      
    } catch (err) {
      console.error(err);
      setBuildLogs(prev => [...prev, {
        id: Math.random().toString(),
        message: 'Failed to connect to AI engine.',
        status: 'error',
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 selection:text-indigo-200 font-sans">
      {/* Universal Top Nav */}
      <nav className="border-b border-white/5 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => setAppState('HOMEPAGE')}
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <BrainCircuit size={18} />
              </div>
              <span className="font-black text-lg tracking-tight">Smartbuilder</span>
            </div>
            
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
              <a href="#" className="hover:text-white transition-colors">Projects</a>
              <a href="#" className="hover:text-white transition-colors">Deployments</a>
              <a href="#" className="hover:text-white transition-colors">Settings</a>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full text-xs font-mono text-zinc-400 border border-white/5">
              <Zap size={12} className="text-yellow-500" /> 1,240 Credits
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-white/10" />
            <button className="px-4 py-1.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-zinc-200 transition-colors">
              Deploy
            </button>
          </div>
        </div>
      </nav>

      {/* ========================================================= */}
      {/* STATE 1: HOMEPAGE (IDEA ENTRY) */}
      {/* ========================================================= */}
      {appState === 'HOMEPAGE' && (
        <motion.main 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="max-w-[1200px] mx-auto px-6 py-20 space-y-24"
        >
          {/* Hero Input Section */}
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
              What do you want to build?
            </h1>
            
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition duration-1000" />
              <div className="relative bg-[#0A0A0B] border border-white/10 rounded-3xl p-3 flex flex-col md:flex-row gap-3 shadow-2xl">
                <div className="flex-1 flex items-center px-4 gap-3">
                  <Sparkles className="text-indigo-500" size={24} />
                  <textarea 
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="e.g. Build a fintech app for African businesses with multi-currency wallets..."
                    className="w-full bg-transparent border-none text-lg text-white focus:outline-none placeholder:text-zinc-600 resize-none h-14 py-3 custom-scrollbar"
                    onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleStartBuild(); } }}
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleStartBuild()} disabled={!idea.trim()} className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold text-sm transition-colors border border-white/5">
                    Deep Build
                  </button>
                  <button onClick={() => handleStartBuild()} disabled={!idea.trim()} className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50">
                    Generate MVP
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-2 mr-2">Quick Starts:</span>
              {['AI CRM SaaS', 'Freelancer Marketplace', 'Internal Admin Panel'].map(tag => (
                <button key={tag} onClick={() => setIdea(tag)} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-xs text-zinc-400 transition-colors">
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Recent Apps */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-zinc-400">
                <Clock size={18} />
                <h3 className="text-sm font-bold uppercase tracking-widest">Recent Apps</h3>
              </div>
              <div className="grid gap-4">
                {RECENT_APPS.map((app, i) => (
                  <div key={i} className="p-5 bg-[#0A0A0B] border border-white/5 rounded-2xl hover:border-white/10 transition-colors flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/5">
                        <Box size={18} className="text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white group-hover:text-indigo-400 transition-colors">{app.name}</h4>
                        <p className="text-xs text-zinc-500">{app.framework} • {app.time}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${app.status === 'Deployed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                      {app.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Ideas */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-zinc-400">
                  <Activity size={18} />
                  <h3 className="text-sm font-bold uppercase tracking-widest">Market Signals</h3>
                </div>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded-md font-mono">Live Data</span>
              </div>
              <div className="grid gap-4">
                {RECOMMENDED_IDEAS.map((item, i) => (
                  <div key={i} onClick={() => handleStartBuild(item.title)} className="p-5 bg-[#0A0A0B] border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-colors cursor-pointer group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                      <ArrowRight size={24} className="text-indigo-400 -rotate-45 group-hover:rotate-0 transition-transform" />
                    </div>
                    <h4 className="font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-xs text-zinc-500 mb-3">{item.desc}</p>
                    <span className="inline-block px-2 py-1 bg-white/5 rounded text-[10px] text-zinc-400 font-bold uppercase">{item.signal}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.main>
      )}

      {/* ========================================================= */}
      {/* STATE 2: BUILDING INTERFACE */}
      {/* ========================================================= */}
      {appState === 'BUILDING' && (
        <motion.main 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="h-[calc(100vh-64px)] flex overflow-hidden bg-[#0A0A0B]"
        >
          {/* Left Sidebar - File Tree & Architecture */}
          <div className="w-64 border-r border-white/5 bg-[#050505] flex flex-col">
            <div className="p-4 border-b border-white/5">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <Layers size={14} /> Project Architecture
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
              {['pages', 'components', 'api', 'database', 'assets'].map((dir, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 mb-2">
                    <ChevronRight size={14} /> {dir}
                  </div>
                  {currentStep > i + 3 && (
                    <div className="ml-6 space-y-2">
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                        <FileText size={10} /> index.tsx
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                        <FileText size={10} /> styles.css
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Center Panel - Generation Stream */}
          <div className="flex-1 flex flex-col bg-[#0A0A0B] relative">
            {/* Background Map FX */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#0A0A0B] to-[#0A0A0B] pointer-events-none" />
            
            <div className="p-6 border-b border-white/5 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                </div>
                <h2 className="text-sm font-bold text-white">AI Engineering Pipeline</h2>
              </div>
              <div className="text-xs font-mono text-zinc-500">RUN_ID: {Math.random().toString(36).substring(7).toUpperCase()}</div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar z-10" ref={scrollRef}>
              <AnimatePresence>
                {buildLogs.map((log, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={log.id} 
                    className="flex gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl max-w-3xl"
                  >
                    <div className="shrink-0 mt-1">
                      {log.status === 'completed' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <RefreshCw size={16} className="text-indigo-400 animate-spin" />}
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{log.message}</p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-1">{log.timestamp} • System Orchestrator</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {currentStep < STREAMING_STATES.length && (
                <div className="flex items-center gap-3 text-zinc-500 p-4">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              )}
            </div>
            
            {/* Input area for interrupting / modifying */}
            <div className="p-4 border-t border-white/5 bg-[#050505] z-10">
              <div className="relative">
                <input 
                  placeholder="Instruct the AI CTO to modify the current build..."
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-indigo-500 rounded-lg text-white">
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar - AI Intelligence */}
          <div className="w-80 border-l border-white/5 bg-[#050505] flex flex-col p-6 space-y-6 z-10">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2 mb-2">
              <ShieldCheck size={14} /> System Intelligence
            </h2>
            
            {intelligence ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                  <h3 className="text-xs font-bold text-indigo-400 mb-2">Architecture Decision</h3>
                  <p className="text-sm text-white">{intelligence.decision}</p>
                  <p className="text-[10px] text-zinc-400 mt-2">{intelligence.reasoning}</p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Risk Analysis</h3>
                  {intelligence.risks.map((risk, i) => (
                    <div key={i} className="flex gap-2 text-xs text-yellow-500 bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
                      <AlertCircle size={14} className="shrink-0" /> {risk}
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">System Metrics</h3>
                  <div>
                    <div className="flex justify-between text-[10px] mb-1"><span className="text-zinc-400">Scalability</span><span className="text-white font-bold">{intelligence.scalability}%</span></div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{width: `${intelligence.scalability}%`}} /></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] mb-1"><span className="text-zinc-400">Security</span><span className="text-white font-bold">{intelligence.security}%</span></div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-indigo-500" style={{width: `${intelligence.security}%`}} /></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] mb-1"><span className="text-zinc-400">Performance</span><span className="text-white font-bold">{intelligence.performance}%</span></div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-purple-500" style={{width: `${intelligence.performance}%`}} /></div>
                  </div>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-zinc-400">AI Confidence</span>
                  <span className="text-xl font-black text-white">{intelligence.confidence}%</span>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-zinc-600 space-y-4">
                <BrainCircuit size={24} className="animate-pulse" />
                <span className="text-xs text-center">Analyzing architecture requirements...</span>
              </div>
            )}
          </div>
        </motion.main>
      )}

      {/* ========================================================= */}
      {/* STATE 3: PREVIEW INTERFACE */}
      {/* ========================================================= */}
      {appState === 'PREVIEW' && (
        <motion.main 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="h-[calc(100vh-64px)] flex bg-black"
        >
          {/* Left - Preview Iframe Area */}
          <div className="flex-1 relative flex flex-col bg-[#050505]">
            <div className="h-12 border-b border-white/5 flex items-center justify-center gap-4 bg-[#0A0A0B]">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-md border border-white/10 text-xs text-zinc-400 font-mono">
                <Globe size={12} /> project.smartbuilder.app
              </div>
              <button className="p-1.5 hover:bg-white/10 rounded text-zinc-400 transition-colors"><RefreshCw size={14} /></button>
            </div>
            
            <div className="flex-1 p-8 flex items-center justify-center overflow-hidden">
              {/* Mock Iframe Container */}
              <div 
                className={`bg-white rounded-lg shadow-2xl transition-all duration-500 ease-in-out border border-white/10 overflow-hidden flex flex-col
                  ${viewMode === 'desktop' ? 'w-full h-full max-w-5xl' : 
                    viewMode === 'tablet' ? 'w-[768px] h-[1024px] max-h-full' : 
                    'w-[375px] h-[812px] max-h-full'}`}
              >
                {/* Simulated App Header */}
                <div className="h-12 border-b border-gray-200 bg-gray-50 flex items-center px-4 justify-between text-black">
                  <div className="font-bold">Your Generated App</div>
                  <div className="flex gap-4 text-sm font-medium text-gray-500">
                    <span>Dashboard</span>
                    <span>Settings</span>
                  </div>
                </div>
                {/* Simulated App Content */}
                <div className="flex-1 bg-gray-100 p-8 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-indigo-500 rounded-2xl mx-auto flex items-center justify-center text-white"><Rocket size={32} /></div>
                    <h2 className="text-2xl font-bold text-gray-900">App Successfully Deployed</h2>
                    <p className="text-gray-500 max-w-md mx-auto">This is a live preview of your generated application running on the Smartbuilder sandbox.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Controls Panel */}
          <div className="w-80 border-l border-white/5 bg-[#0A0A0B] p-6 flex flex-col space-y-8">
            <div>
              <h2 className="text-sm font-bold text-white mb-4">Preview Controls</h2>
              <div className="flex bg-white/5 rounded-lg p-1">
                <button onClick={() => setViewMode('desktop')} className={`flex-1 py-2 flex justify-center rounded-md transition-colors ${viewMode === 'desktop' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}><Monitor size={16} /></button>
                <button onClick={() => setViewMode('tablet')} className={`flex-1 py-2 flex justify-center rounded-md transition-colors ${viewMode === 'tablet' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}><Layout size={16} /></button>
                <button onClick={() => setViewMode('mobile')} className={`flex-1 py-2 flex justify-center rounded-md transition-colors ${viewMode === 'mobile' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}><Smartphone size={16} /></button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Actions</h3>
              <button className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                <Globe size={16} /> Deploy to Production
              </button>
              <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors border border-white/5">
                <Download size={16} /> Export Source Code
              </button>
              <button className="w-full py-3 bg-[#24292e] hover:bg-[#2f363d] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors border border-white/10">
                <Github size={16} /> Push to GitHub
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">System Logs</h3>
              <div className="bg-black border border-white/5 rounded-xl p-4 h-48 overflow-y-auto custom-scrollbar font-mono text-[10px] text-zinc-400 space-y-2">
                <div className="text-emerald-400">[info] Server started on port 3000</div>
                <div>[info] Compiled client and server successfully</div>
                <div>[info] Ready in 2.4s</div>
                <div>[debug] Connected to Supabase instance</div>
                <div>[debug] Hot reload enabled</div>
              </div>
            </div>
            
            <div className="mt-auto pt-6 border-t border-white/5">
              <button 
                onClick={() => setAppState('BUILDING')}
                className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-2"
              >
                <Code size={14} /> Back to Editor
              </button>
            </div>
          </div>
        </motion.main>
      )}

      <style jsx global>{`
        .typing-dot {
          width: 4px;
          height: 4px;
          background-color: currentColor;
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out both;
        }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes typing {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
