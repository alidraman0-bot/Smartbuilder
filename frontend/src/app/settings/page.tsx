"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Settings as SettingsIcon, Key, CheckCircle2, XCircle, Loader2, Save,
  Sparkles, AlertCircle, Info, History, Brain, Users, Rocket, Shield,
  Bell, ChevronRight, Globe, Lock, Cpu, Eye, EyeOff, Terminal,
  Clock, Database, Zap, Layout
} from 'lucide-react';
import { usePreferenceStore } from '@/store/usePreferenceStore';

// Default values as per spec
const DEFAULT_PREFERENCES = {
  // 4.1 GENERAL
  default_project_stage: 'Idea',
  timezone: 'Auto-detect',
  formatting_locale: 'Locale-based',

  // 4.2 PROJECT MEMORY
  auto_persistence: true,
  version_history_depth: 'Keep all versions',
  research_snapshot_rules: 'Every generation',
  prd_locking_policy: 'Owner approval required',
  memory_visibility: 'All project members',
  export_traceability: true,
  retention_policy: 'Retain indefinitely',

  // 4.3 AI BEHAVIOR
  ai_autonomy_level: 'Guided',
  regeneration_rules: 'Preserve user edits',
  idea_creativity_bias: 50, // Balanced
  explanation_depth: 'Concise',

  // 4.4 COLLABORATION & ACCESS
  default_project_role: 'Viewer',
  require_owner_approval_prd: true,
  require_owner_approval_deployment: true,
  audit_log_visibility: 'Owners only',

  // 4.5 EXECUTION & DEPLOYMENT
  default_deployment_mode: 'Preview first',
  rollback_policy: 'Manual',
  environment_creation: 'One environment',

  // 4.6 DATA, SECURITY & COMPLIANCE
  data_residency: 'Automatic',
  compliance_mode: 'Standard',
  api_access: false,
  credential_handling: 'Managed by Smartbuilder',

  // 4.7 NOTIFICATIONS
  notification_channels: ['In-app'],
  alert_sensitivity: 'Critical only',
  summary_digests: 'Weekly'
};

export default function SettingsPage() {
  const { preferences, loading, fetchPreferences, updatePreferences } = usePreferenceStore();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localPrefs, setLocalPrefs] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // For API Keys (existing functionality)
  const [apiKeys, setApiKeys] = useState({
    openai_api_key: '',
    anthropic_api_key: '',
    google_api_key: '',
    testsprite_api_key: '',
  });

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  useEffect(() => {
    if (preferences) {
      setLocalPrefs({ ...DEFAULT_PREFERENCES, ...preferences });
    }
  }, [preferences]);

  const handleUpdatePreference = (key: string, value: any) => {
    setLocalPrefs((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await updatePreferences(localPrefs);

      // Handle API Keys if any were entered
      if (apiKeys.openai_api_key || apiKeys.anthropic_api_key || apiKeys.google_api_key) {
        const payload: any = {};
        if (apiKeys.openai_api_key) payload.openai_api_key = apiKeys.openai_api_key;
        if (apiKeys.anthropic_api_key) payload.anthropic_api_key = apiKeys.anthropic_api_key;
        if (apiKeys.google_api_key) payload.google_api_key = apiKeys.google_api_key;
        if (apiKeys.testsprite_api_key) payload.testsprite_api_key = apiKeys.testsprite_api_key;

        await fetch('/api/v1/settings/keys/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        // Reset API key inputs after saving
        setApiKeys({
          openai_api_key: '',
          anthropic_api_key: '',
          google_api_key: '',
          testsprite_api_key: '',
        });
      }

      setMessage({ type: 'success', text: 'System preferences updated successfully.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to update preferences: ' + error.message });
    } finally {
      setIsSaving(false);
    }
  };

  if (!localPrefs || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  const sections = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'memory', label: 'Project Memory', icon: History },
    { id: 'ai', label: 'AI Behavior', icon: Brain },
    { id: 'collab', label: 'Collaboration', icon: Users },
    { id: 'exec', label: 'Execution', icon: Rocket },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-32 animate-fade-in relative">
      {/* Header */}
      <header className="flex items-center justify-between sticky top-0 bg-black/50 backdrop-blur-xl z-30 py-6 border-b border-white/5 -mx-4 px-4 mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-500/30">
            <SettingsIcon size={28} className="text-indigo-400" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">System Preferences</h1>
            <p className="text-sm text-zinc-400 mt-0.5">Global behavior and default rules for the platform</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {message && (
            <div className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center space-x-2 animate-slide-in-right ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              }`}>
              {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{message.text}</span>
            </div>
          )}
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </header>

      <div className="flex gap-12">
        {/* Navigation Sidebar */}
        <aside className="w-64 shrink-0 h-fit sticky top-32 space-y-2 hidden md:block">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => {
                setActiveTab(section.id);
                document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${activeTab === section.id
                ? 'bg-white/5 border border-white/10 text-white shadow-lg shadow-black/20'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'
                }`}
            >
              <section.icon size={18} className={activeTab === section.id ? 'text-indigo-400' : 'text-zinc-600 group-hover:text-zinc-400'} />
              <span className="font-medium">{section.label}</span>
              {activeTab === section.id && <ChevronRight size={14} className="ml-auto text-indigo-400/50" />}
            </button>
          ))}
          <div className="pt-4 border-t border-white/5 mt-4">
            <label className="flex items-center space-x-3 px-4 py-3 cursor-pointer group">
              <input
                type="checkbox"
                className="hidden"
                checked={showAdvanced}
                onChange={() => setShowAdvanced(!showAdvanced)}
              />
              <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${showAdvanced ? 'bg-indigo-500' : 'bg-zinc-800'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${showAdvanced ? 'left-6' : 'left-1'}`} />
              </div>
              <span className="text-sm font-medium text-zinc-500 group-hover:text-zinc-300">Advanced Mode</span>
            </label>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 space-y-16 max-w-3xl">
          {/* GENERAL SECTION */}
          <Section id="general" title="General" subtitle="Define global product behavior.">
            <PreferenceItem
              label="Default Project Stage"
              description="The starting lifecycle phase for new projects."
              value={localPrefs.default_project_stage}
              options={['Idea', 'MVP', 'Launch']}
              onChange={(val: any) => handleUpdatePreference('default_project_stage', val)}
            />
            <PreferenceItem
              label="Time Zone"
              description="Controls timestamp display across all project activities."
              value={localPrefs.timezone}
              options={['Auto-detect', 'Manual select']}
              onChange={(val: any) => handleUpdatePreference('timezone', val)}
            />
            <PreferenceItem
              label="Date & Number Formatting"
              description="Locale-based formats for dates, currencies, and numbers."
              value={localPrefs.formatting_locale}
              options={['Locale-based', 'Manual']}
              onChange={(val: any) => handleUpdatePreference('formatting_locale', val)}
            />
          </Section>

          {/* PROJECT MEMORY SECTION */}
          <Section id="memory" title="Project Memory" subtitle="Control how Smartbuilder preserves decisions over time.">
            <PreferenceToggle
              label="Automatic Persistence"
              description="Smartbuilder automatically saves all generated ideas, research, plans, and execution events."
              checked={localPrefs.auto_persistence}
              onChange={(val: any) => handleUpdatePreference('auto_persistence', val)}
              icon={<Database size={16} className="text-indigo-400" />}
            />
            <PreferenceItem
              label="Version History Depth"
              value={localPrefs.version_history_depth}
              options={['Keep all versions', 'Keep last 10', 'Keep last 5']}
              onChange={(val: any) => handleUpdatePreference('version_history_depth', val)}
            />
            <PreferenceItem
              label="Market Research Snapshot Rules"
              value={localPrefs.research_snapshot_rules}
              options={['Every generation', 'Only when data changes significantly', 'Manual']}
              onChange={(val: any) => handleUpdatePreference('research_snapshot_rules', val)}
            />
            <PreferenceItem
              label="PRD Locking Policy"
              value={localPrefs.prd_locking_policy}
              options={['Owner approval required', 'Editors allowed', 'Auto-lock when MVP build starts']}
              onChange={(val: any) => handleUpdatePreference('prd_locking_policy', val)}
            />

            {showAdvanced && (
              <div className="pt-6 border-t border-white/5 space-y-6">
                <PreferenceItem
                  label="Memory Visibility"
                  value={localPrefs.memory_visibility}
                  options={['All project members', 'Owners + editors', 'Owners only']}
                  onChange={(val: any) => handleUpdatePreference('memory_visibility', val)}
                />
                <PreferenceToggle
                  label="Export Traceability"
                  description="Adds snapshot references and timestamps to all exports."
                  checked={localPrefs.export_traceability}
                  onChange={(val: any) => handleUpdatePreference('export_traceability', val)}
                />
                <PreferenceItem
                  label="Retention Policy"
                  value={localPrefs.retention_policy}
                  options={['Retain indefinitely', '12 months', '6 months']}
                  onChange={(val: any) => handleUpdatePreference('retention_policy', val)}
                  warning="Shorter retention reduces historical insight and auditability."
                />
              </div>
            )}
          </Section>

          {/* AI BEHAVIOR SECTION */}
          <Section id="ai" title="AI Behavior" subtitle="Control how Smartbuilder reasons, generates, and adapts.">
            <PreferenceItem
              label="AI Autonomy Level"
              value={localPrefs.ai_autonomy_level}
              options={['Assistive', 'Guided', 'Autonomous']}
              onChange={(val: any) => handleUpdatePreference('ai_autonomy_level', val)}
              icon={<Zap size={16} className="text-amber-400" />}
            />
            <PreferenceItem
              label="Regeneration Rules"
              value={localPrefs.regeneration_rules}
              options={['Preserve user edits', 'Regenerate entire sections', 'Ask before overwriting assumptions']}
              onChange={(val: any) => handleUpdatePreference('regeneration_rules', val)}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-zinc-300">Idea Creativity Bias</h4>
                  <p className="text-xs text-zinc-500 mt-1">Controls the risk profile of generated startup ideas.</p>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
                  {localPrefs.idea_creativity_bias < 33 ? 'Conservative' : localPrefs.idea_creativity_bias < 66 ? 'Balanced' : 'Exploratory'}
                </span>
              </div>
              <input
                type="range"
                min="0" max="100"
                value={localPrefs.idea_creativity_bias}
                onChange={(e) => handleUpdatePreference('idea_creativity_bias', parseInt(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                <span>Validated Markets</span>
                <span>Balanced</span>
                <span>New Categories</span>
              </div>
            </div>

            <PreferenceItem
              label="Explanation Depth"
              value={localPrefs.explanation_depth}
              options={['Concise', 'Detailed', 'Investor-grade']}
              onChange={(val: any) => handleUpdatePreference('explanation_depth', val)}
            />

            {showAdvanced && (
              <div className="pt-6 border-t border-white/5 space-y-6">
                <h4 className="text-xs font-bold text-indigo-400/70 uppercase tracking-widest flex items-center space-x-2">
                  <Terminal size={14} />
                  <span>Agent Connectivity</span>
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <ApiKeyInput
                    label="OpenAI API Key"
                    placeholder="sk-..."
                    value={apiKeys.openai_api_key}
                    onChange={(val: any) => setApiKeys({ ...apiKeys, openai_api_key: val })}
                  />
                  <ApiKeyInput
                    label="Anthropic API Key"
                    placeholder="sk-ant-..."
                    value={apiKeys.anthropic_api_key}
                    onChange={(val: any) => setApiKeys({ ...apiKeys, anthropic_api_key: val })}
                  />
                  <ApiKeyInput
                    label="Google Gemini API Key"
                    placeholder="AIza..."
                    value={apiKeys.google_api_key}
                    onChange={(val: any) => setApiKeys({ ...apiKeys, google_api_key: val })}
                  />
                  <ApiKeyInput
                    label="TestSprite API Key"
                    placeholder="sk-user-..."
                    value={apiKeys.testsprite_api_key}
                    onChange={(val: any) => setApiKeys({ ...apiKeys, testsprite_api_key: val })}
                  />
                </div>
              </div>
            )}
          </Section>

          {/* COLLABORATION & ACCESS */}
          <Section id="collab" title="Collaboration & Access" subtitle="Define how teams work inside Smartbuilder.">
            <PreferenceItem
              label="Default Project Role"
              value={localPrefs.default_project_role}
              options={['Viewer', 'Editor']}
              onChange={(val: any) => handleUpdatePreference('default_project_role', val)}
            />
            <div className="space-y-6">
              <PreferenceToggle
                label="Require PRD Approval"
                description="Require owner approval for PRD lock."
                checked={localPrefs.require_owner_approval_prd}
                onChange={(val: any) => handleUpdatePreference('require_owner_approval_prd', val)}
              />
              <PreferenceToggle
                label="Require Deployment Approval"
                description="Require owner approval for any production deployments."
                checked={localPrefs.require_owner_approval_deployment}
                onChange={(val: any) => handleUpdatePreference('require_owner_approval_deployment', val)}
              />
            </div>
            <PreferenceItem
              label="Audit Log Visibility"
              value={localPrefs.audit_log_visibility}
              options={['Owners only', 'Owners + editors']}
              onChange={(val: any) => handleUpdatePreference('audit_log_visibility', val)}
            />
          </Section>

          {/* EXECUTION & DEPLOYMENT */}
          <Section id="exec" title="Execution & Deployment" subtitle="Control how builds and deployments are handled.">
            <PreferenceItem
              label="Default Deployment Mode"
              value={localPrefs.default_deployment_mode}
              options={['Preview first', 'Auto-production']}
              onChange={(val: any) => handleUpdatePreference('default_deployment_mode', val)}
            />
            <PreferenceItem
              label="Rollback Policy"
              value={localPrefs.rollback_policy}
              options={['Manual', 'Automatic on failure']}
              onChange={(val: any) => handleUpdatePreference('rollback_policy', val)}
            />
            <PreferenceItem
              label="Environment Creation"
              value={localPrefs.environment_creation}
              options={['One environment', 'Separate preview / production']}
              onChange={(val: any) => handleUpdatePreference('environment_creation', val)}
            />
          </Section>

          {/* DATA, SECURITY & COMPLIANCE */}
          <Section id="security" title="Data & Compliance" subtitle="Trust, safety, and regulatory posture.">
            <PreferenceItem
              label="Data Residency"
              value={localPrefs.data_residency}
              options={['Automatic', 'EU', 'US', 'Africa']}
              onChange={(val: any) => handleUpdatePreference('data_residency', val)}
              icon={<Globe size={16} className="text-indigo-400" />}
            />
            <PreferenceItem
              label="Compliance Mode"
              value={localPrefs.compliance_mode}
              options={['Standard', 'SOC-2 aligned', 'Enterprise']}
              onChange={(val: any) => handleUpdatePreference('compliance_mode', val)}
              icon={<Shield size={16} className="text-emerald-400" />}
            />

            {showAdvanced && (
              <div className="pt-6 border-t border-white/5 space-y-6">
                <PreferenceToggle
                  label="API Access"
                  description="Enable programmatic access to Smartbuilder data."
                  checked={localPrefs.api_access}
                  onChange={(val: any) => handleUpdatePreference('api_access', val)}
                />
                <PreferenceItem
                  label="Credential Handling"
                  value={localPrefs.credential_handling}
                  options={['Managed by Smartbuilder', 'User-supplied secrets']}
                  onChange={(val: any) => handleUpdatePreference('credential_handling', val)}
                  icon={<Lock size={16} className="text-amber-400" />}
                />
              </div>
            )}
          </Section>

          {/* NOTIFICATIONS */}
          <Section id="notifications" title="Notifications" subtitle="Decide what deserves your attention.">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-zinc-300">Channels</h4>
              <div className="flex gap-4">
                {['In-app', 'Email', 'Slack'].map(channel => (
                  <label key={channel} className={`flex items-center space-x-3 px-4 py-2 rounded-xl border transition-all cursor-pointer ${localPrefs.notification_channels.includes(channel)
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-white'
                    : 'bg-white/5 border-white/10 text-zinc-500 hover:border-white/20'
                    }`}>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={localPrefs.notification_channels.includes(channel)}
                      onChange={(e) => {
                        const channels = [...localPrefs.notification_channels];
                        if (e.target.checked) channels.push(channel);
                        else if (channels.length > 1) channels.splice(channels.indexOf(channel), 1);
                        handleUpdatePreference('notification_channels', channels);
                      }}
                    />
                    <span className="text-sm font-medium">{channel}</span>
                  </label>
                ))}
              </div>
            </div>

            <PreferenceItem
              label="Alert Sensitivity"
              value={localPrefs.alert_sensitivity}
              options={['Critical only', 'Critical + warnings', 'All activity']}
              onChange={(val: any) => handleUpdatePreference('alert_sensitivity', val)}
            />
            <PreferenceItem
              label="Summary Digests"
              value={localPrefs.summary_digests}
              options={['Weekly', 'Daily', 'Off']}
              onChange={(val: any) => handleUpdatePreference('summary_digests', val)}
            />
          </Section>
        </div>
      </div>
    </div>
  );
}

// Reusable Components
function Section({ id, title, subtitle, children }: { id: string, title: string, subtitle: string, children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-40 space-y-8">
      <div className="border-l-4 border-indigo-500 pl-6 py-1">
        <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
        <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>
      </div>
      <div className="glass-card rounded-[32px] border border-white/5 p-8 space-y-10 bg-white/[0.01]">
        {children}
      </div>
    </div>
  );
}

function PreferenceItem({ label, description, value, options, onChange, icon, warning }: any) {
  return (
    <div className="flex items-start justify-between group">
      <div className="space-y-1 max-w-[60%]">
        <div className="flex items-center space-x-2">
          {icon}
          <h4 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">{label}</h4>
        </div>
        {description && <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>}
        {warning && (
          <p className="text-[10px] text-amber-500/80 font-medium flex items-center space-x-1 mt-2">
            <AlertCircle size={10} />
            <span>{warning}</span>
          </p>
        )}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500/50 outline-none hover:bg-zinc-800 transition-all min-w-[200px] cursor-pointer"
      >
        {options.map((opt: string) => (
          <option key={opt} value={opt} className="bg-zinc-900">{opt}</option>
        ))}
      </select>
    </div>
  );
}

function PreferenceToggle({ label, description, checked, onChange, icon }: any) {
  return (
    <div className="flex items-start justify-between group">
      <div className="space-y-1 max-w-[70%]">
        <div className="flex items-center space-x-2">
          {icon}
          <h4 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">{label}</h4>
        </div>
        {description && <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full relative transition-all duration-500 shrink-0 ${checked ? 'bg-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-zinc-800'
          }`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${checked ? 'left-7' : 'left-1'
          }`} />
      </button>
    </div>
  );
}

function ApiKeyInput({ label, placeholder, value, onChange }: any) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white font-mono focus:border-indigo-500/50 outline-none transition-all"
        />
        <button
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-indigo-400 transition-colors"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

