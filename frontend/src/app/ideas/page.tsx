'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BrainCircuit,
  Lightbulb,
  Sparkles,
  Search,
  Activity,
  X,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import IdeaCard from '@/components/ideas/IdeaCard';
import IdeaDetailPanel from '@/components/ideas/IdeaDetailPanel';

interface Idea {
  idea_id: string;
  title: string;
  thesis: string;
  market_size: string;
  problem_bullets: string[];
  target_customer: {
    primary_user: string;
    company_size: string;
    industry_or_role: string;
  };
  monetization: {
    pricing_structure: string;
    who_pays: string;
    value_prop: string;
  };
  why_now_bullets: string[];
  alternatives_structured: {
    today: string[];
    gaps: string[];
  };
  mvp_scope_bullets: string[];
  confidence_reasoning_bullets: string[];
  risks_structured: {
    adoption: string;
    technical: string;
    market: string;
  };
  confidence_score: number;
  market_score: number;
  execution_complexity: number;
}

export default function IdeaGeneratorPage() {
  const [userIdeaInput, setUserIdeaInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [generationType, setGenerationType] = useState<'user' | 'auto' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // --- Actions ---

  const handleGenerateUser = async () => {
    if (!userIdeaInput.trim()) return;
    setIsGenerating(true);
    setError(null);
    setGenerationType('user');
    setGeneratedIdeas([]);
    setSelectedIdea(null);
    setIsDetailOpen(false);

    try {
      const response = await fetch('/api/v1/ideas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'validate_idea',
          user_input: userIdeaInput
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No body');
        console.error('Generation API failed:', response.status, errorText);
        let errorDetail = 'Failed to generate ideas';
        try {
          const errorData = JSON.parse(errorText);
          errorDetail = errorData.detail || errorDetail;
        } catch (e) { }
        throw new Error(errorDetail);
      }

      const data = await response.json();
      const ideas = Array.isArray(data) ? data : (data.ideas || []);
      setGeneratedIdeas(ideas);
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAuto = async () => {
    setIsGenerating(true);
    setError(null);
    setGenerationType('auto');
    setGeneratedIdeas([]);
    setSelectedIdea(null);
    setIsDetailOpen(false);

    try {
      const response = await fetch('/api/v1/ideas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'discover'
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No body');
        console.error('Generation API failed:', response.status, errorText);
        let errorDetail = 'Failed to generate ideas';
        try {
          const errorData = JSON.parse(errorText);
          errorDetail = errorData.detail || errorDetail;
        } catch (e) { }
        throw new Error(errorDetail);
      }

      const data = await response.json();
      const ideas = Array.isArray(data) ? data : (data.ideas || []);
      setGeneratedIdeas(ideas);
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectIdea = (idea: Idea) => {
    setSelectedIdea(idea);
    setIsDetailOpen(true);
  };

  const handlePromote = async (ideaId: string) => {
    try {
      const response = await fetch('/api/v1/ideas/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea_id: ideaId })
      });
      if (response.ok) {
        router.push('/research');
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        alert(`Failed to promote idea: ${errorData.detail}`);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to promote idea.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden">

      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="max-w-5xl mx-auto px-6 py-20 relative z-10">
        <header className="mb-16 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
              <BrainCircuit className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400 mb-4">
            Idea Genesis
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Discover and validate real startup opportunities using <span className="text-indigo-400 font-medium">live market signals</span> and autonomous reasoning.
          </p>
        </header>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center animate-in fade-in duration-200">
            <ShieldAlert className="w-5 h-5 mr-3" />
            {error}
          </div>
        )}

        {/* 2. INPUT ZONE */}
        {!generatedIdeas.length && !isGenerating ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-200">
            {/* USER IDEA INPUT */}
            <div className="group relative flex flex-col bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 backdrop-blur-xl hover:border-indigo-500/50 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <Lightbulb className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-bold text-white">Validate Idea</h2>
              </div>
              <textarea
                id="user-idea"
                value={userIdeaInput}
                onChange={(e) => setUserIdeaInput(e.target.value)}
                placeholder="Describe the startup idea or problem you're thinking about..."
                className="flex-1 w-full bg-white/5 border border-white/10 rounded-xl p-4 text-base text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all resize-none min-h-[160px]"
              />
              <button
                onClick={handleGenerateUser}
                disabled={!userIdeaInput.trim()}
                className="mt-6 inline-flex items-center justify-center px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed group-hover:scale-[1.02] active:scale-95 duration-200"
              >
                <span>Analyze Opportunity</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>

            {/* ONE-CLICK DISCOVERY */}
            <div className="group relative flex flex-col bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 backdrop-blur-xl hover:border-emerald-500/50 transition-all duration-300 justify-center items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl border border-emerald-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform duration-500">
                <Sparkles className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Discover Opportunities</h3>
              <p className="text-zinc-500 text-sm leading-relaxed mb-8 px-4">
                Let Smartbuilder surface high-potential ideas based on <span className="text-emerald-400 font-medium">live market gaps</span>.
              </p>
              <button
                onClick={handleGenerateAuto}
                className="w-full inline-flex items-center justify-center px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 text-white text-sm font-bold rounded-xl transition-all group-hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]"
              >
                <Search className="w-4 h-4 mr-2 text-emerald-400" />
                Generate Best Ideas
              </button>
            </div>
          </div>
        ) : null}

        {/* LOADING STATE */}
        {isGenerating && (
          <div className="py-24 flex flex-col items-center justify-center text-center animate-in fade-in duration-200">
            <div className="relative">
              <div className="w-20 h-20 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <BrainCircuit className="w-8 h-8 text-white/50 animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mt-8 mb-2">Analyzing Signals</h3>
            <p className="text-zinc-500 max-w-md mx-auto">
              Connecting to live data sources and validating demand...
            </p>
          </div>
        )}

        {/* RESULTS AREA */}
        {!isGenerating && generatedIdeas.length > 0 && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Activity className="w-5 h-5 mr-3 text-indigo-400" />
                Detected Opportunities
              </h2>
              <button
                onClick={() => {
                  setGeneratedIdeas([]);
                  setUserIdeaInput('');
                  setSelectedIdea(null);
                  setIsDetailOpen(false);
                }}
                className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Reset
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {generatedIdeas.map((idea) => (
                <IdeaCard
                  key={idea.idea_id}
                  idea={idea}
                  isSelected={selectedIdea?.idea_id === idea.idea_id}
                  onClick={() => handleSelectIdea(idea)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* DETAIL PANEL OVERLAY */}
      <IdeaDetailPanel
        idea={selectedIdea}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onPromote={handlePromote}
        isPromoting={false}
      />
    </div>
  );
}
