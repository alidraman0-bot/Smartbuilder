"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, ChevronDown, Command, Settings, User, LogOut, Sparkles, Activity, CreditCard, Zap } from 'lucide-react';
import { useRunStore } from '@/store/useRunStore';
import { createClient } from '@/utils/supabase/client';

export default function TopBar() {
    const [searchFocused, setSearchFocused] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [subscription, setSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const profileRef = useRef<HTMLDivElement>(null);
    const notifications = 3; // Mock notification count
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const getUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                try {
                    // 1. Try finding org where user is a member (org_members)
                    let { data: orgMember } = await supabase
                        .from('org_members')
                        .select('org_id')
                        .eq('user_id', user.id)
                        .maybeSingle();

                    let org_id = orgMember?.org_id;

                    // 2. Try legacy team_members if not found
                    if (!org_id) {
                        const { data: teamMember } = await supabase
                            .from('team_members')
                            .select('org_id')
                            .eq('user_id', user.id)
                            .maybeSingle();
                        org_id = teamMember?.org_id;
                    }

                    // 3. Check if user is an owner of any organization
                    if (!org_id) {
                        const { data: ownedOrg } = await supabase
                            .from('organizations')
                            .select('id')
                            .eq('owner_id', user.id)
                            .limit(1)
                            .maybeSingle();
                        org_id = ownedOrg?.id;
                    }

                    if (!org_id) {
                        // 4. Frictionless Fallback: Auto-provision a default org
                        try {
                            const { data: { session } } = await supabase.auth.getSession();
                            const res = await fetch('/api/v1/billing/provision', {
                                headers: {
                                    'Authorization': `Bearer ${session?.access_token}`
                                }
                            });
                            if (res.ok) {
                                const data = await res.json();
                                org_id = data.org_id;
                                console.info('Auto-provisioned default organization');
                            }
                        } catch (err) {
                            console.error('Failed to auto-provision organization:', err);
                        }
                    }

                    if (org_id) {
                        // 2. Fetch subscription
                        const { data: { session } } = await supabase.auth.getSession();
                        const response = await fetch(`/api/v1/billing/subscription?org_id=${org_id}`, {
                            headers: {
                                'Authorization': `Bearer ${session?.access_token}`
                            }
                        });
                        if (response.ok) {
                            const subData = await response.json();
                            setSubscription(subData);
                        }
                    }
                } catch (err) {
                    console.error('Error fetching billing info:', err);
                }
            }
            setLoading(false);
        };
        getUserData();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setProfileOpen(false);
            }
        }

        if (profileOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [profileOpen]);

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Builder';
    const displayRole = user?.app_metadata?.role || 'Builder'; // Customize based on your metadata

    return (
        <div className="h-full flex items-center justify-between px-6 bg-transparent relative z-20">
            {/* Enhanced Search Bar */}
            <div className="flex items-center w-full max-w-2xl">
                <div className="relative w-full group">
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
                    <div className={`relative flex items-center ${searchFocused ? 'scale-[1.02]' : 'scale-100'} transition-transform duration-300`}>
                        <Search
                            size={16}
                            className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${searchFocused
                                ? 'text-indigo-400 scale-110'
                                : 'text-zinc-500 group-hover:text-zinc-400'
                                }`}
                        />
                        <input
                            type="text"
                            placeholder="Search metrics, logs, signals, or commands..."
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                            className="w-full bg-white/5 border border-white/8 rounded-xl py-2.5 pl-11 pr-20 text-sm text-white placeholder-zinc-500 outline-none focus:bg-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 font-medium backdrop-blur-sm hover:bg-white/8"
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-1.5 bg-zinc-900/50 px-2 py-1 rounded-lg border border-white/5">
                            <Command size={11} className="text-zinc-500" />
                            <span className="text-[10px] font-mono font-bold text-zinc-400">K</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Actions Section */}
            <div className="flex items-center space-x-4">
                {/* Quick Actions */}
                <div className="flex items-center space-x-2">
                    {/* AI Status Indicator */}
                    <div
                        onClick={() => useRunStore.getState().toggleAiCofounder()}
                        className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 group hover:bg-emerald-500/15 transition-all cursor-pointer"
                    >
                        <div className="relative">
                            <Zap size={14} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Ask Co-Founder</span>
                    </div>

                    {/* Notifications */}
                    <button className="relative p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 group">
                        <Bell size={18} className="text-zinc-400 group-hover:text-white transition-colors" />
                        {notifications > 0 && (
                            <>
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center border-2 border-black shadow-lg">
                                    <span className="text-[10px] font-bold text-white">{notifications}</span>
                                </div>
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full animate-ping opacity-75" />
                            </>
                        )}
                    </button>
                </div>

                <div className="h-8 w-px bg-white/10" />

                {/* Enhanced Profile Section */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center space-x-3 cursor-pointer group px-3 py-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300"
                    >
                        <div className="flex flex-col items-end">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-bold text-white tracking-tight">{loading ? '...' : displayName}</span>
                                <Sparkles size={12} className="text-indigo-400" />
                                {!loading && subscription?.plan && (
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${subscription.plan === 'starter' ? 'bg-zinc-800 border-zinc-700 text-zinc-400' :
                                        subscription.plan === 'pro' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' :
                                            subscription.plan === 'team' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' :
                                                'bg-pink-500/10 border-pink-500/30 text-pink-400'
                                        } uppercase tracking-wider`}>
                                        {subscription.plan}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] font-mono font-semibold text-indigo-400/80 uppercase">{displayRole}</span>
                        </div>
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[2px] shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all group-hover:scale-105">
                                <div className="w-full h-full rounded-[8px] bg-black overflow-hidden relative flex items-center justify-center">
                                    <User size={18} className="text-indigo-400" />
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-pink-400/20" />
                                </div>
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-black shadow-lg shadow-emerald-400/50 animate-pulse" />
                        </div>
                        <ChevronDown
                            size={14}
                            className={`text-zinc-400 transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {/* Profile Dropdown */}
                    {profileOpen && (
                        <div className="absolute right-0 top-full mt-2 w-64 glass-card rounded-xl p-2 shadow-2xl border border-white/10 animate-scale-in z-50 bg-[#0a0a0f]">
                            <div className="p-3 border-b border-white/5 mb-2">
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                        <User size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{displayName}</p>
                                        <p className="text-xs text-zinc-400">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">System Online</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-all duration-200">
                                    <User size={16} className="text-zinc-400" />
                                    <span>Profile Settings</span>
                                </button>
                                <button
                                    onClick={() => { setProfileOpen(false); router.push('/billing'); }}
                                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-all duration-200"
                                >
                                    <CreditCard size={16} className="text-zinc-400" />
                                    <span>Billing & Plan</span>
                                </button>
                                <div className="h-px bg-white/5 my-1" />
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                                >
                                    <LogOut size={16} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
