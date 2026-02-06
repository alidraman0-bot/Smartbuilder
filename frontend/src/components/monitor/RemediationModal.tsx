'use client';

import React, { useState, useEffect } from 'react';
import {
    X, CheckCircle2, Loader2, ShieldCheck,
    Terminal, FileCode, Play, Server, ArrowRight
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface RemediationModalProps {
    isOpen: boolean;
    onClose: () => void;
    action: any;
    onConfirm: (id: string) => void;
}

export default function RemediationModal({ isOpen, onClose, action, onConfirm }: RemediationModalProps) {
    const [step, setStep] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen && action) {
            setStep(0);
            setLogs([]);
            runSimulation();
        }
    }, [isOpen, action]);

    const runSimulation = async () => {
        // Step 0: Analysis
        setStep(0);
        addLog("Initializing repair context...");
        await wait(800);
        addLog(`Loading error logs for ${action.issue}...`);
        await wait(1000);
        addLog("Identified root cause: Token validation logic deviation.");
        await wait(800);

        // Step 1: Repair (Code Gen)
        setStep(1);
        addLog("Generating scoped fix in 'auth_service.py'...");
        await wait(1500);
        addLog("Applying patch v2.1.4...");
        await wait(1000);

        // Step 2: Deployment
        setStep(2);
        addLog("Creating Preview Environment...");
        await wait(1200);
        addLog("Deploying fix to sandbox...");
        await wait(1500);

        // Step 3: Verification
        setStep(3);
        addLog("Running regression tests...");
        await wait(1000);
        addLog("Verifying auth token signatures...");
        await wait(800);
        addLog("Health check passed (200 OK).");
        await wait(500);

        // Step 4: Ready
        setStep(4);
    };

    const addLog = (msg: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

    if (!isOpen || !action) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#09090b] border border-[#27272a] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-[#27272a] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Autonomous Remediation</h2>
                            <p className="text-xs text-[#a1a1aa] font-mono">ID: {action.id} • {action.issue}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-[#525252] hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-[#18181b] w-full flex">
                    <div className={cn("h-full bg-indigo-500 transition-all duration-500", step === 0 && "w-[20%]", step === 1 && "w-[40%]", step === 2 && "w-[60%]", step === 3 && "w-[80%]", step >= 4 && "w-full")} />
                </div>

                {/* Body */}
                <div className="p-8 grid grid-cols-2 gap-8">

                    {/* Left: Steps Visualization */}
                    <div className="space-y-6">
                        <StepItem
                            status={step > 0 ? 'completed' : step === 0 ? 'active' : 'pending'}
                            icon={<Terminal className="w-4 h-4" />}
                            title="Analysis & Context"
                            desc="Analyzing logs and error patterns."
                        />
                        <StepItem
                            status={step > 1 ? 'completed' : step === 1 ? 'active' : 'pending'}
                            icon={<FileCode className="w-4 h-4" />}
                            title="Generate Fix"
                            desc="Creating scoped code patch."
                        />
                        <StepItem
                            status={step > 2 ? 'completed' : step === 2 ? 'active' : 'pending'}
                            icon={<Server className="w-4 h-4" />}
                            title="Preview Deployment"
                            desc="Deploying to isolated sandbox."
                        />
                        <StepItem
                            status={step > 3 ? 'completed' : step === 3 ? 'active' : 'pending'}
                            icon={<CheckCircle2 className="w-4 h-4" />}
                            title="Verification"
                            desc="Running automated health checks."
                        />
                    </div>

                    {/* Right: Console Output */}
                    <div className="bg-[#0c0c0e] rounded-xl border border-[#27272a] p-4 flex flex-col font-mono text-xs overflow-hidden">
                        <div className="flex items-center justify-between text-[#525252] mb-2 uppercase text-[10px] font-bold">
                            <span>Remediation Log</span>
                            <span className="animate-pulse text-emerald-500">
                                {step < 4 ? 'Processing...' : 'Complete'}
                            </span>
                        </div>
                        <div className="flex-1 space-y-2 overflow-y-auto max-h-[300px] min-h-[300px]">
                            {logs.map((log, i) => (
                                <div key={i} className="text-[#a1a1aa] border-l-2 border-indigo-500/20 pl-2">
                                    {log}
                                </div>
                            ))}
                            {step < 4 && (
                                <div className="text-indigo-400 animate-pulse">_</div>
                            )}
                        </div>

                        {/* Simulation Visuals based on step */}
                        <div className="mt-4 pt-4 border-t border-[#27272a] h-32 flex items-center justify-center">
                            {step === 1 && <CodeDiff />}
                            {step === 2 && <DeployVisual />}
                            {step === 3 && <HealthCheckVisual />}
                            {step >= 4 && (
                                <div className="text-center">
                                    <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 mb-2">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-white font-medium">Fix Verified</h4>
                                    <p className="text-xs text-emerald-500/70">Ready for generic production</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[#27272a] bg-[#0c0c0e]/50 flex justify-between items-center">
                    <div className="text-xs text-[#525252]">
                        <span className="font-bold text-[#a1a1aa]">Safety Check:</span> Rollback available instantly.
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-colors">
                            Cancel
                        </button>
                        <button
                            disabled={step < 4}
                            onClick={() => onConfirm(action.id)}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/20"
                        >
                            {step < 4 ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                            {step < 4 ? 'Auto-Remediating...' : 'Confirm & Apply to Prod'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StepItem({ status, icon, title, desc }: any) {
    return (
        <div className="flex gap-4 group">
            <div className={cn(
                "relative z-10 w-8 h-8 rounded-full flex items-center justify-center border transition-colors duration-500",
                status === 'completed' ? "bg-indigo-500 border-indigo-500 text-white" :
                    status === 'active' ? "bg-indigo-500/10 border-indigo-500 text-indigo-400 animate-pulse" :
                        "bg-[#18181b] border-[#27272a] text-[#525252]"
            )}>
                {status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : icon}
            </div>
            <div className={cn("transition-opacity duration-500", status === 'pending' ? "opacity-40" : "opacity-100")}>
                <h3 className={cn("text-sm font-bold", status === 'active' ? "text-indigo-400" : "text-white")}>{title}</h3>
                <p className="text-xs text-[#a1a1aa]">{desc}</p>
            </div>
        </div>
    );
}

// Mini visualizations
function CodeDiff() {
    return (
        <div className="w-full text-[10px] font-mono p-2 bg-[#09090b] rounded border border-[#27272a]">
            <div className="text-red-500/50 line-through">- if not token.validate():</div>
            <div className="text-emerald-400">+ if not token.validate(strict=True):</div>
            <div className="text-[#525252] pl-4">   raise AuthError("Invalid sig")</div>
        </div>
    );
}

function DeployVisual() {
    return (
        <div className="flex gap-1 items-end h-12 w-full justify-center">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-2 bg-indigo-500/40 rounded-t animate-bounce" style={{ height: `${i * 20}%`, animationDelay: `${i * 100}ms` }} />
            ))}
        </div>
    );
}

function HealthCheckVisual() {
    return (
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-emerald-500 font-mono text-xs">200 OK</span>
        </div>
    );
}
