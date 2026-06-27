"use client";

import React, { useEffect, useState, useCallback } from 'react';
import AdminTopBar from '@/components/admin/AdminTopBar';
import PlatformKpiRow from '@/components/admin/PlatformKpiRow';
import RevenuePanel from '@/components/admin/RevenuePanel';
import UserTable from '@/components/admin/UserTable';
import PlatformHealth from '@/components/admin/PlatformHealth';
import AiCostMeter from '@/components/admin/AiCostMeter';
import PlanDistribution from '@/components/admin/PlanDistribution';
import TopProjectsTable from '@/components/admin/TopProjectsTable';
import { apiFetch } from '@/lib/apiClient';
import { getAuthHeaders } from '@/utils/supabase/auth';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function AdminPage() {
    const [stats, setStats] = useState<any>(null);
    const [revenue, setRevenue] = useState<any>(null);
    const [users, setUsers] = useState<any>(null);
    const [projects, setProjects] = useState<any>(null);
    const [system, setSystem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
    const [investorMode, setInvestorMode] = useState(false);

    const fetchAll = useCallback(async () => {
        try {
            const headers = await getAuthHeaders();
            const [s, r, u, p, sys] = await Promise.all([
                apiFetch(`/api/v1/admin/stats`, { headers }),
                apiFetch(`/api/v1/admin/revenue`, { headers }),
                apiFetch(`/api/v1/admin/users?limit=15`, { headers }),
                apiFetch(`/api/v1/admin/projects?limit=10`, { headers }),
                apiFetch(`/api/v1/admin/system`, { headers }),
            ]);
            setStats(s);
            setRevenue(r);
            setUsers(u);
            setProjects(p);
            setSystem(sys);
            setLastRefresh(new Date());
        } catch (e) {
            console.error('Admin fetch error', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
        const interval = setInterval(fetchAll, 30000);
        return () => clearInterval(interval);
    }, [fetchAll]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#05050a' }}>
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto animate-pulse">
                        <span className="text-xl">⚡</span>
                    </div>
                    <p className="text-zinc-500 text-sm font-mono tracking-widest uppercase">Loading Control Plane…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white" style={{ background: 'linear-gradient(135deg, #05050a 0%, #0a0a12 100%)' }}>
            {/* Ambient glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[600px] h-[400px] rounded-full opacity-[0.04]"
                    style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] rounded-full opacity-[0.03]"
                    style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }} />
            </div>

            <div className="relative z-10">
                <AdminTopBar
                    lastRefresh={lastRefresh}
                    onRefresh={fetchAll}
                    investorMode={investorMode}
                    onToggleInvestorMode={() => setInvestorMode(v => !v)}
                />

                <main className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">
                    {/* KPI Row */}
                    <PlatformKpiRow stats={stats} investorMode={investorMode} />

                    {/* Main Grid */}
                    <div className="grid grid-cols-12 gap-6">
                        {/* Revenue Chart — wide */}
                        <div className="col-span-12 lg:col-span-8">
                            <RevenuePanel revenue={revenue} investorMode={investorMode} />
                        </div>

                        {/* Plan distribution + AI Cost — right column */}
                        <div className="col-span-12 lg:col-span-4 space-y-6">
                            <PlanDistribution revenue={revenue} />
                            <AiCostMeter system={system} investorMode={investorMode} />
                        </div>
                    </div>

                    {/* Top Projects Section */}
                    <div className="grid grid-cols-12">
                        <div className="col-span-12">
                            <TopProjectsTable projects={projects} investorMode={investorMode} />
                        </div>
                    </div>

                    {/* User Table + System Health */}
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 lg:col-span-8">
                            <UserTable users={users} investorMode={investorMode} />
                        </div>
                        <div className="col-span-12 lg:col-span-4">
                            <PlatformHealth system={system} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
