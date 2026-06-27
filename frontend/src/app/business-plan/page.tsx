"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  BarChart3,
  Target,
  Shield,
  DollarSign,
  Users,
  Rocket,
  FileText,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Building2,
  Globe,
  Briefcase,
  Zap,
  ArrowRight,
  Download,
  Copy,
  ChevronDown,
  ChevronUp,
  Brain,
  Layers,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// ── Pipeline Stages ──────────────────────────────────────────────────────────
const PIPELINE_STAGES = [
  { label: "Collecting market intelligence", icon: Globe },
  { label: "Analyzing industry landscape", icon: Building2 },
  { label: "Sizing addressable market (TAM/SAM/SOM)", icon: BarChart3 },
  { label: "Analyzing competitors", icon: Target },
  { label: "Detecting customer pain points", icon: Users },
  { label: "Generating business strategy", icon: Brain },
  { label: "Building financial forecasts", icon: DollarSign },
  { label: "Calculating unit economics", icon: TrendingUp },
  { label: "Assessing risks & opportunities", icon: Shield },
  { label: "Generating SWOT analysis", icon: Layers },
  { label: "Evaluating investor attractiveness", icon: Briefcase },
  { label: "Creating go-to-market strategy", icon: Rocket },
  { label: "Generating AI strategic recommendations", icon: Sparkles },
  { label: "Assembling investor-grade business plan", icon: FileText },
];

// ── Section Icons Map ────────────────────────────────────────────────────────
const SECTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  executive_summary: FileText,
  company_overview: Building2,
  problem_statement: AlertCircle,
  solution: Zap,
  market_opportunity: Globe,
  industry_analysis: BarChart3,
  competitive_analysis: Target,
  customer_segmentation: Users,
  revenue_model: DollarSign,
  pricing_strategy: DollarSign,
  go_to_market: Rocket,
  growth_strategy: TrendingUp,
  operations_plan: Briefcase,
  marketing_strategy: Sparkles,
  sales_strategy: Users,
  product_roadmap: Layers,
  financial_forecasts: BarChart3,
  unit_economics: TrendingUp,
  risk_analysis: Shield,
  swot_analysis: Layers,
  investor_attractiveness: Briefcase,
  scalability_analysis: TrendingUp,
  funding_strategy: DollarSign,
  exit_strategy: ArrowRight,
  ai_strategic_recommendations: Brain,
};

// ── Section Renderer ─────────────────────────────────────────────────────────
function SectionContent({ data }: { data: unknown }) {
  if (!data || (typeof data === "object" && Object.keys(data as object).length === 0)) {
    return (
      <p className="text-[var(--color-text-muted)] italic text-sm">
        Section data not available — AI generation may have been skipped for this section.
      </p>
    );
  }

  if (typeof data === "string") {
    return <p className="text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">{data}</p>;
  }

  if (Array.isArray(data)) {
    return (
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={i} className="pl-3 border-l-2 border-[var(--color-primary-20)]">
            <SectionContent data={item} />
          </div>
        ))}
      </div>
    );
  }

  if (typeof data === "object" && data !== null) {
    const entries = Object.entries(data as Record<string, unknown>);
    return (
      <div className="space-y-4">
        {entries.map(([key, value]) => (
          <div key={key} className="space-y-1">
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)] capitalize">
              {key.replace(/_/g, " ")}
            </h4>
            <div className="pl-3">
              <SectionContent data={value} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <p className="text-[var(--color-text-secondary)]">{String(data)}</p>;
}

// ── Collapsible Section Card ─────────────────────────────────────────────────
function SectionCard({
  sectionKey,
  title,
  data,
  index,
}: {
  sectionKey: string;
  title: string;
  data: unknown;
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(index < 3);
  const Icon = SECTION_ICONS[sectionKey] || FileText;
  const hasData = data && typeof data === "object" && Object.keys(data as object).length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${hasData
            ? "bg-[var(--color-primary-10)] text-[var(--color-primary)]"
            : "bg-white/5 text-[var(--color-text-muted)]"
          }`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">{title}</span>
            <span className="ml-2 text-xs text-[var(--color-text-muted)]">
              {hasData ? "✓ Generated" : "⏳ Pending"}
            </span>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-[var(--color-text-muted)]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-white/[0.04]">
              <div className="pt-3">
                <SectionContent data={data} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function BusinessPlanPage() {
  const [formData, setFormData] = useState({
    idea: "",
    industry: "Technology",
    target_market: "",
    business_model: "SaaS",
    region: "Global",
    depth: "investor",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!formData.idea.trim()) return;
    setIsGenerating(true);
    setError(null);
    setResult(null);
    setCurrentStage(0);

    // Simulate stage progression while API processes
    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => Math.min(prev + 1, PIPELINE_STAGES.length - 1));
    }, 4000);

    try {
      const res = await fetch(`${API_URL}/api/business-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `API Error: ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
      setCurrentStage(PIPELINE_STAGES.length - 1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Generation failed";
      setError(message);
    } finally {
      clearInterval(stageInterval);
      setIsGenerating(false);
    }
  }, [formData]);

  const handleCopyJSON = useCallback(() => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    }
  }, [result]);

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20">
            <Briefcase className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white font-[var(--font-display)]">
              Business Plan Builder
            </h1>
            <p className="text-sm text-[var(--color-text-tertiary)]">
              McKinsey + YC + Sequoia-grade investor documentation
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left Panel: Input Form ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-4"
        >
          <div className="glass-card rounded-xl p-5 space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Configure Your Plan
            </h2>

            {/* Idea */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                Startup Idea *
              </label>
              <textarea
                value={formData.idea}
                onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
                placeholder="Describe your startup idea in detail..."
                rows={4}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 focus:outline-none resize-none transition-all"
              />
            </div>

            {/* Industry */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                Industry
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-indigo-500/50 focus:outline-none transition-all"
              >
                {["Technology", "FinTech", "HealthTech", "EdTech", "E-Commerce",
                  "SaaS", "AI/ML", "CleanTech", "PropTech", "InsurTech",
                  "FoodTech", "Logistics", "Media", "Gaming", "Cybersecurity",
                  "DevTools", "HRTech", "LegalTech", "AgriTech", "Other"].map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Target Market */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                Target Market
              </label>
              <input
                type="text"
                value={formData.target_market}
                onChange={(e) => setFormData({ ...formData, target_market: e.target.value })}
                placeholder="e.g. SMBs with 10-200 employees"
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-indigo-500/50 focus:outline-none transition-all"
              />
            </div>

            {/* Business Model */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                Business Model
              </label>
              <select
                value={formData.business_model}
                onChange={(e) => setFormData({ ...formData, business_model: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-indigo-500/50 focus:outline-none transition-all"
              >
                {["SaaS", "Marketplace", "Usage-Based", "Freemium", "Enterprise",
                  "B2C Subscription", "API/Platform", "Advertising", "Hybrid"].map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Region */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                Region
              </label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-indigo-500/50 focus:outline-none transition-all"
              >
                {["Global", "North America", "Europe", "Africa", "Asia-Pacific",
                  "Latin America", "Middle East", "Southeast Asia"].map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Depth */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                Depth Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "basic", label: "Basic", desc: "10 sections" },
                  { value: "advanced", label: "Advanced", desc: "18 sections" },
                  { value: "investor", label: "Investor", desc: "25 sections" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFormData({ ...formData, depth: opt.value })}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      formData.depth === opt.value
                        ? "border-indigo-500/50 bg-indigo-500/10 text-white"
                        : "border-white/10 bg-white/[0.02] text-[var(--color-text-tertiary)] hover:border-white/20"
                    }`}
                  >
                    <div className="text-xs font-medium">{opt.label}</div>
                    <div className="text-[10px] text-[var(--color-text-muted)]">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !formData.idea.trim()}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Business Plan
                </>
              )}
            </button>
          </div>

          {/* ── Pipeline Progress ────────────────────────────────────── */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card rounded-xl p-4"
              >
                <h3 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-3">
                  AI Pipeline
                </h3>
                <div className="space-y-1.5">
                  {PIPELINE_STAGES.map((stage, i) => {
                    const StageIcon = stage.icon;
                    const isActive = i === currentStage;
                    const isComplete = i < currentStage;
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-2.5 py-1 px-2 rounded-md transition-all text-xs ${
                          isActive
                            ? "bg-indigo-500/10 text-indigo-300"
                            : isComplete
                            ? "text-emerald-400/70"
                            : "text-[var(--color-text-disabled)]"
                        }`}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : isActive ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                        ) : (
                          <StageIcon className="w-3.5 h-3.5 shrink-0 opacity-40" />
                        )}
                        <span>{stage.label}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Right Panel: Results ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card rounded-xl p-4 mb-4 border-red-500/20"
            >
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Generation Error</span>
              </div>
              <p className="text-xs text-red-300/70 mt-1">{error}</p>
            </motion.div>
          )}

          {!result && !isGenerating && !error && (
            <div className="glass-card rounded-xl p-12 text-center">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 w-fit mx-auto mb-4">
                <Briefcase className="w-10 h-10 text-indigo-400/60" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                AI Business Plan Builder
              </h3>
              <p className="text-sm text-[var(--color-text-tertiary)] max-w-md mx-auto mb-4">
                Generate an investor-grade business plan with up to 25 sections.
                Powered by DeepSeek R1, Qwen 235B, and Llama 3.3 70B for
                institutional-quality strategic reasoning.
              </p>
              <div className="flex items-center justify-center gap-6 text-xs text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> TAM/SAM/SOM</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Financial Models</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> SWOT Analysis</span>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Result Header */}
              <div className="glass-card rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Business Plan Generated
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {(result as Record<string, unknown>).completed_sections as number}/{(result as Record<string, unknown>).total_sections as number} sections •
                      Confidence: {(result as Record<string, unknown>).confidence_score as number}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyJSON}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--color-text-tertiary)] transition-all"
                    title="Copy JSON"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--color-text-tertiary)] transition-all"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Confidence Bar */}
              <div className="glass-card rounded-xl p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[var(--color-text-muted)]">Plan Confidence</span>
                  <span className="text-xs font-mono text-[var(--color-primary)]">
                    {(result as Record<string, unknown>).confidence_score as number}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(result as Record<string, unknown>).confidence_score as number}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  />
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-2">
                {((result as Record<string, unknown>).section_order as Array<{ key: string; title: string }>)?.map(
                  (section: { key: string; title: string }, index: number) => (
                    <SectionCard
                      key={section.key}
                      sectionKey={section.key}
                      title={section.title}
                      data={((result as Record<string, unknown>).business_plan as Record<string, unknown>)?.[section.key]}
                      index={index}
                    />
                  )
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
