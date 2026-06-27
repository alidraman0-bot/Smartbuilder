"use client";

import React, { useState } from 'react';
import { Users, Search, Crown, Sparkles, ChevronDown } from 'lucide-react';

interface UserTableProps {
    users: any;
    investorMode: boolean;
}

const PLAN_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    free: { label: 'Free', color: '#818cf8', bg: 'rgba(99,102,241,0.1)' },
    pro: { label: 'Pro', color: '#a78bfa', bg: 'rgba(139,92,246,0.12)' },
    enterprise: { label: 'Enterprise', color: '#34d399', bg: 'rgba(16,185,129,0.1)' },
};

const STATUS_CONFIG: Record<string, { dot: string; label: string }> = {
    active: { dot: '#34d399', label: 'Active' },
    churned: { dot: '#fb7185', label: 'Churned' },
    suspended: { dot: '#fbbf24', label: 'Suspended' },
};

export default function UserTable({ users, investorMode }: UserTableProps) {
    const [filter, setFilter] = useState<'all' | 'free' | 'pro' | 'enterprise'>('all');
    const [search, setSearch] = useState('');

    if (!users) return (
        <div className="rounded-2xl h-80 animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
    );

    const rows: any[] = users.users ?? [];
    const mask = (v: any) => investorMode ? '•••' : v;

    const filtered = rows.filter(u => {
        const matchesPlan = filter === 'all' || u.plan === filter;
        const matchesSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        return matchesPlan && matchesSearch;
    });

    return (
        <div className="rounded-2xl overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
            }}>
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                    <Users size={16} className="text-indigo-400" />
                    <span className="text-sm font-bold text-white">All Users</span>
                    <span className="text-[10px] text-zinc-600 font-mono">{users.total} total</span>
                </div>

                <div className="flex items-center space-x-2">
                    {/* Search */}
                    <div className="relative">
                        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search users…"
                            className="pl-7 pr-3 py-1.5 text-xs rounded-lg bg-white/4 border border-white/8 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/40 w-36"
                        />
                    </div>

                    {/* Plan filter */}
                    {(['all', 'free', 'pro', 'enterprise'] as const).map(p => (
                        <button
                            key={p}
                            onClick={() => setFilter(p)}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${filter === p
                                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                                : 'text-zinc-600 hover:text-zinc-400 border border-transparent'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(140,140,160,0.5)' }}>
                            <th className="text-left px-5 py-3">User</th>
                            <th className="text-left px-4 py-3">Plan</th>
                            <th className="text-left px-4 py-3">Status</th>
                            <th className="text-right px-4 py-3">Projects</th>
                            <th className="text-right px-4 py-3">AI Calls</th>
                            <th className="text-right px-4 py-3">MRR</th>
                            <th className="text-right px-5 py-3">Last Active</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/4">
                        {filtered.map((u, i) => {
                            const plan = PLAN_CONFIG[u.plan] ?? PLAN_CONFIG.free;
                            const status = STATUS_CONFIG[u.status] ?? STATUS_CONFIG.active;
                            const initials = u.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                            const avatarColors = ['rgba(99,102,241,0.3)', 'rgba(139,92,246,0.3)', 'rgba(16,185,129,0.3)', 'rgba(245,158,11,0.3)', 'rgba(59,130,246,0.3)'];
                            const avatarBg = avatarColors[i % avatarColors.length];

                            return (
                                <tr key={u.id} className="group transition-colors hover:bg-white/[0.02]">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                                style={{ background: avatarBg }}>
                                                {initials}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-white truncate">{u.name}</p>
                                                <p className="text-[10px] text-zinc-600 truncate">{mask(u.email)}</p>
                                            </div>
                                            {u.plan === 'enterprise' && <Crown size={11} className="text-amber-400 flex-shrink-0" />}
                                            {u.plan === 'pro' && <Sparkles size={11} className="text-purple-400 flex-shrink-0" />}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                                            style={{ background: plan.bg, color: plan.color }}>
                                            {plan.label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center space-x-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: status.dot }} />
                                            <span className="text-xs text-zinc-400">{status.label}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="text-sm font-mono text-zinc-300">{u.projects}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="text-sm font-mono text-zinc-300">{mask(u.ai_calls?.toLocaleString())}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="text-sm font-mono font-bold" style={{ color: u.mrr_contribution > 0 ? '#34d399' : 'rgba(140,140,160,0.4)' }}>
                                            {u.mrr_contribution > 0 ? `$${mask(u.mrr_contribution)}` : '—'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <span className="text-[10px] font-mono text-zinc-600">{u.last_active}</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {filtered.length === 0 && (
                <div className="px-5 py-8 text-center text-zinc-600 text-sm">No users match your filter.</div>
            )}

            <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-zinc-600">Showing {filtered.length} of {users.total} users</span>
                <button className="flex items-center space-x-1 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors">
                    <span>Load more</span>
                    <ChevronDown size={12} />
                </button>
            </div>
        </div>
    );
}
