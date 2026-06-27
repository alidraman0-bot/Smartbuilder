"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, Server, Globe, Activity, Terminal, ShieldAlert, Cpu, 
  Zap, GitBranch, Settings, Database, Cloud, CloudLightning,
  ChevronRight, Play, CheckCircle2, XCircle, AlertCircle, RefreshCw,
  Search, Bell, User, Monitor, Layers, Box, Wrench, ArrowUpRight,
  Code2, Eye, GaugeCircle, BarChart3, Users, Network, Key, Plus, Trash2
} from 'lucide-react';
import DeploymentsTable from '@/components/deploy/DeploymentsTable';
import DomainsTab from '@/components/deploy/DomainsTab';
import SettingsTab from '@/components/deploy/SettingsTab';
import DeploymentDetailsDrawer from '@/components/deploy/DeploymentDetailsDrawer';
import { Project, Deployment, Domain, EnvironmentVariable, DeploymentDetails } from '@/types/deploy';

const DEPLOYMENT_STATES = [
  "Preparing deployment...",
  "Analyzing framework...",
  "Installing dependencies...",
  "Building application...",
  "Optimizing assets...",
  "Deploying to edge network...",
  "Configuring CDN...",
  "Generating SSL certificates...",
  "Activating monitoring...",
  "Deployment successful..."
];

export default function DeployOS() {
  const [activeTab, setActiveTab] = useState('overview');
  const [deployStep, setDeployStep] = useState(-1);
  const [isDeploying, setIsDeploying] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  // Selected Deployment & Drawer state
  const [selectedDeploymentId, setSelectedDeploymentId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Project Details
  const [project, setProject] = useState<Project>({
    project_id: 'proj_smartbuilder_prod',
    name: 'SmartBuilder Production',
    framework: 'Next.js',
    environment: 'Production',
    status: 'active',
    latest_deployment_id: 'dep_1',
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    url: 'https://smartbuilder.vercel.app',
    root_directory: './'
  });

  // Deployments list state
  const [deployments, setDeployments] = useState<Deployment[]>([
    {
      deployment_id: 'dep_1',
      project_id: 'proj_smartbuilder_prod',
      status: 'success',
      commit_message: 'Production stable release - analytics & SRE dashboard',
      environment: 'Production',
      created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
      completed_at: new Date(Date.now() - 3600 * 1000 + 45000).toISOString(),
      duration: '45s',
      url: 'https://smartbuilder.vercel.app',
      version: 'v2.4.1',
      triggered_by: 'Smartbuilder AI'
    },
    {
      deployment_id: 'dep_2',
      project_id: 'proj_smartbuilder_prod',
      status: 'success',
      commit_message: 'Update telemetry hooks and SSE streams',
      environment: 'Production',
      created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      completed_at: new Date(Date.now() - 5 * 3600 * 1000 + 52000).toISOString(),
      duration: '52s',
      url: 'https://smartbuilder-git-main.vercel.app',
      version: 'v2.4.0',
      triggered_by: 'user@smartbuilder.com'
    },
    {
      deployment_id: 'dep_3',
      project_id: 'proj_smartbuilder_prod',
      status: 'failed',
      commit_message: 'Experimental: Add Native AI Router deepseek stream integration',
      environment: 'Preview',
      created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      completed_at: new Date(Date.now() - 24 * 3600 * 1000 + 12000).toISOString(),
      duration: '12s',
      url: null,
      version: 'v2.3.9-beta',
      triggered_by: 'Smartbuilder AI'
    }
  ]);

  // Domains list state
  const [domains, setDomains] = useState<Domain[]>([
    {
      domain: 'smartbuilder.vercel.app',
      type: 'default',
      ssl_status: 'active',
      dns_status: 'verified',
      created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
    },
    {
      domain: 'smartbuilder.app',
      type: 'custom',
      ssl_status: 'active',
      dns_status: 'verified',
      created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
    }
  ]);

  // Env Variables list state
  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>([
    { key: 'SUPABASE_URL', value: 'https://xyz.supabase.co', environment: 'Both', is_secret: false },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', value: 'secret_jwt_token', environment: 'Production', is_secret: true },
    { key: 'GEMINI_API_KEY', value: 'AIzaSyBqsg...', environment: 'Production', is_secret: true }
  ]);

  // Live Edge function mock logs state
  const [edgeLogs, setEdgeLogs] = useState<string[]>([
    "[Edge] GET /api/v1/projects - status 200 - 12ms",
    "[Edge] POST /api/v1/deploy/start - status 202 - 142ms",
    "[Edge] GET /api/v1/monitor/status - status 200 - 8ms"
  ]);

  // Custom Env addition state
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvVal, setNewEnvVal] = useState('');
  const [newEnvTarget, setNewEnvTarget] = useState<'Production' | 'Preview' | 'Both'>('Both');

  const startDeployment = () => {
    setIsDeploying(true);
    setDeployStep(0);
    setLogs(["[SYSTEM] Initiating autonomous deployment sequence..."]);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isDeploying && deployStep < DEPLOYMENT_STATES.length) {
      timer = setTimeout(() => {
        setLogs(prev => [...prev, `> ${DEPLOYMENT_STATES[deployStep]}`]);
        setDeployStep(prev => prev + 1);
      }, 1200 + Math.random() * 800);
    } else if (deployStep === DEPLOYMENT_STATES.length) {
      timer = setTimeout(() => {
        setLogs(prev => [...prev, "[SUCCESS] Application is now live at edge!"]);
        setIsDeploying(false);
        // Add new deployment to the list
        const newDepId = `dep_${deployments.length + 1}`;
        setDeployments(prev => [
          {
            deployment_id: newDepId,
            project_id: 'proj_smartbuilder_prod',
            status: 'success',
            commit_message: 'Autonomous smart deployment build',
            environment: 'Production',
            created_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            duration: '22s',
            url: 'https://smartbuilder.vercel.app',
            version: `v2.4.${deployments.length}`,
            triggered_by: 'Smartbuilder AI'
          },
          ...prev
        ]);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [isDeploying, deployStep]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Helper to fetch details for the selected deployment
  const getSelectedDeploymentDetails = (): DeploymentDetails | null => {
    if (!selectedDeploymentId) return null;
    const dep = deployments.find(d => d.deployment_id === selectedDeploymentId);
    if (!dep) return null;
    return {
      deployment: dep,
      logs: [
        { timestamp: new Date(dep.created_at).toLocaleTimeString(), stage: 'SYSTEM', message: 'Triggered deployment sequence...', type: 'info' },
        { timestamp: new Date(dep.created_at).toLocaleTimeString(), stage: 'BUILD', message: 'Running build commands...', type: 'info' },
        { timestamp: new Date(dep.created_at).toLocaleTimeString(), stage: 'DEVICES', message: 'Optimizing assets and packaging bundle...', type: 'info' },
        { timestamp: new Date(dep.created_at).toLocaleTimeString(), stage: 'CDN', message: 'Publishing live to edge CDN network.', type: 'success' }
      ],
      configuration: {
        runtime: 'Node.js 20.x',
        region: 'us-east-1',
        memory: '512 MB',
        timeout: '10s',
        build_command: 'npm run build',
        start_command: 'npm run start'
      },
      environment_variables: envVars
    };
  };

  const handleUpdateProject = async (updates: Partial<Project>) => {
    setProject(prev => ({ ...prev, ...updates }));
  };

  const handleAddEnv = () => {
    if (!newEnvKey || !newEnvVal) return;
    setEnvVars(prev => [...prev, { key: newEnvKey, value: newEnvVal, environment: newEnvTarget, is_secret: true }]);
    setNewEnvKey('');
    setNewEnvVal('');
  };

  const handleRemoveEnv = (key: string) => {
    setEnvVars(prev => prev.filter(v => v.key !== key));
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] text-gray-300 font-sans overflow-hidden selection:bg-indigo-500/30">
      
      {/* TOP NAVBAR */}
      <nav className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a]/80 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-white font-semibold text-lg tracking-tight">
            <Rocket className="w-5 h-5 text-indigo-500" />
            <span>SmartBuilder</span>
            <span className="text-gray-500 font-light mx-2">/</span>
            <span className="text-gray-200">Deploy OS</span>
          </div>
          
          <div className="hidden md:flex items-center gap-1 text-sm font-medium">
            {['Overview', 'Environments', 'Edge Networks', 'Deployments'].map(item => (
              <button 
                key={item} 
                onClick={() => {
                  if (item === 'Overview') setActiveTab('overview');
                  if (item === 'Environments') setActiveTab('env');
                  if (item === 'Edge Networks') setActiveTab('functions');
                  if (item === 'Deployments') setActiveTab('deployments');
                }}
                className={`px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors ${activeTab.toLowerCase().includes(item.toLowerCase().slice(0, 4)) ? 'text-white bg-white/5' : 'text-gray-400 hover:text-white'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 group-hover:text-gray-300 transition-colors" />
            <input 
              type="text" 
              placeholder="Search deployments..." 
              className="bg-black/50 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all w-64"
            />
          </div>
          <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-[#0a0a0a]"></span>
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-indigo-500/20 cursor-pointer">
            A
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        
        {/* INNER SIDEBAR */}
        <aside className="w-64 border-r border-white/5 bg-[#0a0a0a]/50 flex flex-col overflow-y-auto shrink-0">
          <div className="p-4">
            <button 
              onClick={startDeployment}
              disabled={isDeploying}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <CloudLightning className="w-4 h-4" />
              {isDeploying ? 'Deploying...' : 'Launch App'}
            </button>
          </div>
          
          <div className="flex-1 py-2 px-3 space-y-0.5">
            {[
              { id: 'overview', icon: Layers, label: 'Overview' },
              { id: 'deployments', icon: Cloud, label: 'Deployments' },
              { id: 'preview', icon: Eye, label: 'Live Preview' },
              { id: 'domains', label: 'Domains', icon: Globe },
              { id: 'env', label: 'Environment Variables', icon: Box },
              { id: 'functions', label: 'Edge Functions', icon: Zap },
              { id: 'db', label: 'Database', icon: Database },
              { id: 'monitor', label: 'Resource Monitor', icon: Monitor },
              { id: 'logs', label: 'Edge Logs', icon: Terminal },
              { id: 'ai', label: 'AI DevOps Engine', icon: Cpu },
              { id: 'analytics', label: 'Edge Analytics', icon: Activity },
              { id: 'settings', label: 'System Settings', icon: Settings },
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === item.id 
                    ? 'bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border-l-2 border-transparent'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        {/* DYNAMIC CENTER DASHBOARD */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-black relative">
          
          {/* Background gradient effects */}
          <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none"></div>

          <div className="p-8 max-w-5xl mx-auto w-full z-10 space-y-8">
            
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Header Section */}
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                      Production Edge
                      {isDeploying && (
                        <span className="flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                          Deploying
                        </span>
                      )}
                      {!isDeploying && deployments.length > 0 && (
                        <span className="flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Live
                        </span>
                      )}
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm flex items-center gap-2">
                      <GitBranch className="w-4 h-4" /> main <span className="text-gray-600">•</span> e84f9a2 <span className="text-gray-600">•</span> autonomous-ai-commit
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <a 
                      href="https://smartbuilder.vercel.app" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors border border-white/10 flex items-center gap-2"
                    >
                      <ArrowUpRight className="w-4 h-4" /> Visit Site
                    </a>
                  </div>
                </div>

                {/* Quick Metrics */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'Status', value: isDeploying ? 'Building' : 'Healthy', color: 'text-emerald-400' },
                    { label: 'Latency (Global)', value: '12ms', color: 'text-white' },
                    { label: 'Edge Nodes', value: '284', color: 'text-white' },
                    { label: 'Build Time', value: '18.4s', color: 'text-white' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-[#111] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
                      <div className="text-gray-500 text-xs font-medium mb-1">{stat.label}</div>
                      <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                    </div>
                  ))}
                </div>

                {/* Deployment Pipeline UI */}
                <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
                  <div className="border-b border-white/10 px-5 py-3 flex items-center justify-between bg-[#161616]">
                    <div className="font-semibold text-white text-sm flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-gray-400" /> Build Pipeline
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      sys-launch-os v2.4.1
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex justify-between relative">
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 z-0"></div>
                      
                      {/* Progress Line */}
                      <div 
                        className="absolute top-1/2 left-0 h-0.5 bg-indigo-500 -translate-y-1/2 z-0 transition-all duration-500"
                        style={{ width: `${Math.max(0, (deployStep / DEPLOYMENT_STATES.length) * 100)}%` }}
                      ></div>

                      {/* Steps */}
                      {['Analyze', 'Build', 'Optimize', 'Deploy', 'Monitor'].map((step, idx) => {
                        const stepThreshold = (idx / 4) * DEPLOYMENT_STATES.length;
                        const isCompleted = deployStep > stepThreshold;
                        const isCurrent = deployStep >= stepThreshold - 1 && deployStep <= stepThreshold;
                        
                        return (
                          <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                              isCompleted ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 
                              isCurrent ? 'bg-indigo-500/20 border-2 border-indigo-500 text-indigo-400' : 
                              'bg-[#222] border border-white/10 text-gray-500'
                            }`}>
                              {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <div className="text-xs font-bold">{idx + 1}</div>}
                            </div>
                            <div className={`text-xs font-medium ${isCompleted || isCurrent ? 'text-gray-200' : 'text-gray-600'}`}>
                              {step}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Terminal Logs View */}
                  <div className="bg-black p-4 h-64 overflow-y-auto font-mono text-xs border-t border-white/10">
                    {logs.length === 0 ? (
                      <div className="text-gray-600 italic h-full flex items-center justify-center">
                        Waiting for deployment trigger...
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {logs.map((log, i) => (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            key={i}
                            className={
                              log.includes('[SUCCESS]') ? 'text-emerald-400' :
                              log.includes('[SYSTEM]') ? 'text-indigo-400' :
                              'text-gray-300'
                            }
                          >
                            {log}
                          </motion.div>
                        ))}
                        {isDeploying && (
                          <div className="text-gray-500 animate-pulse">_</div>
                        )}
                        <div ref={logsEndRef} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Platform Previews */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all group">
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-400" /> Global Edge Delivery
                      </h3>
                    </div>
                    <div className="h-40 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-[#0a0a0a] relative flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent"></div>
                      <div className="w-2 h-2 rounded-full bg-blue-500 absolute top-1/3 left-1/4 shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-ping"></div>
                      <div className="w-2 h-2 rounded-full bg-blue-500 absolute top-1/2 left-2/3 shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-ping" style={{ animationDelay: '0.5s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-blue-500 absolute top-2/3 left-1/3 shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-ping" style={{ animationDelay: '1s' }}></div>
                      
                      <div className="relative z-10 text-center">
                        <div className="text-3xl font-bold text-white mb-1">99.99%</div>
                        <div className="text-xs text-gray-400">Cache Hit Ratio</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all group">
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <GaugeCircle className="w-4 h-4 text-orange-400" /> Web Vitals
                      </h3>
                    </div>
                    <div className="p-6 grid grid-cols-3 gap-4 h-40">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center text-sm font-bold text-emerald-400">
                          98
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">Performance</div>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center text-sm font-bold text-emerald-400">
                          100
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">Accessibility</div>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center text-sm font-bold text-emerald-400">
                          100
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">SEO</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'deployments' && (
              <div className="bg-[#09090b] border border-white/10 rounded-xl overflow-hidden">
                <DeploymentsTable 
                  deployments={deployments}
                  selectedDeploymentId={selectedDeploymentId}
                  onSelectDeployment={(id) => {
                    setSelectedDeploymentId(id);
                    setIsDrawerOpen(true);
                  }}
                />
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Live Application Preview</h2>
                  <p className="text-gray-400">Interact directly with the sandbox environment of your deployed application.</p>
                </div>
                
                {/* Browser Sandbox Shell */}
                <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0c0c0e]">
                  <div className="h-10 bg-[#16161a] border-b border-white/5 flex items-center px-4 gap-2">
                    {/* Window Controls */}
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                    </div>
                    {/* URL bar */}
                    <div className="flex-1 bg-black/60 rounded-md border border-white/10 h-6 flex items-center px-3 justify-between max-w-xl mx-auto">
                      <span className="text-[11px] text-gray-500 font-mono truncate">https://smartbuilder.vercel.app</span>
                      <RefreshCw className="w-3 h-3 text-gray-500 cursor-pointer hover:text-white" />
                    </div>
                  </div>
                  {/* Render Mock Application Screen */}
                  <div className="h-[480px] bg-[#050508] relative flex flex-col items-center justify-center p-8 text-center">
                    <div className="absolute inset-0 bg-radial-gradient from-indigo-500/10 via-transparent pointer-events-none"></div>
                    <Rocket className="w-16 h-16 text-indigo-500 animate-bounce mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-2">Welcome to Smartbuilder</h3>
                    <p className="text-gray-400 max-w-md text-sm leading-relaxed mb-6">
                      Your autonomous full-stack SaaS is compiled, deployed, and live globally at edge edge-nodes.
                    </p>
                    <div className="flex gap-4">
                      <button className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-500/20 transition-all">
                        Get Started
                      </button>
                      <button className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold rounded-lg transition-all">
                        Documentation
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'domains' && (
              <div className="bg-[#09090b] border border-white/10 rounded-xl overflow-hidden">
                <DomainsTab
                  domains={domains}
                  onAddDomain={(name) => setDomains(prev => [...prev, { domain: name, type: 'custom', ssl_status: 'pending', dns_status: 'pending', created_at: new Date().toISOString() }])}
                  onRemoveDomain={(name) => setDomains(prev => prev.filter(d => d.domain !== name))}
                  onVerifyDNS={(name) => setDomains(prev => prev.map(d => d.domain === name ? { ...d, ssl_status: 'active', dns_status: 'verified' } : d))}
                />
              </div>
            )}

            {activeTab === 'env' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Environment Variables</h2>
                  <p className="text-gray-400">Encrypted environments variables for your deployment builds.</p>
                </div>

                {/* Add Variable Form */}
                <div className="p-6 rounded-xl border border-white/10 bg-[#0c0c0e] space-y-4">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-4">
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Key</label>
                      <input
                        placeholder="API_KEY_SECRET"
                        value={newEnvKey}
                        onChange={(e) => setNewEnvKey(e.target.value)}
                        className="w-full bg-[#18181b] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-gray-700"
                      />
                    </div>
                    <div className="col-span-5">
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Value</label>
                      <input
                        type="password"
                        placeholder="••••••••••••••••"
                        value={newEnvVal}
                        onChange={(e) => setNewEnvVal(e.target.value)}
                        className="w-full bg-[#18181b] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div className="col-span-3 flex items-end">
                      <button
                        onClick={handleAddEnv}
                        disabled={!newEnvKey || !newEnvVal}
                        className="w-full h-[38px] bg-white text-black text-sm font-semibold rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> Add Key
                      </button>
                    </div>
                  </div>
                </div>

                {/* Variables List Table */}
                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#18181b] text-gray-500 font-medium uppercase text-xs">
                      <tr>
                        <th className="px-6 py-3">Key</th>
                        <th className="px-6 py-3">Value</th>
                        <th className="px-6 py-3">Environment</th>
                        <th className="px-6 py-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 bg-[#0c0c0e]">
                      {envVars.map((v) => (
                        <tr key={v.key} className="group hover:bg-white/5 transition-all">
                          <td className="px-6 py-4 font-mono font-medium text-white">{v.key}</td>
                          <td className="px-6 py-4 font-mono text-gray-500">
                            {v.is_secret ? '••••••••••••••••' : v.value}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-800 text-gray-400 border border-gray-700">{v.environment}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => handleRemoveEnv(v.key)} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'functions' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Edge Serverless Functions</h2>
                  <p className="text-gray-400">Deploy serverless code closest to users for optimal speeds.</p>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-[#0c0c0e] border border-white/10 p-5 rounded-xl">
                    <div className="text-xs font-semibold text-gray-500 mb-1">TOTAL EXECUTIONS</div>
                    <div className="text-2xl font-bold text-white">41.8k</div>
                  </div>
                  <div className="bg-[#0c0c0e] border border-white/10 p-5 rounded-xl">
                    <div className="text-xs font-semibold text-gray-500 mb-1">AVG RESPONSE TIME</div>
                    <div className="text-2xl font-bold text-white text-indigo-400">14ms</div>
                  </div>
                  <div className="bg-[#0c0c0e] border border-white/10 p-5 rounded-xl">
                    <div className="text-xs font-semibold text-gray-500 mb-1">ERRORS INDEX</div>
                    <div className="text-2xl font-bold text-emerald-400">0.00%</div>
                  </div>
                </div>

                {/* Edge Terminal Logs */}
                <div className="border border-white/10 rounded-xl overflow-hidden bg-black">
                  <div className="h-10 bg-[#16161a] border-b border-white/5 flex items-center px-4 justify-between">
                    <span className="text-xs font-semibold text-white">Live Edge Stream</span>
                    <span className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Streaming
                    </span>
                  </div>
                  <div className="p-4 font-mono text-xs text-gray-400 space-y-1.5 h-64 overflow-y-auto">
                    {edgeLogs.map((el, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-indigo-400">[Edge]</span>
                        <span>{el}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'db' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Relational Database</h2>
                  <p className="text-gray-400">Managed Postgres instance with auto-pooling.</p>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'Connections', value: '18 / 150', color: 'text-white' },
                    { label: 'DB Size', value: '24.2 MB', color: 'text-white' },
                    { label: 'CPU Usage', value: '1.4%', color: 'text-white' },
                    { label: 'Health Status', value: 'Healthy', color: 'text-emerald-400' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-[#0c0c0e] border border-white/10 p-5 rounded-xl">
                      <div className="text-xs font-semibold text-gray-500 mb-1">{stat.label}</div>
                      <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-[#0c0c0e] border border-white/10 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-white mb-4">Instance Statistics</h3>
                  {/* Database Pool graph visualization placeholder */}
                  <div className="h-40 flex items-end gap-3 pt-6 border-b border-white/5">
                    {[12, 18, 14, 26, 32, 28, 18, 22, 16, 20, 18, 24].map((v, i) => (
                      <div key={i} className="flex-1 bg-indigo-500/20 hover:bg-indigo-500/50 rounded-t transition-all group relative cursor-pointer" style={{ height: `${(v / 40) * 100}%` }}>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-[10px] text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {v} Conn
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-600 mt-2">
                    <span>1h ago</span>
                    <span>30m ago</span>
                    <span>Just now</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'monitor' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Resource Monitoring</h2>
                  <p className="text-gray-400">Telemetry logs of the core edge nodes.</p>
                </div>

                {/* Grid performance cards */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-[#0c0c0e] border border-white/10 rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-white mb-4">Edge Latency Over Time</h3>
                    <div className="h-40 flex items-end gap-2 pt-6">
                      {[12, 11, 14, 13, 12, 11, 12, 15, 12, 11, 12, 12, 13].map((v, i) => (
                        <div key={i} className="flex-1 bg-blue-500/20 rounded-t" style={{ height: `${(v / 20) * 100}%` }}></div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#0c0c0e] border border-white/10 rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-white mb-4">Global Network Traffic</h3>
                    <div className="h-40 flex items-end gap-2 pt-6">
                      {[42, 38, 44, 46, 52, 60, 58, 62, 70, 68, 64, 72, 78].map((v, i) => (
                        <div key={i} className="flex-1 bg-indigo-500/20 rounded-t" style={{ height: `${(v / 100) * 100}%` }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Edge Deployment Logs</h2>
                  <p className="text-gray-400">Stream logs directly from edge deployment CDN nodes.</p>
                </div>

                <div className="bg-[#0c0c0e] border border-white/10 rounded-xl overflow-hidden">
                  <div className="p-4 bg-[#16161a] border-b border-white/5 flex gap-4">
                    <input 
                      placeholder="Filter by keyword..." 
                      className="bg-black/60 border border-white/10 rounded px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none flex-1"
                    />
                    <select className="bg-black/60 border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none">
                      <option>All levels</option>
                      <option>Info</option>
                      <option>Warning</option>
                      <option>Error</option>
                    </select>
                  </div>
                  <div className="p-6 bg-black font-mono text-xs text-gray-500 space-y-2 h-[400px] overflow-y-auto">
                    <div>2026-05-23T10:52:12Z <span className="text-indigo-400">[INFO]</span> Cold starting edge function in global region us-east-1</div>
                    <div>2026-05-23T10:52:13Z <span className="text-emerald-400">[SUCCESS]</span> Edge function warm completed. Execution time: 14.8ms</div>
                    <div>2026-05-23T10:52:14Z <span className="text-indigo-400">[INFO]</span> Database connection pool initialized, active handles: 18</div>
                    <div>2026-05-23T10:52:18Z <span className="text-indigo-400">[INFO]</span> GET /api/v1/monitor/status completed in 8.4ms</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">AI DevOps Engine</h2>
                  <p className="text-gray-400">Autonomous recommendation system optimizing your deployment bundle and configurations.</p>
                </div>

                <div className="bg-[#0c0c0e] border border-white/10 rounded-xl p-6">
                  <div className="flex gap-4 items-start mb-6">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
                      <Cpu className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">AI DevOps Engine Active</h3>
                      <p className="text-xs text-gray-500 mt-1">Autonomous checks are monitoring edge routing configurations and deployment packages.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 border border-white/5 rounded-lg">
                      <div className="font-semibold text-white text-sm mb-1">Optimize Asset Bundler</div>
                      <p className="text-xs text-gray-400">AI detected 14.2% size reduction potential by converting local JPEG assets to next/image WebP.</p>
                      <button className="mt-3 text-xs text-indigo-400 font-semibold flex items-center gap-1">
                        Apply optimization <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-4 bg-white/5 border border-white/5 rounded-lg">
                      <div className="font-semibold text-white text-sm mb-1">Supabase Pool Optimization</div>
                      <p className="text-xs text-gray-400">Enable PgBouncer session pooling to support up to 10k edge users concurrently.</p>
                      <button className="mt-3 text-xs text-indigo-400 font-semibold flex items-center gap-1">
                        Configure PgBouncer <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Performance Analytics</h2>
                  <p className="text-gray-400">Real-time usage and geolocation metrics from edge CDN nodes.</p>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'Unique Visitors', value: '14.8k', change: '+12%', color: 'text-white' },
                    { label: 'Avg Session Time', value: '4m 12s', change: '+4%', color: 'text-white' },
                    { label: 'Bounce Rate', value: '31.2%', change: '-8%', color: 'text-emerald-400' },
                    { label: 'Page Views', value: '124.9k', change: '+18%', color: 'text-white' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-[#0c0c0e] border border-white/10 p-5 rounded-xl">
                      <div className="text-gray-500 text-xs font-medium mb-1">{stat.label}</div>
                      <div className={`text-xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                      <div className="text-[10px] font-semibold text-indigo-400">{stat.change} vs last week</div>
                    </div>
                  ))}
                </div>

                <div className="bg-[#0c0c0e] border border-white/10 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-white mb-4">Traffic Geographical Volume</h3>
                  <div className="h-48 flex items-end gap-4 pt-6 border-b border-white/5">
                    {[
                      { label: 'USA', val: 78 },
                      { label: 'Germany', val: 54 },
                      { label: 'Japan', val: 42 },
                      { label: 'UK', val: 36 },
                      { label: 'Canada', val: 32 },
                      { label: 'France', val: 24 }
                    ].map((item, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-indigo-500/20 rounded-t hover:bg-indigo-500/50 transition-all cursor-pointer" style={{ height: `${item.val}%` }}></div>
                        <span className="text-[10px] text-gray-500 font-semibold">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-[#09090b] border border-white/10 rounded-xl overflow-hidden">
                <SettingsTab 
                  project={project}
                  onUpdateProject={handleUpdateProject}
                  onDeleteProject={async () => {}}
                />
              </div>
            )}

          </div>
        </main>

        {/* RIGHT AI PANEL */}
        <aside className="w-80 border-l border-white/5 bg-[#080808] flex flex-col shrink-0">
          <div className="p-4 border-b border-white/5 flex items-center gap-2 bg-[#0d0d0d]">
            <Cpu className="w-4 h-4 text-purple-400" />
            <h2 className="font-semibold text-white text-sm">AI DevOps Assistant</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* Auto-fix status */}
            <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-100">Auto-Fix Engine</span>
                <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">ACTIVE</span>
              </div>
              <p className="text-xs text-purple-200/70 leading-relaxed">
                Monitoring deployment pipeline. AI will automatically detect and resolve dependency conflicts, build errors, and missing configs.
              </p>
            </div>

            {/* AI Insights */}
            <div className="space-y-3 mt-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">Infrastructure Insights</h3>
              
              <div className="bg-white/5 border border-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="flex gap-3">
                  <div className="mt-0.5">
                    <Zap className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-200 group-hover:text-white">Bundle Optimization</h4>
                    <p className="text-xs text-gray-500 mt-1">Detected unused imports in /components. Can reduce bundle size by 14%.</p>
                    <button className="mt-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                      Apply Fix <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="flex gap-3">
                  <div className="mt-0.5">
                    <Database className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-200 group-hover:text-white">Connection Pooling</h4>
                    <p className="text-xs text-gray-500 mt-1">Recommend enabling Supabase connection pooling for edge functions to prevent timeout errors under load.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="flex gap-3">
                  <div className="mt-0.5">
                    <Cloud className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-200 group-hover:text-white">Edge Caching</h4>
                    <p className="text-xs text-gray-500 mt-1">Static assets configured for edge caching. Global latency expected to drop by 45ms.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
          
          {/* Ask AI Input */}
          <div className="p-4 border-t border-white/5 bg-[#0a0a0a]">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Ask AI about infrastructure..." 
                className="w-full bg-black border border-white/10 rounded-lg pl-3 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-purple-400 transition-colors">
                <Play className="w-3 h-3 fill-current" />
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* RENDER MODAL DETAILS DRAWER FOR DEPLOYMENTS */}
      <DeploymentDetailsDrawer 
        deploymentDetails={getSelectedDeploymentDetails()}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedDeploymentId(null);
        }}
        onRedeploy={(id) => {
          console.log(`Mock redeploy triggered for: ${id}`);
          setIsDrawerOpen(false);
          startDeployment();
        }}
        onRollback={(id) => {
          console.log(`Mock rollback triggered for: ${id}`);
          setIsDrawerOpen(false);
        }}
        onPromoteToProduction={(id) => {
          console.log(`Mock promote triggered for: ${id}`);
          setIsDrawerOpen(false);
        }}
      />
    </div>
  );
}
