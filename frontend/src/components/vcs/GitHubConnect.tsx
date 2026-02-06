"use client";

import React from 'react';
import { Github, Link2, ShieldCheck, ChevronRight, Lock, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

export default function GitHubConnect() {
    const [isConnected, setIsConnected] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleConnect = () => {
        setIsLoading(true);
        // Simulate OAuth Redirect
        setTimeout(() => {
            setIsConnected(true);
            setIsLoading(false);
        }, 2000);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2">
                <h1 className="text-3xl font-black uppercase tracking-tighter text-black">Source Selection</h1>
                <p className="text-sm text-gray-500 font-medium">Smartbuilder connects via GitHub App to provide enterprise-grade version control.</p>
            </div>

            <div className="border border-black bg-white divide-y divide-gray-100">
                <div className="p-8 flex items-center justify-between group">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gray-50 flex items-center justify-center border border-gray-100 rounded-none group-hover:border-black transition-colors">
                            <Github className="w-8 h-8 text-black" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-bold uppercase tracking-tight">GitHub Integration</h3>
                                <div className="bg-blue-50 text-blue-600 text-[9px] font-black px-1.5 py-0.5 uppercase">Installed App</div>
                            </div>
                            <p className="text-xs text-gray-400 font-medium max-w-xs leading-relaxed">
                                Scoped permissions for code generation, PR monitoring, and enterprise audit logs.
                            </p>
                        </div>
                    </div>

                    {!isConnected ? (
                        <button
                            onClick={handleConnect}
                            disabled={isLoading}
                            className="bg-black text-white px-8 py-3 text-xs font-black uppercase tracking-[0.2em] hover:bg-gray-900 transition-all flex items-center gap-3 disabled:opacity-50"
                        >
                            {isLoading ? "Authenticating..." : "Connect GitHub"}
                            {!isLoading && <ChevronRight className="w-4 h-4" />}
                        </button>
                    ) : (
                        <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 px-6 py-3 border border-emerald-100">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-widest">Connected</span>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-gray-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase text-gray-400 tracking-[0.2em]">SOC2 Compliance Mode Active</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase text-blue-600 tracking-widest border-b border-blue-600/20 cursor-pointer hover:border-blue-600 transition-all">
                        View Permission Scopes
                    </div>
                </div>
            </div>

            {isConnected && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-500">
                    <RepoOption name="sb-marketplace-mvp" date="Created 2m ago" active />
                    <RepoOption name="Select existing repository..." />
                </div>
            )}
        </div>
    );
}

function RepoOption({ name, date, active = false }: { name: string, date?: string, active?: boolean }) {
    return (
        <button className={clsx(
            "p-6 border text-left transition-all",
            active ? "border-black bg-white ring-1 ring-black" : "border-gray-200 bg-white hover:border-black"
        )}>
            <div className="flex items-center justify-between mb-2">
                <div className="text-[9px] font-black uppercase tracking-widest text-gray-400">Target Environment</div>
                {active && <div className="w-2 h-2 bg-black" />}
            </div>
            <div className="text-sm font-bold text-black font-mono truncate">{name}</div>
            {date && <div className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">{date}</div>}
        </button>
    );
}
