import React, { useState } from 'react';
import {
    ShieldCheck,
    Lock,
    GitCommit,
    FileCheck,
    Activity,
    Server,
    ExternalLink,
    AlertCircle,
    CheckCircle2,
    Download
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ComplianceDashboardProps {
    data: any; // Using any for rapid iteration, refine later
}

export default function ComplianceDashboard({ data }: ComplianceDashboardProps) {
    if (!data) return (
        <div className="flex flex-col items-center justify-center p-12 space-y-4 animate-in fade-in">
            <ShieldCheck className="w-12 h-12 text-[#27272a] animate-pulse" />
            <p className="text-[#525252] font-mono text-sm">Verifying operational controls...</p>
        </div>
    );

    const { status, score, summary, controls, frameworks } = data;

    return (
        <div className="space-y-12 animate-in fade-in duration-500 text-white">

            {/* 1. TRUST OVERVIEW - FIRST IMPRESSION */}
            <div className="grid grid-cols-12 gap-8">
                {/* HERO CARD */}
                <div className="col-span-8 p-8 rounded-3xl border border-[#27272a] bg-[#0c0c0e] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShieldCheck className="w-64 h-64 text-emerald-500" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <h2 className="text-sm font-medium text-[#a1a1aa] uppercase tracking-wider">Compliance Readiness</h2>
                                <div className="flex items-center gap-4">
                                    <span className="text-5xl font-bold tracking-tight text-white">{status}</span>
                                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Score: {score}/100
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="text-lg text-[#a1a1aa] max-w-xl leading-relaxed">
                            {summary}
                        </p>

                        <div className="pt-6 flex items-center gap-4">
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-white rounded-lg text-sm font-medium transition-colors">
                                <Download className="w-4 h-4" /> Export Trust Report (PDF)
                            </button>
                            <span className="text-xs text-[#525252] font-mono">Last verified: {new Date(data.last_verified).toLocaleTimeString()}</span>
                        </div>
                    </div>
                </div>

                {/* CONTROL GRID */}
                <div className="col-span-4 grid grid-cols-2 gap-4">
                    <ControlMetric label="Access Control" status={controls?.access?.status} icon={<Lock className="w-4 h-4" />} />
                    <ControlMetric label="Data Security" status={controls?.data?.status} icon={<FileCheck className="w-4 h-4" />} />
                    <ControlMetric label="Change Mgmt" status={controls?.change?.status} icon={<GitCommit className="w-4 h-4" />} />
                    <ControlMetric label="Availability" status={controls?.availability?.status} icon={<Server className="w-4 h-4" />} />
                </div>
            </div>

            {/* 2. DETAILED EVIDENCE SECTIONS */}
            <div className="space-y-8">
                <SectionHeader icon={<Lock className="w-5 h-5" />} title="Access & Identity Controls" />
                <div className="grid grid-cols-3 gap-8">
                    {/* Log View */}
                    <div className="col-span-2 border border-[#27272a] rounded-xl bg-[#0c0c0e] overflow-hidden">
                        <div className="px-6 py-4 border-b border-[#27272a] flex justify-between items-center bg-[#18181b]/30">
                            <h3 className="text-sm font-medium text-white">Immutable Access Log</h3>
                            <span className="text-xs font-mono text-[#525252]">LIVE TAP</span>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-[#525252] uppercase bg-[#0c0c0e] sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Time</th>
                                        <th className="px-6 py-3 font-medium">User</th>
                                        <th className="px-6 py-3 font-medium">Event</th>
                                        <th className="px-6 py-3 font-medium text-right">Role</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#27272a]">
                                    {[1, 2, 3, 4, 5].map((_, i) => (
                                        <tr key={i} className="hover:bg-[#27272a]/20">
                                            <td className="px-6 py-3 font-mono text-[#a1a1aa]">15:0{i} PM</td>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">
                                                        S
                                                    </div>
                                                    <span className="text-white">Sarah (Eng)</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-[#a1a1aa]">Modified environment variables</td>
                                            <td className="px-6 py-3 text-right">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#27272a] text-[#a1a1aa] border border-[#3f3f46]">ENGINEER</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Check List */}
                    <div className="space-y-4">
                        {controls?.access?.checks?.map((check: any, i: number) => (
                            <CheckItem key={i} label={check.label} checked={check.status} />
                        ))}
                    </div>
                </div>

                <div className="w-full h-px bg-[#27272a]" />

                <SectionHeader icon={<GitCommit className="w-5 h-5" />} title="Change Management & Governance" />
                <div className="grid grid-cols-2 gap-8">
                    <div className="p-6 rounded-xl border border-[#27272a] bg-[#0c0c0e] space-y-6">
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-[#a1a1aa]">Build Lineage Verification</h4>
                            <p className="text-sm text-[#525252]">All changes are version-controlled and cryptographically signed.</p>
                        </div>
                        <div className="space-y-3">
                            {controls?.change?.checks?.map((check: any, i: number) => (
                                <CheckItem key={i} label={check.label} checked={check.status} />
                            ))}
                        </div>
                    </div>

                    <div className="p-6 rounded-xl border border-[#27272a] bg-[#0c0c0e] relative overflow-hidden flex flex-col justify-center">
                        <div className="absolute inset-0 bg-blue-500/5" />
                        <div className="relative z-10 text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto text-blue-400">
                                <GitCommit className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-white font-medium">Deployment Governance Active</h3>
                                <p className="text-sm text-[#a1a1aa] mt-1">Changes to production require automated checks.</p>
                            </div>
                            <div className="flex gap-2 justify-center text-xs font-mono text-[#525252]">
                                <span>SHA: 8a2b...9c</span>
                                <span>•</span>
                                <span>Verified</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. FRAMEWORK ALIGNMENT */}
            <div className="py-8">
                <SectionHeader icon={<FileCheck className="w-5 h-5" />} title="Framework Alignment" />
                <div className="grid grid-cols-3 gap-6 mt-6">
                    {frameworks?.map((fw: any, i: number) => (
                        <div key={i} className="p-6 rounded-xl border border-[#27272a] bg-[#0c0c0e] hover:border-[#525252] transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-white">{fw.name}</h3>
                                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide bg-[#27272a] text-[#a1a1aa]">{fw.level}</span>
                            </div>
                            <p className="text-sm text-[#a1a1aa] mb-6 h-10">{fw.description}</p>
                            <div className="space-y-2">
                                {fw.mappings.map((m: string, j: number) => (
                                    <div key={j} className="flex items-center gap-2 text-xs text-[#525252]">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-500/50" /> {m}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode, title: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#27272a] text-white flex items-center justify-center">
                {icon}
            </div>
            <h2 className="text-lg font-medium text-white">{title}</h2>
        </div>
    );
}

function CheckItem({ label, checked }: { label: string, checked: boolean }) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-[#27272a] bg-[#18181b]/20">
            <div className={cn("w-5 h-5 rounded-full flex items-center justify-center border", checked ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : "border-[#525252] text-[#525252]")}>
                {checked && <CheckCircle2 className="w-3 h-3" />}
            </div>
            <span className="text-sm text-white/80">{label}</span>
        </div>
    )
}

function ControlMetric({ label, status, icon }: { label: string, status: string, icon: React.ReactNode }) {
    const isActive = status === 'active';
    return (
        <div className="p-4 rounded-xl border border-[#27272a] bg-[#0c0c0e] flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-[#27272a] text-[#525252]")}>
                    {icon}
                </div>
                <span className="text-sm font-medium text-[#a1a1aa]">{label}</span>
            </div>
            <div className={cn("w-2 h-2 rounded-full", isActive ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" : "bg-[#27272a]")} />
        </div>
    )
}
