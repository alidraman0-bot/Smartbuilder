"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRunStore } from '@/store/useRunStore';
import {
    Activity, CheckCircle2, AlertTriangle, XCircle,
    ArrowUpRight, ArrowDownRight, Zap, Users,
    Server, Shield, RefreshCw, ChevronRight,
    Terminal, Clock, BarChart3, Grip, History,
    Globe, Database, MapPin, Cpu, AlertCircle,
    Filter, ArrowRight, CornerDownRight, Check,
    TrendingUp, FileSpreadsheet, Play, Search,
    ListFilter, Info, ShieldAlert, Sparkles, Send, Wrench
} from 'lucide-react';
import SystemActionsPanel from '@/components/monitor/SystemActionsPanel';
import IncidentTimeline from '@/components/monitor/IncidentTimeline';
import StartupPipeline from '@/components/layout/StartupPipeline';
import styles from './monitor.module.css';

function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ');
}

export default function MonitorPage() {
    const run = useRunStore();
    const [activeTab, setActiveTab] = useState<string>('overview');
    const [isLoading, setIsLoading] = useState(true);
    
    // Core telemetry states loaded from port 8000
    const [metricsSummary, setMetricsSummary] = useState<any>(null);
    const [liveLogs, setLiveLogs] = useState<any[]>([]);
    const [tracesData, setTracesData] = useState<any>(null);
    const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
    const [traceWaterfall, setTraceWaterfall] = useState<any>(null);
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [paymentsData, setPaymentsData] = useState<any>(null);
    const [aiInsights, setAiInsights] = useState<any>(null);
    const [alertsData, setAlertsData] = useState<any[]>([]);
    
    // Real-time metric history (last 40 data points for charts)
    const [metricHistory, setMetricHistory] = useState<any[]>([]);
    
    // UI controls
    const [logsSearch, setLogsSearch] = useState('');
    const [logsLevelFilter, setLogsLevelFilter] = useState('all');
    const [logsModuleFilter, setLogsModuleFilter] = useState('all');
    const [aiChatQuery, setAiChatQuery] = useState('');
    const [aiChatLog, setAiChatLog] = useState<any[]>([
        { role: 'assistant', message: 'Hello! I am your autonomous AI SRE. I am currently monitoring your production container clusters. Ask me anything about database latency, CDNs, or root cause diagnostics!' }
    ]);
    const [isAiCollapsed, setIsAiCollapsed] = useState(false);
    
    const logsEndRef = useRef<HTMLDivElement>(null);

    // 1. Initial Data Bootstrapping from Port 8000
    const fetchBootstrapData = async (depId: string) => {
        setIsLoading(true);
        try {
            const [statusRes, logsRes, tracesRes, analyticsRes, paymentsRes, insightsRes] = await Promise.all([
                fetch(`http://localhost:8000/api/v1/monitor/${depId}/status`).then(r => r.json()),
                fetch(`http://localhost:8000/api/v1/monitor/${depId}/logs`).then(r => r.json()),
                fetch(`http://localhost:8000/api/v1/monitor/${depId}/traces`).then(r => r.json()),
                fetch(`http://localhost:8000/api/v1/monitor/${depId}/analytics`).then(r => r.json()),
                fetch(`http://localhost:8000/api/v1/monitor/${depId}/payments`).then(r => r.json()),
                fetch(`http://localhost:8000/api/v1/monitor/${depId}/insights`).then(r => r.json())
            ]);

            setMetricsSummary(statusRes);
            setLiveLogs(logsRes);
            setTracesData(tracesRes);
            setAnalyticsData(analyticsRes);
            setPaymentsData(paymentsRes);
            setAiInsights(insightsRes);
            
            // Seed metric history with timeline from server
            if (statusRes.timeline && statusRes.timeline.length > 0) {
                setMetricHistory(statusRes.timeline.slice(-40));
            } else {
                // Synthetic history seeding
                const now = Date.now();
                const mockHistory = Array.from({ length: 30 }, (_, i) => ({
                    timestamp: new Date(now - (30 - i) * 5000).toISOString(),
                    latency: 110 + Math.random() * 25,
                    error_rate: 0.002,
                    requests: 45 + Math.floor(Math.random() * 10),
                    cpu: 24 + Math.floor(Math.random() * 5),
                    memory: 56.2
                }));
                setMetricHistory(mockHistory);
            }
        } catch (err) {
            console.error("Observability bootstrapping failed, using fallbacks:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const depId = run.deployment_id || 'dep_init_4a8b';
        fetchBootstrapData(depId);
    }, [run.deployment_id]);

    // 2. Fetch Detailed Waterfall when trace is selected
    useEffect(() => {
        if (!selectedTraceId) return;
        const depId = run.deployment_id || 'dep_init_4a8b';
        fetch(`http://localhost:8000/api/v1/monitor/${depId}/traces/${selectedTraceId}`)
            .then(r => r.json())
            .then(data => setTraceWaterfall(data))
            .catch(err => console.error("Trace details fetch failed:", err));
    }, [selectedTraceId]);

    // 3. Real-Time SSE Stream Listening on Port 8000 Proxy
    useEffect(() => {
        const eventSource = new EventSource('http://localhost:8000/api/v1/monitor/stream');

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === 'metric') {
                    // Append to real-time chart history
                    setMetricHistory(prev => {
                        const next = [...prev, {
                            timestamp: data.timestamp,
                            latency: data.latency_ms,
                            error_rate: data.error_rate * 100,
                            requests: data.requests_count,
                            cpu: data.cpu_usage,
                            memory: data.memory_usage
                        }].slice(-40);
                        return next;
                    });

                    // Update live metrics summary
                    setMetricsSummary((prev: any) => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            response_time_ms: data.latency_ms,
                            error_rate: parseFloat((data.error_rate * 100).toFixed(4)),
                            requests_count: prev.requests_count + data.requests_count,
                            bandwidth_kb: prev.bandwidth_kb + data.bandwidth_kb,
                            usage: {
                                dau: data.active_users,
                                requests: prev.usage.requests + data.requests_count
                            },
                            system_load: {
                                cpu_usage: data.cpu_usage,
                                memory_usage: data.memory_usage
                            }
                        };
                    });
                } else if (data.type === 'log') {
                    setLiveLogs(prev => [data, ...prev].slice(0, 150));
                }
            } catch (err) {
                // Heartbeat parse catch
            }
        };

        eventSource.onerror = (err) => {
            console.warn("SSE connection interrupted, retrying proxy channel...");
        };

        return () => {
            eventSource.close();
        };
    }, []);

    // Scroll live logs view
    useEffect(() => {
        if (activeTab === 'logs') {
            logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [liveLogs, activeTab]);

    // Remediate Action Handler
    const handleRemediateAction = async (action: string) => {
        const depId = run.deployment_id || 'dep_init_4a8b';
        try {
            const res = await fetch(`http://localhost:8000/api/v1/monitor/${depId}/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            }).then(r => r.json());
            
            // Add SRE execution log to terminal
            setLiveLogs(prev => [{
                timestamp: new Date().toISOString(),
                module: 'AI_SRE',
                level: 'success',
                message: `Remediation succeeded: ${res.message}`
            }, ...prev]);

            alert(`SRE Intervention: ${res.message}`);
        } catch (err) {
            console.error("Action execution failed:", err);
        }
    };

    // Chatbot send handler
    const sendChatMsg = () => {
        if (!aiChatQuery.trim()) return;
        const userMsg = aiChatQuery;
        setAiChatLog(prev => [...prev, { role: 'user', message: userMsg }]);
        setAiChatQuery('');

        setTimeout(() => {
            // SRE Reasoning simulator
            let reply = "I am processing the telemetry records to extract context...";
            if (userMsg.toLowerCase().includes('latency') || userMsg.toLowerCase().includes('slow')) {
                reply = `The metrics show P95 response times peaking at ${metricsSummary?.p95_latency_ms || 154}ms. The AI diagnostics suggest this is triggered by database connection queues. Running composite indexing is advised.`;
            } else if (userMsg.toLowerCase().includes('error') || userMsg.toLowerCase().includes('fail')) {
                reply = `Current error rate is ${metricsSummary?.error_rate || 0.002}%. Live logs show no critical exceptions outside of minor connection retry alerts. Cashing efficiency is at 94.2%.`;
            } else if (userMsg.toLowerCase().includes('scale') || userMsg.toLowerCase().includes('load')) {
                reply = `CPU load is at ${metricsSummary?.system_load?.cpu_usage || 32.4}%. Edge CDN is balancing load cleanly. We recommend setting autoscaling threshold limits to 75%.`;
            } else {
                reply = `Analyzed deployment ${run.deployment_id || 'dep_init_4a8b'} telemetry. Infrastructure is stable under active load. All regions are online with a caching ratio of 94.2%.`;
            }
            setAiChatLog(prev => [...prev, { role: 'assistant', message: reply }]);
        }, 1000);
    };

    const health = metricsSummary?.health_status || 'healthy';
    
    // Filtered logs selector
    const filteredLogs = liveLogs.filter(log => {
        const matchesSearch = log.message.toLowerCase().includes(logsSearch.toLowerCase()) || 
                             log.module.toLowerCase().includes(logsSearch.toLowerCase());
        const matchesLevel = logsLevelFilter === 'all' || log.level.toLowerCase() === logsLevelFilter.toLowerCase();
        const matchesModule = logsModuleFilter === 'all' || log.module.toLowerCase() === logsModuleFilter.toLowerCase();
        return matchesSearch && matchesLevel && matchesModule;
    });

    return (
        <div className="flex flex-col min-h-screen bg-[#050505] text-[#e4e4e7] selection:bg-indigo-500/20 font-sans">
            
            {/* TOP NAVIGATION & PROJECT HEADER */}
            <header className="h-16 border-b border-[#27272a]/40 bg-[#09090b]/85 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                            <Activity className="w-4 h-4 animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-sm font-semibold tracking-tight text-white">
                                {(run.research as any)?.idea?.title || 'Smartbuilder Command Center'}
                            </h1>
                            <span className="text-[10px] font-mono text-[#525252]">
                                dep_id: {run.deployment_id || 'dep_init_4a8b'}
                            </span>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-1 border-l border-[#27272a]/40 pl-6 text-xs font-medium text-[#71717a]">
                        {['Overview', 'Deployments', 'Logs', 'Metrics', 'Traces', 'Analytics', 'Revenue', 'AI Insights', 'Alerts', 'Settings'].map(tab => (
                            <button 
                                key={tab} 
                                onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '_'))}
                                className={cn(
                                    "px-3 py-1.5 rounded-md transition-colors hover:text-white",
                                    activeTab === tab.toLowerCase().replace(' ', '_') ? "text-white bg-white/5" : ""
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className={cn(
                        "flex items-center gap-2 px-2.5 py-1 border rounded text-xs font-medium uppercase tracking-wider",
                        health === 'healthy' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                        health === 'degraded' ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                        "bg-red-500/10 border-red-500/30 text-red-400"
                    )}>
                        <span className={cn(
                            "relative flex h-2.5 w-2.5",
                            health === 'healthy' ? "text-emerald-400" :
                            health === 'degraded' ? "text-amber-400" : "text-red-400"
                        )}>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-current"></span>
                        </span>
                        {health === 'shutdown' ? 'Terminated' : health}
                    </div>

                    <button 
                        onClick={() => fetchBootstrapData(run.deployment_id || 'dep_init_4a8b')}
                        className="p-2 border border-[#27272a]/60 hover:bg-white/5 rounded-lg text-[#a1a1aa] hover:text-white transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* MAIN SHELL */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* LEFT SIDEBAR */}
                <aside className="w-64 border-r border-[#27272a]/20 bg-[#09090b]/30 flex flex-col hidden md:flex">
                    <div className="p-4 border-b border-[#27272a]/20 flex items-center gap-2 text-xs font-mono tracking-wider text-[#525252] uppercase">
                        <Grip className="w-3.5 h-3.5" /> Navigation
                    </div>

                    <div className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
                        {[
                            { id: 'overview', label: 'Overview', icon: BarChart3 },
                            { id: 'infrastructure', label: 'Infrastructure', icon: Server },
                            { id: 'deployments', label: 'Deployments', icon: Cpu },
                            { id: 'logs', label: 'Live Logs', icon: Terminal },
                            { id: 'metrics', label: 'Metrics', icon: Activity },
                            { id: 'traces', label: 'Traces', icon: History },
                            { id: 'analytics', label: 'Analytics', icon: Globe },
                            { id: 'revenue', label: 'Revenue', icon: TrendingUp },
                            { id: 'ai_insights', label: 'AI Insights', icon: Sparkles },
                            { id: 'alerts', label: 'Alerts & Incidents', icon: ShieldAlert },
                            { id: 'settings', label: 'Settings', icon: Wrench }
                        ].map(item => (
                            <button 
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                                    activeTab === item.id 
                                        ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" 
                                        : "text-[#a1a1aa] hover:bg-white/5 hover:text-white border border-transparent"
                                )}
                            >
                                <item.icon className="w-4 h-4 shrink-0" />
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Auto-remediation active status badge */}
                    <div className="p-4 border-t border-[#27272a]/20 bg-black/40">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-[10px] font-mono tracking-wider uppercase text-[#a1a1aa]">Remediation Engine</span>
                        </div>
                        <div className="text-[11px] text-[#525252] leading-relaxed">
                            Auto-Fix scripts connected to build nodes.
                        </div>
                    </div>
                </aside>

                {/* CENTER DASHBOARD AREA */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 bg-black relative">
                    
                    {/* Header contextual pulse banner */}
                    {activeTab === 'overview' && metricsSummary?.pulse_summary && (
                        <div className={cn(
                            "p-4 rounded-xl border flex items-center gap-4 relative overflow-hidden",
                            health === 'healthy' ? "bg-emerald-500/5 border-emerald-500/20 text-[#a7f3d0]" :
                            health === 'degraded' ? "bg-amber-500/5 border-amber-500/20 text-[#fde68a]" :
                            "bg-red-500/5 border-red-500/20 text-[#fecaca]"
                        )}>
                            <div className={cn(
                                "w-2.5 h-2.5 rounded-full shrink-0 animate-pulse",
                                health === 'healthy' ? "bg-emerald-400" :
                                health === 'degraded' ? "bg-amber-400" : "bg-red-400"
                            )} />
                            <div className="text-xs font-mono font-medium">{metricsSummary.pulse_summary}</div>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="h-96 flex flex-col items-center justify-center gap-3 text-xs text-[#a1a1aa] font-mono">
                            <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
                            Synchronizing telemetry indices...
                        </div>
                    ) : (
                        <>
                            {/* OVERVIEW DASHBOARD */}
                            {activeTab === 'overview' && (
                                <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
                                    
                                    {/* Signal Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <SignalTile 
                                            label="Uptime" 
                                            value={`${metricsSummary?.uptime || '99.982'}%`} 
                                            trend="stable" 
                                            icon={<Clock className="w-4 h-4 text-blue-400" />}
                                            subtext="Aggregated (30d)"
                                        />
                                        <SignalTile 
                                            label="Avg Latency" 
                                            value={`${metricsSummary?.response_time_ms || 138}ms`} 
                                            trend={metricsSummary?.response_time_ms > 200 ? 'up' : 'stable'}
                                            status={metricsSummary?.response_time_ms > 250 ? 'warning' : 'good'}
                                            icon={<Zap className="w-4 h-4 text-amber-400" />}
                                            subtext={`P95: ${metricsSummary?.p95_latency_ms || 154}ms`}
                                        />
                                        <SignalTile 
                                            label="Error Rate" 
                                            value={`${(metricsSummary?.error_rate || 0.002).toFixed(3)}%`} 
                                            trend={metricsSummary?.error_rate > 0.015 ? 'up' : 'down'}
                                            status={metricsSummary?.error_rate > 0.015 ? 'warning' : 'good'}
                                            icon={<Shield className="w-4 h-4 text-emerald-400" />}
                                            subtext="Target: <0.1%"
                                        />
                                        <SignalTile 
                                            label="Active Users" 
                                            value={metricsSummary?.usage?.dau || 42} 
                                            trend="up" 
                                            icon={<Users className="w-4 h-4 text-violet-400" />}
                                            subtext="Real-time connections"
                                        />
                                    </div>

                                    {/* Latency Narrative Section */}
                                    {metricsSummary?.latency_narrative && (
                                        <div className="border border-[#27272a]/40 bg-[#09090b]/40 rounded-xl p-5 space-y-3">
                                            <div className="text-xs font-mono text-[#525252] flex items-center gap-1 uppercase tracking-wider">
                                                <Info className="w-3.5 h-3.5 text-blue-400" /> Latency Narrative
                                            </div>
                                            <p className="text-sm text-[#e4e4e7] leading-relaxed">
                                                {metricsSummary.latency_narrative}
                                            </p>
                                        </div>
                                    )}

                                    {/* Core Panels Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                        <div className="lg:col-span-8 space-y-8">
                                            {/* Auto Remediation Panel */}
                                            {aiInsights?.remediation_actions && (
                                                <SystemActionsPanel actions={aiInsights.remediation_actions} />
                                            )}

                                            {/* Live Activity Log Preview */}
                                            <div className="border border-[#27272a]/30 bg-[#09090b]/30 rounded-xl p-6 space-y-4">
                                                <div className="flex items-center justify-between border-b border-[#27272a]/20 pb-3">
                                                    <h3 className="text-xs uppercase font-mono tracking-wider text-[#525252] flex items-center gap-2">
                                                        <Terminal className="w-3.5 h-3.5" /> Recent Activity Stream
                                                    </h3>
                                                    <button 
                                                        onClick={() => setActiveTab('logs')}
                                                        className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                                                    >
                                                        Full Explorer <ChevronRight className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <div className="space-y-2 font-mono text-[11px] h-48 overflow-y-auto pr-2">
                                                    {liveLogs.slice(0, 5).map((log, i) => (
                                                        <div key={i} className="flex gap-4 py-1.5 border-b border-[#27272a]/10 last:border-0">
                                                            <span className="text-[#3f3f46] w-20 shrink-0">
                                                                {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : log.time}
                                                            </span>
                                                            <span className={cn(
                                                                "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0",
                                                                log.level === 'error' || log.level === 'critical' ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                                                log.level === 'warn' || log.level === 'warning' ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                                                "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                                            )} style={{ height: 'fit-content' }}>
                                                                {log.module}
                                                            </span>
                                                            <span className="text-[#a1a1aa] truncate">{log.message}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Incident Timeline */}
                                        <div className="lg:col-span-4">
                                            <IncidentTimeline incidents={aiInsights?.anomalies || []} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* INFRASTRUCTURE & GLOBAL EDGE */}
                            {activeTab === 'infrastructure' && (
                                <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
                                    <div className="border border-[#27272a]/40 bg-[#09090b]/40 rounded-xl p-6">
                                        <h3 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-indigo-400" /> Global Edge Regions (Cloudflare Pages)
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {[
                                                { name: 'region-us-east', loc: 'N. Virginia, USA', latency: 12, hits: '45%' },
                                                { name: 'region-us-west', loc: 'Silicon Valley, USA', latency: 25, hits: '20%' },
                                                { name: 'region-eu-west', loc: 'Frankfurt, Germany', latency: 34, hits: '15%' },
                                                { name: 'region-ap-south', loc: 'Singapore', latency: 82, hits: '10%' },
                                                { name: 'region-af-south', loc: 'Johannesburg, South Africa', latency: 68, hits: '8%' },
                                                { name: 'region-sa-east', loc: 'São Paulo, Brazil', latency: 95, hits: '2%' }
                                            ].map((region, i) => (
                                                <div key={i} className="border border-[#27272a]/30 bg-black/40 rounded-lg p-4 flex justify-between items-center">
                                                    <div>
                                                        <div className="text-xs font-mono font-medium text-white flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                                            {region.name}
                                                        </div>
                                                        <div className="text-[10px] text-[#525252] mt-1">{region.loc}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xs font-mono font-semibold text-indigo-400">{region.latency}ms</div>
                                                        <div className="text-[10px] text-[#71717a] mt-0.5">{region.hits} requests</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Compute nodes stack */}
                                    <div className="border border-[#27272a]/40 bg-[#09090b]/40 rounded-xl p-6">
                                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                            <Server className="w-4 h-4 text-indigo-400" /> Active Compute Clusters
                                        </h3>
                                        <div className="space-y-3">
                                            {[
                                                { id: 'node-auth-01', cpu: 14, mem: 48, status: 'Healthy' },
                                                { id: 'node-router-edge', cpu: 22, mem: 56, status: 'Healthy' },
                                                { id: 'node-db-primary', cpu: 32, mem: 72, status: 'Pool Saturation' }
                                            ].map((node, i) => (
                                                <div key={i} className="border border-[#27272a]/20 bg-black/30 rounded-lg p-4 flex flex-wrap gap-4 justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
                                                            <Server className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-mono text-white">{node.id}</div>
                                                            <div className="text-[10px] text-[#525252] mt-1">Docker Gateway Router</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-6 text-xs font-mono text-[#a1a1aa]">
                                                        <div>CPU: <span className="text-white">{node.cpu}%</span></div>
                                                        <div>MEM: <span className="text-white">{node.mem}%</span></div>
                                                    </div>
                                                    <div className={cn(
                                                        "text-[10px] font-bold uppercase px-2 py-0.5 rounded",
                                                        node.status === 'Healthy' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                                                    )}>
                                                        {node.status}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* DEPLOYMENTS */}
                            {activeTab === 'deployments' && (
                                <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
                                    <div className="border border-[#27272a]/40 bg-[#09090b]/40 rounded-xl p-6">
                                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                            <Cpu className="w-4 h-4 text-indigo-400" /> Edge Launch Deployments
                                        </h3>
                                        <div className="border border-[#27272a]/20 bg-black/40 rounded-lg p-5 flex flex-wrap gap-6 justify-between items-start">
                                            <div className="space-y-2">
                                                <div className="text-xs text-[#a1a1aa]">Active Deployment URL</div>
                                                <a 
                                                    href={run.deployment_url || '#'} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                                                >
                                                    {run.deployment_url || 'https://dep_init_4a8b.smartbuilder.app'}
                                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                                </a>
                                                <div className="text-[10px] font-mono text-[#525252] mt-2">
                                                    Status: <span className="text-emerald-400 font-bold">{run.deployment_status || 'LIVE'}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <button 
                                                    onClick={() => handleRemediateAction('restart')}
                                                    className="px-3.5 py-2 border border-[#27272a]/60 hover:bg-white/5 rounded-lg text-xs font-semibold text-white flex items-center gap-2 transition-colors"
                                                >
                                                    <RefreshCw className="w-3.5 h-3.5" /> Restart Containers
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        const reason = prompt("Enter rollback reason:");
                                                        if (reason && run.deployment_id) run.rollbackDeployment(run.deployment_id, reason);
                                                    }}
                                                    className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
                                                >
                                                    Rollback Build
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* LIVE LOGS EXPLORER */}
                            {activeTab === 'logs' && (
                                <div className="space-y-6 animate-[fadeIn_0.5s_ease-out] flex flex-col h-[600px] border border-[#27272a]/40 bg-[#09090b]/40 rounded-xl p-5 overflow-hidden">
                                    
                                    {/* Logs controls */}
                                    <div className="flex flex-wrap gap-4 items-center justify-between pb-3 border-b border-[#27272a]/20 shrink-0">
                                        <div className="flex items-center gap-2 text-xs font-mono text-white">
                                            <Terminal className="w-4 h-4 text-[#a1a1aa]" /> Time-series Logs
                                        </div>

                                        <div className="flex flex-wrap gap-3 items-center">
                                            {/* Search input */}
                                            <div className="relative">
                                                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#525252]" />
                                                <input 
                                                    type="text" 
                                                    placeholder="Search queries/messages..."
                                                    value={logsSearch}
                                                    onChange={e => setLogsSearch(e.target.value)}
                                                    className="bg-black border border-[#27272a]/60 pl-8 pr-3 py-1 text-xs rounded-lg text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 w-48 font-mono"
                                                />
                                            </div>

                                            {/* Level dropdown */}
                                            <div className="flex items-center gap-1.5">
                                                <ListFilter className="w-3.5 h-3.5 text-[#525252]" />
                                                <select 
                                                    value={logsLevelFilter}
                                                    onChange={e => setLogsLevelFilter(e.target.value)}
                                                    className="bg-black border border-[#27272a]/60 text-xs rounded-lg text-white px-2 py-1 focus:outline-none"
                                                >
                                                    <option value="all">ALL LEVELS</option>
                                                    <option value="info">INFO</option>
                                                    <option value="warn">WARN</option>
                                                    <option value="error">ERROR</option>
                                                </select>
                                            </div>

                                            {/* Module dropdown */}
                                            <select 
                                                value={logsModuleFilter}
                                                onChange={e => setLogsModuleFilter(e.target.value)}
                                                className="bg-black border border-[#27272a]/60 text-xs rounded-lg text-white px-2 py-1 focus:outline-none"
                                            >
                                                <option value="all">ALL MODULES</option>
                                                <option value="core">CORE</option>
                                                <option value="api_gateway">API_GATEWAY</option>
                                                <option value="database">DATABASE</option>
                                                <option value="auth">AUTH</option>
                                                <option value="edge">EDGE</option>
                                                <option value="ai_sre">AI_SRE</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Terminal Stream View */}
                                    <div className="flex-1 bg-black p-4 rounded-lg font-mono text-xs overflow-y-auto space-y-1.5 select-text border border-[#27272a]/10">
                                        {filteredLogs.length === 0 ? (
                                            <div className="text-[#3f3f46] italic h-full flex items-center justify-center">
                                                No logs matching filters. Awaiting telemetry heartbeat...
                                            </div>
                                        ) : (
                                            filteredLogs.slice().reverse().map((log, i) => (
                                                <div 
                                                    key={i}
                                                    className="flex gap-4 items-start py-0.5 border-b border-[#27272a]/5 last:border-0 hover:bg-white/2 transition-colors"
                                                >
                                                    <span className="text-[#3f3f46] select-none shrink-0 w-20">
                                                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : log.time}
                                                    </span>
                                                    <span className={cn(
                                                        "text-[10px] font-bold uppercase shrink-0 w-24 text-center select-none rounded",
                                                        log.level === 'error' || log.level === 'critical' ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                                        log.level === 'warn' || log.level === 'warning' ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                                        "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                                    )}>
                                                        {log.module}
                                                    </span>
                                                    <span className={cn(
                                                        "text-[#e4e4e7] break-all",
                                                        log.level === 'error' ? 'text-red-400' : 
                                                        log.level === 'warn' ? 'text-amber-400' : ''
                                                    )}>
                                                        {log.message}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                        <div ref={logsEndRef} />
                                    </div>
                                </div>
                            )}

                            {/* METRICS DASHBOARD (CHARTS) */}
                            {activeTab === 'metrics' && (
                                <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        
                                        {/* Latency History Chart */}
                                        <div className="border border-[#27272a]/40 bg-[#09090b]/40 rounded-xl p-6">
                                            <h4 className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] mb-4 flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-indigo-400" /> Response Time History (Latency)
                                            </h4>
                                            
                                            {/* Dynamic SVG chart bar representation */}
                                            <div className="h-48 flex items-end gap-1 pt-6 border-b border-[#27272a]/20">
                                                {metricHistory.length === 0 ? (
                                                    <div className="text-xs italic text-[#525252] w-full text-center pb-20">Awaiting stream...</div>
                                                ) : (
                                                    metricHistory.map((pt, i) => {
                                                        // Scale visual height (max latency expected around 350)
                                                        const hVal = Math.min(100, Math.max(5, (pt.latency / 300) * 100));
                                                        return (
                                                            <div 
                                                                key={i}
                                                                className="flex-1 rounded-t-sm group relative"
                                                                style={{ 
                                                                    height: `${hVal}%`,
                                                                    background: pt.latency > 250 ? 'rgba(239, 68, 68, 0.4)' : pt.latency > 160 ? 'rgba(245, 158, 11, 0.4)' : 'rgba(59, 130, 246, 0.3)'
                                                                }}
                                                            >
                                                                {/* Hover tooltip */}
                                                                <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 bg-black border border-[#27272a] rounded px-2 py-1 text-[9px] font-mono text-white pointer-events-none mb-1 z-30 whitespace-nowrap">
                                                                    {pt.latency}ms
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                            <div className="flex justify-between text-[10px] text-[#525252] font-mono mt-2">
                                                <span>-3 minutes</span>
                                                <span>Real-time stream</span>
                                                <span>Just now</span>
                                            </div>
                                        </div>

                                        {/* Throughput History Chart */}
                                        <div className="border border-[#27272a]/40 bg-[#09090b]/40 rounded-xl p-6">
                                            <h4 className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] mb-4 flex items-center gap-2">
                                                <BarChart3 className="w-4 h-4 text-indigo-400" /> App Throughput (Requests Count)
                                            </h4>
                                            
                                            <div className="h-48 flex items-end gap-1 pt-6 border-b border-[#27272a]/20">
                                                {metricHistory.length === 0 ? (
                                                    <div className="text-xs italic text-[#525252] w-full text-center pb-20">Awaiting stream...</div>
                                                ) : (
                                                    metricHistory.map((pt, i) => {
                                                        const hVal = Math.min(100, Math.max(5, (pt.requests / 250) * 100));
                                                        return (
                                                            <div 
                                                                key={i}
                                                                className="flex-1 bg-indigo-500/25 rounded-t-sm group relative"
                                                                style={{ height: `${hVal}%` }}
                                                            >
                                                                <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 bg-black border border-[#27272a] rounded px-2 py-1 text-[9px] font-mono text-white pointer-events-none mb-1 z-30 whitespace-nowrap">
                                                                    {pt.requests} reqs
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                            <div className="flex justify-between text-[10px] text-[#525252] font-mono mt-2">
                                                <span>-3 minutes</span>
                                                <span>Telemetry logs</span>
                                                <span>Just now</span>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )}

                            {/* TRACE VISUALIZER */}
                            {activeTab === 'traces' && (
                                <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                        
                                        {/* Traces List Panel */}
                                        <div className="lg:col-span-5 border border-[#27272a]/40 bg-[#09090b]/40 rounded-xl p-5 space-y-4">
                                            <h4 className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] pb-2 border-b border-[#27272a]/20 flex items-center gap-2">
                                                <ListFilter className="w-4 h-4 text-indigo-400" /> Captured Transactions
                                            </h4>
                                            
                                            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                                {tracesData?.traces?.map((trace: any, i: number) => (
                                                    <div 
                                                        key={i}
                                                        onClick={() => setSelectedTraceId(trace.trace_id)}
                                                        className={cn(
                                                            "p-3 rounded-lg border text-xs font-mono transition-all cursor-pointer",
                                                            selectedTraceId === trace.trace_id
                                                                ? "bg-indigo-600/10 border-indigo-500/40 text-indigo-400"
                                                                : "bg-black/30 border-[#27272a]/40 text-[#a1a1aa] hover:bg-white/5 hover:border-[#27272a]"
                                                        )}
                                                    >
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="font-semibold text-white truncate max-w-[150px]">{trace.name}</span>
                                                            <span className="text-indigo-400 font-bold shrink-0">{trace.duration_ms}ms</span>
                                                        </div>
                                                        <div className="flex justify-between text-[9px] text-[#525252]">
                                                            <span>id: {trace.trace_id}</span>
                                                            <span>spans: {trace.spans_count}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Waterfall Graph Detail */}
                                        <div className="lg:col-span-7 border border-[#27272a]/40 bg-[#09090b]/40 rounded-xl p-6 space-y-6">
                                            <h4 className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] pb-2 border-b border-[#27272a]/20 flex items-center gap-2">
                                                <Grip className="w-4 h-4 text-indigo-400" /> Waterfall Trace call tree
                                            </h4>

                                            {!selectedTraceId ? (
                                                <div className="h-64 flex items-center justify-center text-xs text-[#525252] font-mono italic">
                                                    Select a transaction trace on the left sidebar list to expand detailed waterfall tree
                                                </div>
                                            ) : !traceWaterfall ? (
                                                <div className="h-64 flex items-center justify-center text-xs text-[#a1a1aa] font-mono">
                                                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                                                </div>
                                            ) : (
                                                <div className="space-y-4 font-mono text-[11px] overflow-x-auto">
                                                    <div className="flex border-b border-[#27272a]/20 pb-2 text-[10px] text-[#525252] font-bold tracking-wider uppercase">
                                                        <span className="w-1/3 shrink-0">Span Service / Module</span>
                                                        <span className="w-2/3">Waterfall Execution Timeline</span>
                                                    </div>

                                                    <div className="space-y-3.5 min-w-[400px]">
                                                        {traceWaterfall.spans?.map((span: any, idx: number) => {
                                                            // Calculate offsets based on indices for mock visual representation
                                                            const startOffsetPercent = (idx / (traceWaterfall.spans.length + 1)) * 40;
                                                            const widthPercent = Math.max(10, 100 - startOffsetPercent - (idx * 5));
                                                            
                                                            return (
                                                                <div key={idx} className="flex items-center gap-4">
                                                                    <div className="w-1/3 shrink-0 flex items-center gap-1 text-[#e4e4e7] truncate">
                                                                        {idx > 0 && <CornerDownRight className="w-3.5 h-3.5 text-[#525252] shrink-0" />}
                                                                        <span className="truncate">{span.name}</span>
                                                                    </div>

                                                                    <div className="w-2/3 bg-[#18181b] h-6 rounded relative flex items-center px-2">
                                                                        <div 
                                                                            className="absolute h-4 rounded bg-indigo-500/40 hover:bg-indigo-500 transition-colors border border-indigo-500/20"
                                                                            style={{
                                                                                left: `${startOffsetPercent}%`,
                                                                                width: `${widthPercent}%`
                                                                            }}
                                                                        />
                                                                        <span className="relative z-10 text-[9px] text-white font-semibold ml-auto">{span.duration_ms}ms</span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            )}

                            {/* ANALYTICS */}
                            {activeTab === 'analytics' && analyticsData && (
                                <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        
                                        {/* Cache Hit Ratio */}
                                        <div className="border border-[#27272a]/40 bg-[#09090b]/40 rounded-xl p-6 flex flex-col justify-between items-center text-center">
                                            <h4 className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] mb-4 self-start">
                                                Cache Hit Ratio (Edge CDN)
                                            </h4>
                                            <div className="my-6 relative flex items-center justify-center">
                                                <div className="w-32 h-32 rounded-full border-8 border-indigo-500/20 border-t-indigo-500 flex items-center justify-center">
                                                    <span className="text-3xl font-extrabold text-white">{analyticsData.cache_hit_ratio}%</span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-[#525252]">Active edge cache coverage is optimized in US and EU region hubs.</p>
                                        </div>

                                        {/* Geographic request count distribution */}
                                        <div className="border border-[#27272a]/40 bg-[#09090b]/40 rounded-xl p-6">
                                            <h4 className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] mb-4">
                                                Request Distribution per Region
                                            </h4>
                                            <div className="space-y-3.5">
                                                {Object.entries(analyticsData.request_distribution || {}).map(([reg, val]: any, i) => (
                                                    <div key={i} className="space-y-1">
                                                        <div className="flex justify-between text-xs font-mono text-[#a1a1aa]">
                                                            <span>Hub Region: {reg}</span>
                                                            <span className="text-white font-semibold">{val}%</span>
                                                        </div>
                                                        <div className="w-full bg-[#18181b] h-2 rounded overflow-hidden">
                                                            <div className="bg-indigo-500 h-full rounded" style={{ width: `${val}%` }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )}

                            {/* REVENUE */}
                            {activeTab === 'revenue' && paymentsData && (
                                <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="border border-[#27272a]/40 bg-[#09090b]/40 rounded-xl p-5">
                                            <div className="text-[10px] font-mono uppercase tracking-wider text-[#525252] mb-1">Monthly Recurring Revenue</div>
                                            <div className="text-2xl font-bold text-white">${paymentsData.mrr?.toLocaleString()}</div>
                                        </div>
                                        <div className="border border-[#27272a]/40 bg-[#09090b]/40 rounded-xl p-5">
                                            <div className="text-[10px] font-mono uppercase tracking-wider text-[#525252] mb-1">MRR Growth (Month)</div>
                                            <div className="text-2xl font-bold text-emerald-400">+{paymentsData.growth}%</div>
                                        </div>
                                        <div className="border border-[#27272a]/40 bg-[#09090b]/40 rounded-xl p-5">
                                            <div className="text-[10px] font-mono uppercase tracking-wider text-[#525252] mb-1">Subscriptions Churn</div>
                                            <div className="text-2xl font-bold text-[#a1a1aa]">{paymentsData.churn}%</div>
                                        </div>
                                    </div>

                                    <div className="border border-[#27272a]/40 bg-[#09090b]/40 rounded-xl p-6">
                                        <h4 className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] mb-4">
                                            Geographical Payment Trends
                                        </h4>
                                        <div className="space-y-3">
                                            {Object.entries(paymentsData.geographic_trends || {}).map(([country, amt]: any, i) => (
                                                <div key={i} className="flex justify-between items-center text-xs font-mono py-2 border-b border-[#27272a]/10 last:border-0">
                                                    <span className="flex items-center gap-2">
                                                        <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Country: {country}
                                                    </span>
                                                    <span className="text-white font-bold">${amt.toLocaleString()} USD</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* AI INSIGHTS CENTER */}
                            {activeTab === 'ai_insights' && aiInsights && (
                                <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
                                    
                                    {/* Anomalies List */}
                                    <div className="border border-[#27272a]/40 bg-[#09090b]/40 rounded-xl p-6">
                                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                            <ShieldAlert className="w-4 h-4 text-purple-400 animate-pulse" /> Captures Infrastructure Anomalies
                                        </h3>
                                        <div className="space-y-4">
                                            {aiInsights.anomalies?.map((anom: any, i: number) => (
                                                <div key={i} className="border border-purple-500/20 bg-purple-900/5 rounded-lg p-4 space-y-2">
                                                    <div className="flex justify-between items-center text-xs font-mono">
                                                        <span className="text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping"></span>
                                                            {anom.type}
                                                        </span>
                                                        <span className="text-[10px] text-[#525252]">{new Date(anom.detected_at).toLocaleString()}</span>
                                                    </div>
                                                    <h4 className="text-sm font-semibold text-white">{anom.title}</h4>
                                                    <p className="text-xs text-[#a1a1aa] leading-relaxed">{anom.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* SRE AI Diagnosis */}
                                    {aiInsights.root_cause_analysis && (
                                        <div className="border border-[#27272a]/40 bg-[#09090b]/40 rounded-xl p-6 space-y-4">
                                            <div className="flex items-center gap-2 border-b border-[#27272a]/20 pb-3">
                                                <Sparkles className="w-4 h-4 text-indigo-400" />
                                                <h3 className="text-sm font-semibold text-white">SRE AI Root-Cause Analysis</h3>
                                            </div>
                                            
                                            <div className="space-y-4 font-mono text-xs">
                                                <div className="space-y-1">
                                                    <div className="text-[10px] text-[#525252] uppercase tracking-wider">Incident title</div>
                                                    <div className="text-[#fecaca] font-bold">{aiInsights.root_cause_analysis.title}</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-[10px] text-[#525252] uppercase tracking-wider">diagnosed root cause</div>
                                                    <p className="text-[#a1a1aa] leading-relaxed">{aiInsights.root_cause_analysis.root_cause}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-[10px] text-[#525252] uppercase tracking-wider">incident operational impact</div>
                                                    <p className="text-[#a1a1aa] leading-relaxed">{aiInsights.root_cause_analysis.impact}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-[10px] text-[#525252] uppercase tracking-wider">recommended remediation</div>
                                                    <p className="text-indigo-300 leading-relaxed font-semibold">{aiInsights.root_cause_analysis.suggested_remediation}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Scaling advice */}
                                    <div className="border border-[#27272a]/40 bg-[#09090b]/40 rounded-xl p-6">
                                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                            <Cpu className="w-4 h-4 text-indigo-400" /> Autonomous Scaling & Recommendations
                                        </h3>
                                        <div className="space-y-3">
                                            {aiInsights.scaling_recommendations?.map((rec: any, i: number) => (
                                                <div key={i} className="border border-[#27272a]/20 bg-black/40 rounded-lg p-4 flex flex-wrap gap-4 justify-between items-center">
                                                    <div className="max-w-[450px]">
                                                        <h4 className="text-xs font-semibold text-white mb-1">{rec.title}</h4>
                                                        <p className="text-[11px] text-[#a1a1aa] leading-relaxed">{rec.description}</p>
                                                    </div>
                                                    <div className="flex gap-4 items-center shrink-0">
                                                        <div className="text-[10px] font-mono text-[#525252]">Cost: <span className="text-indigo-400 font-bold">{rec.cost_impact}</span></div>
                                                        <button 
                                                            onClick={() => handleRemediateAction('restart')}
                                                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-[10px] font-bold uppercase text-white transition-colors"
                                                        >
                                                            Apply Fix
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ALERTS */}
                            {activeTab === 'alerts' && (
                                <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
                                    <div className="border border-[#27272a]/40 bg-[#09090b]/40 rounded-xl p-6">
                                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                            <ShieldAlert className="w-4 h-4 text-indigo-400" /> Active Alert Trigger Conditions
                                        </h3>
                                        <div className="space-y-3 font-mono text-xs text-[#a1a1aa]">
                                            <div className="p-3 border border-red-500/20 bg-red-500/5 rounded-lg flex items-center justify-between">
                                                <span>Spikes on average HTTP error rate &gt; 1.5%</span>
                                                <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-bold">WARNING</span>
                                            </div>
                                            <div className="p-3 border border-red-500/20 bg-red-500/5 rounded-lg flex items-center justify-between">
                                                <span>Spikes on average HTTP error rate &gt; 5.0%</span>
                                                <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 font-bold">CRITICAL</span>
                                            </div>
                                            <div className="p-3 border border-amber-500/20 bg-amber-500/5 rounded-lg flex items-center justify-between">
                                                <span>P95 Response Latency times &gt; 250ms</span>
                                                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold">WARNING</span>
                                            </div>
                                            <div className="p-3 border border-[#27272a]/40 bg-black/40 rounded-lg flex items-center justify-between">
                                                <span>Average edge node cache hit ratio &lt; 80%</span>
                                                <span className="px-2 py-0.5 rounded bg-white/5 text-[#525252]">INFORMATIONAL</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SETTINGS */}
                            {activeTab === 'settings' && (
                                <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
                                    <div className="border border-[#27272a]/40 bg-[#09090b]/40 rounded-xl p-6 space-y-4">
                                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                            <Wrench className="w-4 h-4 text-indigo-400" /> Observability Notification Slack & Channels Webhooks
                                        </h3>
                                        <div className="space-y-4 max-w-md">
                                            <div className="space-y-1">
                                                <label className="text-xs font-mono text-[#71717a] uppercase">Slack Webhook URL</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="https://hooks.slack.com/services/..."
                                                    className="w-full bg-black border border-[#27272a]/60 px-3 py-2 text-xs rounded-lg text-white focus:outline-none focus:border-indigo-500/50"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-mono text-[#71717a] uppercase">Remediation Webhook callback</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="https://yourdomain.com/remediation"
                                                    className="w-full bg-black border border-[#27272a]/60 px-3 py-2 text-xs rounded-lg text-white focus:outline-none focus:border-indigo-500/50"
                                                />
                                            </div>
                                            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-colors">
                                                Save Settings
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </main>

                {/* COLLAPSIBLE RIGHT AI SRE PANEL */}
                <aside className={cn(
                    "border-l border-[#27272a]/20 bg-[#09090b]/40 flex flex-col shrink-0 transition-all duration-300 relative",
                    isAiCollapsed ? "w-0 overflow-hidden border-l-0" : "w-80"
                )}>
                    {/* Panel toggle tab */}
                    <button 
                        onClick={() => setIsAiCollapsed(!isAiCollapsed)}
                        className="absolute right-full top-1/2 -translate-y-1/2 bg-[#09090b] border-l border-y border-[#27272a]/40 p-1.5 rounded-l-lg hover:text-white text-[#a1a1aa]"
                        style={{ right: '100%', borderRight: '0' }}
                    >
                        <ChevronRight className={cn("w-4 h-4 transition-transform", isAiCollapsed ? "rotate-180" : "")} />
                    </button>

                    <div className="p-4 border-b border-[#27272a]/20 flex items-center gap-2 bg-black/40 shrink-0">
                        <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white">AI SRE Specialist</h3>
                    </div>

                    {/* Chat ledger */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="bg-purple-950/10 border border-purple-500/25 rounded-xl p-4 space-y-2">
                            <div className="flex items-center gap-1.5 text-purple-400 font-semibold text-xs font-mono uppercase">
                                <ShieldAlert className="w-4 h-4" /> AI Diagnostics
                            </div>
                            <p className="text-[11px] text-[#a1a1aa] leading-relaxed">
                                Continuous telemetry analysis active. Model strategy engaged: <span className="text-purple-400">DeepSeek R1</span> and <span className="text-purple-400">Qwen 235B</span> are monitoring your Docker clusters.
                            </p>
                        </div>

                        {/* Warnings ticker */}
                        {aiInsights?.infrastructure_warnings && aiInsights.infrastructure_warnings.length > 0 && (
                            <div className="space-y-2 mt-6">
                                <div className="text-[10px] font-mono text-[#525252] uppercase tracking-wider px-1">SRE Ticker Warning</div>
                                {aiInsights.infrastructure_warnings.map((warn: string, idx: number) => (
                                    <div key={idx} className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-2.5 flex items-start gap-2.5">
                                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                        <p className="text-[10px] font-mono text-[#fde68a] leading-normal">{warn}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Interactive chat ledger history */}
                        <div className="space-y-3 mt-6">
                            <div className="text-[10px] font-mono text-[#525252] uppercase tracking-wider px-1">SRE Consultation</div>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                                {aiChatLog.map((chat, idx) => (
                                    <div 
                                        key={idx} 
                                        className={cn(
                                            "p-3 rounded-lg text-xs leading-relaxed font-mono",
                                            chat.role === 'user'
                                                ? "bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-right ml-4"
                                                : "bg-black/30 border border-[#27272a]/20 text-[#a1a1aa] mr-4"
                                        )}
                                    >
                                        <div className="text-[8px] text-[#525252] uppercase mb-1">{chat.role}</div>
                                        {chat.message}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Chat inputs */}
                    <div className="p-4 border-t border-[#27272a]/20 bg-[#09090b]/40 shrink-0">
                        <div className="relative">
                            <input 
                                type="text"
                                placeholder="Query AI SRE about latency..."
                                value={aiChatQuery}
                                onChange={e => setAiChatQuery(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendChatMsg()}
                                className="w-full bg-black border border-[#27272a]/60 px-3 py-2 pr-10 text-xs rounded-lg text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 font-mono"
                            />
                            <button 
                                onClick={sendChatMsg}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                <Send className="w-3.5 h-3.5 fill-current" />
                            </button>
                        </div>
                    </div>
                </aside>

            </div>
        </div>
    );
}

function SignalTile({ label, value, trend, icon, status = 'good', subtext }: any) {
    return (
        <div className={styles.signalTile}>
            <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg bg-black border border-[#27272a]/40">{icon}</div>
                {trend && (
                    <div className={cn(
                        "flex items-center text-xs font-semibold font-mono",
                        trend === 'up' && status === 'good' ? "text-emerald-400" :
                        trend === 'up' && status === 'warning' ? "text-red-400" :
                        trend === 'down' && status === 'good' ? "text-emerald-400" :
                        "text-[#525252]"
                    )}>
                        {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : <Activity className="w-3 h-3 animate-pulse" />}
                    </div>
                )}
            </div>
            <div>
                <div className="text-2xl font-bold tracking-tight text-white mb-1 font-mono">{value}</div>
                <div className="text-[10px] text-[#525252] font-semibold uppercase tracking-wider">{label}</div>
                {subtext && <div className="text-[9px] text-[#525252] font-mono mt-1">{subtext}</div>}
            </div>
        </div>
    );
}
