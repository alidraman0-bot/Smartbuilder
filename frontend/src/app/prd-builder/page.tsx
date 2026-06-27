"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Layers,
  Code,
  Shield,
  Server,
  Database,
  Cpu,
  Zap,
  Globe,
  Settings,
  AlertCircle,
  Briefcase,
  Users,
  Target,
  FileText,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  Copy,
  Download,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// ── Pipeline Stages ──────────────────────────────────────────────────────────
const PIPELINE_STAGES = [
  { label: "Analyzing product idea", icon: Target },
  { label: "Defining product vision & objectives", icon: Globe },
  { label: "Creating user personas", icon: Users },
  { label: "Writing user stories", icon: FileText },
  { label: "Mapping user flows", icon: Layers },
  { label: "Generating feature specifications", icon: Zap },
  { label: "Designing system architecture", icon: Server },
  { label: "Planning database architecture", icon: Database },
  { label: "Defining API specifications", icon: Code },
  { label: "Establishing security requirements", icon: Shield },
  { label: "Planning deployment architecture", icon: Cpu },
  { label: "Building engineering roadmap", icon: Briefcase },
  { label: "Assembling enterprise-grade PRD", icon: Settings },
];

// ── Section Icons Map ────────────────────────────────────────────────────────
const SECTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  product_overview: Target,
  product_vision: Globe,
  objectives: Target,
  user_personas: Users,
  user_stories: FileText,
  user_flows: Layers,
  functional_requirements: Settings,
  non_functional_requirements: Shield,
  feature_specifications: Zap,
  database_architecture: Database,
  api_specifications: Code,
  authentication_flow: Shield,
  permissions_model: Users,
  integrations: Code,
  system_architecture: Server,
  frontend_architecture: Layers,
  backend_architecture: Server,
  security_requirements: Shield,
  scalability_plan: Cpu,
  performance_requirements: Zap,
  error_handling: AlertCircle,
  analytics_requirements: BarChart3,
  deployment_architecture: Cpu,
  technical_risks: AlertCircle,
  engineering_roadmap: Briefcase,
};

function BarChart3(props: { className?: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}

// ── Section Renderer ─────────────────────────────────────────────────────────
function SectionContent({ data }: { data: unknown }) {
  if (!data || (typeof data === "object" && Object.keys(data as object).length === 0)) {
    return (
      <p className="text-[var(--color-text-muted)] italic text-sm">
        Section data not available.
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
export default function PRDBuilderPage() {
  const [formData, setFormData] = useState({
    product_name: "",
    idea: "",
    platform: "web",
    complexity: "enterprise",
    mode: "production",
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

    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => Math.min(prev + 1, PIPELINE_STAGES.length - 1));
    }, 3500);

    try {
      const res = await fetch(`/api/prd`, {
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20">
            <Code className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white font-[var(--font-display)]">
              PRD Builder
            </h1>
            <p className="text-sm text-[var(--color-text-tertiary)]">
              Enterprise-grade Product Requirements & Technical Architecture
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-4"
        >
          <div className="glass-card rounded-xl p-5 space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Configure Product
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                Product Name
              </label>
              <input
                type="text"
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                placeholder="e.g. Acme OS"
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-indigo-500/50 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                Product Idea *
              </label>
              <textarea
                value={formData.idea}
                onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
                placeholder="Describe your product idea, core features, and technical goals..."
                rows={4}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-indigo-500/50 focus:outline-none resize-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                Platform
              </label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-indigo-500/50 focus:outline-none transition-all"
              >
                {["web", "mobile", "saas", "ai", "desktop", "api", "hardware"].map((opt) => (
                  <option key={opt} value={opt}>{opt.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                Complexity
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "simple", label: "Simple", desc: "8 sections" },
                  { value: "medium", label: "Medium", desc: "14 sections" },
                  { value: "enterprise", label: "Enterprise", desc: "25 sections" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFormData({ ...formData, complexity: opt.value })}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      formData.complexity === opt.value
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
                  Generate PRD
                </>
              )}
            </button>
          </div>

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
                <Code className="w-10 h-10 text-indigo-400/60" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                AI PRD & Architecture Builder
              </h3>
              <p className="text-sm text-[var(--color-text-tertiary)] max-w-md mx-auto mb-4">
                Generate a production-grade PRD and technical architecture plan.
                Powered by Qwen 235B for documentation and Llama 3.3 70B for
                systems architecture and logic.
              </p>
              <div className="flex items-center justify-center gap-6 text-xs text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Database Schema</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> API Specs</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> System Design</span>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="glass-card rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      PRD Generated
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

              <div className="glass-card rounded-xl p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[var(--color-text-muted)]">PRD Confidence</span>
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

              <div className="space-y-2">
                {((result as Record<string, unknown>).section_order as Array<{ key: string; title: string }>)?.map(
                  (section: { key: string; title: string }, index: number) => (
                    <SectionCard
                      key={section.key}
                      sectionKey={section.key}
                      title={section.title}
                      data={((result as Record<string, unknown>).prd as Record<string, unknown>)?.[section.key]}
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
