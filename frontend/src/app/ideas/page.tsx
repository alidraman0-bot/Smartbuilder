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
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import StartupPipeline, { PipelineStage } from '@/components/layout/StartupPipeline';
import IdeaCard from '@/components/ideas/IdeaCard';
import IdeaDetailPanel from '@/components/ideas/IdeaDetailPanel';
import PaywallModal from '@/components/billing/PaywallModal';
import LiveMarketSignals, { MarketSignal } from '@/components/ideas/LiveMarketSignals';
import ThinkingPanel from '@/components/opportunities/ThinkingPanel';
import OpportunityCard, { OpportunityIdea } from '@/components/opportunities/OpportunityCard';
import { useBillingStore } from '@/store/useBillingStore';
import { createClient } from '@/lib/supabase/browser';
import { type FeatureKey } from '@/utils/feature-gating';
import { type Idea } from '@/types/idea';
import { useIdeas } from '@/hooks/useIdeas';
import { apiFetch } from '@/lib/apiClient';
import { getAuthHeaders } from '@/utils/supabase/auth';


export default function IdeaGeneratorPage() {
  const [userIdeaInput, setUserIdeaInput] = useState('');
  const [displayIdeas, setDisplayIdeas] = useState<Idea[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [generationType, setGenerationType] = useState<'user' | 'auto' | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState<FeatureKey>('idea_generation');

  const [startupId, setStartupId] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<PipelineStage>('IDEA');

  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isEngineGenerating, setIsEngineGenerating] = useState<boolean>(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  const router = useRouter();
  const { subscription, fetchSubscription } = useBillingStore();
  const { generateIdeas, discoverIdeas, generateFromSignal, fetchIdeaDetails, isLoading, error, setError } = useIdeas();

  const supabase = createClient();

  React.useEffect(() => {
    const initPage = async () => {
      // Consolidate auth into a single call — session already contains the user
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;
      const accessToken = session?.access_token;

      // 1. Try finding org where user is a member (org_members)
      let { data: orgMember } = await supabase
        .from('org_members')
        .select('org_id')
        .eq('user_id', user.id)
        .maybeSingle();

      let org_id = orgMember?.org_id;

      // 2. Try legacy team_members if not found
      if (!org_id) {
        const { data: teamMember } = await supabase
          .from('team_members')
          .select('org_id')
          .eq('user_id', user.id)
          .maybeSingle();
        org_id = teamMember?.org_id;
      }

      // 3. Check if user is an owner of any organization
      if (!org_id) {
        const { data: ownedOrg } = await supabase
          .from('organizations')
          .select('id')
          .eq('owner_id', user.id)
          .limit(1)
          .maybeSingle();
        org_id = ownedOrg?.id;
      }

      // 4. Fallback: Auto-provision a default org if needed
      if (!org_id && accessToken) {
        try {
          const data = await apiFetch<any>('/api/v1/billing/provision', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          org_id = data.org_id;
          console.info('Auto-provisioned default organization');
        } catch (err: any) {
          console.error('Failed to auto-provision organization:', err.message);
        }
      }

      if (org_id) {
        fetchSubscription(org_id);

        // Fetch or create startup tracking
        if (accessToken) {
          try {
            const projects = await apiFetch<any[]>('/api/v1/projects', {
              headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (projects && projects.length > 0) {
              setCurrentProjectId(projects[0].id || projects[0].project_id);
            } else {
              console.info('No projects found, creating default...');
              const newProj = await apiFetch<any>('/api/v1/project/create', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                  startup_name: "Default Genesis",
                  industry: "Software"
                })
              });
              setCurrentProjectId(newProj.id || newProj.project_id);
            }
          } catch (err) {
            console.error('Failed to init project:', err);
          }
        }
      }
    };
    initPage();
  }, [fetchSubscription]);

  // --- Actions ---

  const handleGenerateUser = async () => {
    if (!userIdeaInput.trim()) return;
    setError(null);
    setGenerationType('user');
    setDisplayIdeas([]);
    setSelectedIdea(null);
    setIsDetailOpen(false);

    try {
      const ideas = await generateIdeas('validate_idea', userIdeaInput, currentProjectId);
      setDisplayIdeas(ideas);
      setCurrentStage('RESEARCH');
    } catch (err: any) {
      console.error('Generation error:', err);
      // specific error codes could be checked here
      if (err.message?.includes('429') || err.message?.includes('402')) {
          setPaywallFeature('idea_generation');
          setShowPaywall(true);
      }
    }
  };

  const handleGenerateAuto = async () => {
    setIsEngineGenerating(true);
    setIsThinking(true);
    setError(null);
    setGenerationType('auto');
    setDisplayIdeas([]);
    setSelectedIdea(null);
    setIsDetailOpen(false);

    try {
      const ideas = await discoverIdeas(currentProjectId);
      setDisplayIdeas(ideas);
      setCurrentStage('RESEARCH');
    } catch (err: any) {
      console.error('Opportunity error:', err);
      setError(err.message || "AI Discovery is warming up. Please try again in 30 seconds.");
    } finally {
      setIsEngineGenerating(false);
      setIsThinking(false);
    }
  };

  const onThinkingComplete = () => {
    setIsThinking(false);
  };

  const handleGenerateFromSignal = async (signal: MarketSignal) => {
    setError(null);
    setGenerationType('auto');
    setDisplayIdeas([]);
    setSelectedIdea(null);
    setIsDetailOpen(false);

    try {
      const data = await generateFromSignal(signal.source, signal.title, signal.description || '');
      
      // Handle both single object and array responses
      const ideasArray: any[] = Array.isArray(data) ? data : (data.ideas ? data.ideas : (data.title ? [data] : []));

      const mappedIdeas: Idea[] = ideasArray.map((item: any) => ({
        title: item.title,
        thesis: item.thesis || item.description || item.problem || item.solution || '',
        description: item.description || item.thesis || item.problem || '',
        market_size: item.market_size || item.target_market || 'Unknown',
        confidence_score: item.confidence_score ?? item.validation_score ?? 80,
        opportunity_score: item.opportunity_score ?? item.confidence_score ?? item.validation_score ?? 80,
        market_score: item.market_score ?? 75,
        execution_complexity: item.execution_complexity ?? 50,
        signals: item.signals,
        target_customer: item.target_customer || { 
          primary_user: item.target_audience || 'Target audience', 
          company_size: 'SMB', 
          industry_or_role: item.target_audience || 'SaaS' 
        },
        monetization: item.monetization ? (typeof item.monetization === 'string' ? { pricing_structure: item.monetization, who_pays: 'Users', value_prop: 'Value' } : item.monetization) : { pricing_structure: 'SaaS / Recurring', who_pays: 'Teams', value_prop: 'Efficiency gains' },
        problem_bullets: item.problem_bullets || [item.problem || signal.title],
        why_now_bullets: item.why_now_bullets || [item.why_now || `${signal.source} signal is trending now`],
        alternatives_structured: item.alternatives_structured || { today: ['Manual workarounds'], gaps: ['Not scalable'] },
        mvp_scope_bullets: item.mvp_scope_bullets || (item.core_features || ['Core product', 'Dashboard', 'Integrations']),
        confidence_reasoning_bullets: item.confidence_reasoning_bullets || ['Live signal detected'],
        risks_structured: item.risks_structured || { adoption: 'Moderate', technical: 'Standard', market: 'TBD' },
        id: item.id || item.idea_id || crypto.randomUUID(),
        idea_id: item.idea_id || item.id || crypto.randomUUID(),
      }));
      setDisplayIdeas(mappedIdeas);
      setCurrentStage('RESEARCH');
    } catch (err: any) {
      console.error('Signal generation error:', err);
      if (err.message?.includes('429') || err.message?.includes('402')) {
          setPaywallFeature('idea_generation');
          setShowPaywall(true);
      }
    }
  };

  const handleSelectIdea = async (idea: Idea) => {
    setSelectedIdea(idea);
    setIsDetailOpen(true);

    try {
      const result = await fetchIdeaDetails(idea);
      
      // Helper to extract string from potential object response (AI sometimes nests things)
      const formatItem = (item: any): string => {
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item !== null) {
          return item.label || item.keyword || item.title || item.name || JSON.stringify(item);
        }
        return String(item);
      };

      const enriched: Idea = {
        ...idea,
        title: result.title || idea.title,
        confidence_score: result.confidence_score || idea.confidence_score,
        market_size: result.market_size?.estimate || idea.market_size,
        execution_complexity: (result.complexity?.score !== undefined) ? result.complexity.score : idea.execution_complexity,
        problem_bullets: result.problem?.pain_points?.map(formatItem) || idea.problem_bullets || [],
        target_customer: {
          primary_user: result.target_customers?.primary || idea.target_customer?.primary_user || 'Target Market',
          company_size: 'SMB to Enterprise',
          industry_or_role: result.target_customers?.geography || idea.target_customer?.industry_or_role || 'Global'
        },
        monetization: {
          pricing_structure: result.monetization?.model || idea.monetization?.pricing_structure || 'Subscription',
          who_pays: result.target_customers?.primary || 'Target Customers',
          value_prop: result.problem?.summary || idea.monetization?.value_prop || 'Efficiency gains'
        },
        why_now_bullets: result.why_now?.trends?.map(formatItem) || idea.why_now_bullets || [],
        alternatives_structured: {
          today: result.market_gaps_today?.map(formatItem) || idea.alternatives_structured?.today || [],
          gaps: idea.alternatives_structured?.gaps || ["High competition intensity", "Market fragmentation"]
        },
        mvp_scope_bullets: result.mvp_scope?.core_features?.map(formatItem) || idea.mvp_scope_bullets || [],
        confidence_reasoning_bullets: [
          ...(result.why_smartbuilder_confident?.signals_used?.map(formatItem) || []),
          ...(result.why_smartbuilder_confident?.data_points?.map(formatItem) || [])
        ].slice(0, 5),
        risks_structured: {
          adoption: result.risks_to_validate?.[0]?.risk || 'User behavior shift',
          technical: result.risks_to_validate?.[1]?.risk || 'Standard scalability',
          market: result.risks_to_validate?.[2]?.risk || 'Competition speed'
        },
        is_discovery_only: false,
        thesis: result.why_now?.summary || idea.thesis || `A strategic opportunity in ${result.title}`,
      };
      setSelectedIdea(enriched);
    } catch (err) {
      console.error('Failed to generate investment brief:', err);
    }
  };

  const handlePromote = async (ideaId: string) => {
    // Find the idea in displayIdeas or use the selected one
    const ideaToPromote = displayIdeas.find(i => (i.id === ideaId || i.idea_id === ideaId)) || selectedIdea;
    const title = ideaToPromote?.title || '';
    
    // Navigate to research page with auto-run instruction, title, and deep mode
    router.push(`/research?ideaId=${ideaId}&idea=${encodeURIComponent(title)}&autoRun=true&mode=deep`);
  };

  const handleSelectOpportunity = (opp: OpportunityIdea) => {
    // Map OpportunityIdea to Idea format for the Detail Panel
    const mappedIdea: Idea = {
      title: opp.title,
      thesis: opp.market_hint || opp.problem?.split('. ')[0],
      market_size: opp.market_size || opp.score_data?.market_evidence?.funding_activity || '$1B+',
      problem_bullets: [opp.problem],
      target_customer: {
        primary_user: opp.target_customer,
        company_size: 'SMB to Mid-market',
        industry_or_role: 'Niche specific'
      },
      monetization: {
        pricing_structure: opp.monetization || 'SaaS / Recurring',
        who_pays: opp.target_customer,
        value_prop: 'Solving core inefficiencies identified in market signals.'
      },
      why_now_bullets: [opp.why_now],
      alternatives_structured: {
        today: ['Manual workarounds', 'Generic legacy tools'],
        gaps: ['Infficiency', 'Lack of automation']
      },
      mvp_scope_bullets: ['Core workflow engine', 'User dashboard', 'Initial data integration'],
      confidence_reasoning_bullets: [
        opp.score_data?.summary || 'Strong alignment with market trends.',
        'High signal detected from multiple data nodes.'
      ],
      risks_structured: {
        adoption: 'User behavior shift',
        technical: 'Standard scalability',
        market: 'Competition speed'
      },
      confidence_score: opp.score_data?.score || 85,
      market_score: 80,
      execution_complexity: 40,
      id: opp.id || crypto.randomUUID(),
      idea_id: opp.id || crypto.randomUUID()
    };
    setSelectedIdea(mappedIdea);
    setIsDetailOpen(true);
  };


  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden">

      {/* Soft Ambient Backgrounds */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        {/* STARTUP PIPELINE */}
        <div className="mb-12">
          <StartupPipeline currentStage={currentStage} />
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Content Area (Left) */}
          <div className="col-span-1 lg:col-span-8 space-y-8 text-left flex flex-col gap-8">
            {/* THINKING MODE */}
            {isThinking && (
              <ThinkingPanel onComplete={onThinkingComplete} />
            )}

            {/* 2. INPUT ZONE (Friendly Redesign) */}
            {!displayIdeas.length && !isLoading && !isThinking && (
              <div className="max-w-3xl mx-auto w-full animate-in fade-in zoom-in-95 duration-700 space-y-8">

                {/* USER IDEA INPUT - The "Magic Prompt" */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                  <div className="relative bg-[#09090b]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-3 shadow-2xl overflow-hidden transition-all hover:border-white/10">
                    <div className="px-6 pt-6 pb-2">
                      <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                          <Lightbulb size={20} />
                        </div>
                        What are you building?
                      </h2>
                      <p className="text-zinc-500 text-sm ml-12">Describe the problem or idea in natural language.</p>
                    </div>

                    <textarea
                      id="user-idea"
                      value={userIdeaInput}
                      onChange={(e) => setUserIdeaInput(e.target.value)}
                      placeholder="e.g. A marketplace for local chefs to host private dining experiences..."
                      className="w-full bg-transparent border-none p-6 text-lg text-white placeholder:text-zinc-700 placeholder:font-light focus:outline-none focus:ring-0 resize-none min-h-[160px]"
                    />

                    <div className="flex items-center justify-between px-4 pb-4 mt-2">
                      <div className="flex gap-2">
                        {/* Optional tiny tools/badges could go here */}
                      </div>
                      <button
                        onClick={handleGenerateUser}
                        disabled={!userIdeaInput.trim()}
                        className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-black hover:bg-indigo-500 hover:text-white text-sm font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group-hover:scale-[1.02] active:scale-95 duration-200"
                      >
                        Deep Dive
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ONE-CLICK DISCOVERY - Magical Banner */}
                <div className="relative overflow-hidden rounded-[2rem] border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors duration-500 cursor-pointer group" onClick={handleGenerateAuto}>
                  <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
                  <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-6 text-center md:text-left">
                      <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                        <Sparkles className="w-6 h-6 text-emerald-400 group-hover:animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">Feeling stuck? Let the AI discover ideas.</h3>
                        <p className="text-emerald-400/80 text-sm">We'll scan thousands of live market signals to find gaps for you.</p>
                      </div>
                    </div>
                    <button
                      className="shrink-0 flex items-center gap-2 px-6 py-3 bg-[#09090b] text-white border border-emerald-500/30 group-hover:border-emerald-500 text-sm font-bold rounded-xl transition-all shadow-xl group-hover:shadow-emerald-500/20"
                    >
                      <Search className="w-4 h-4" />
                      Explore Signals
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* LOADING STATE */}
            {isLoading && (
              <div className="h-[400px] flex flex-col items-center justify-center space-y-6 bg-[#18181b]/30 border border-[#27272a] border-dashed rounded-[2.5rem]">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
                  <div className="w-16 h-16 rounded-2xl bg-[#09090b] border border-indigo-500/30 flex items-center justify-center relative">
                    <BrainCircuit className="text-indigo-400 animate-pulse" size={32} />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="font-bold text-white uppercase tracking-widest">Analyzing Signals</p>
                  <p className="text-gray-500 text-sm">Connecting to live data sources and validating demand...</p>
                </div>
              </div>
            )}

            {/* UNIFIED RESULTS AREA */}
            {!isLoading && !isThinking && displayIdeas.length > 0 && (
              <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-500">
                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                  <div>
                    <h2 className="text-3xl font-extrabold text-white flex items-center mb-2">
                      <Sparkles className="w-8 h-8 mr-4 text-emerald-400" />
                      {generationType === 'auto' ? 'Venture Opportunities' : 'Detected Opportunities'}
                    </h2>
                    <p className="text-zinc-500 text-sm">
                      {generationType === 'auto'
                        ? 'Detected from 12,483 real-time market signals'
                        : 'Validated and refined for your specific concept'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setDisplayIdeas([]);
                      setUserIdeaInput('');
                      setSelectedIdea(null);
                      setIsDetailOpen(false);
                    }}
                    className="text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reset
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {displayIdeas.map((idea, index) => (
                    <IdeaCard
                      key={idea.idea_id || `idea-${index}`}
                      idea={idea}
                      isSelected={selectedIdea?.idea_id === idea.idea_id}
                      onClick={() => handleSelectIdea(idea)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="col-span-1 lg:col-span-4 lg:h-[calc(100vh-140px)] sticky top-6">
            <LiveMarketSignals onSignalClick={handleGenerateFromSignal} isGenerating={isLoading || isThinking} />
          </div>
        </div>
      </div>

      {/* DETAIL PANEL OVERLAY */}
      <IdeaDetailPanel
        idea={selectedIdea}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          // We clear the selected idea to reset the panel state
          setTimeout(() => setSelectedIdea(null), 500); 
        }}
        onPromote={handlePromote}
        isPromoting={false}
      />
      {/* PAYWALL MODAL */}
      {showPaywall && (
        <PaywallModal
          feature={paywallFeature}
          onClose={() => setShowPaywall(false)}
        />
      )}
    </div>
  );
}
