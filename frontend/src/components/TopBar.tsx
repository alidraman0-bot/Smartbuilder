"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, ChevronDown, Command, Settings, User, LogOut, Sparkles, Activity } from 'lucide-react';

export default function TopBar() {
    const [searchFocused, setSearchFocused] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const notifications = 3; // Mock notification count

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

    return (
        <div className="h-full flex items-center justify-between px-6 bg-transparent relative z-20">
            {/* Enhanced Search Bar */}
            <div className="flex items-center w-full max-w-2xl">
                <div className="relative w-full group">
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
                    <div className={`relative flex items-center ${searchFocused ? 'scale-[1.02]' : 'scale-100'} transition-transform duration-300`}>
                        <Search 
                            size={16} 
                            className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                                searchFocused 
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
                    <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 group hover:bg-emerald-500/15 transition-all cursor-pointer">
                        <div className="relative">
                            <Activity size={14} className="text-emerald-400" />
                            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">AI Active</span>
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
                                <span className="text-sm font-bold text-white tracking-tight">Supervisor 01</span>
                                <Sparkles size={12} className="text-indigo-400" />
                            </div>
                            <span className="text-[10px] font-mono font-semibold text-indigo-400/80 uppercase">Lead Authority</span>
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
                        <div className="absolute right-0 top-full mt-2 w-64 glass-card rounded-xl p-2 shadow-2xl border border-white/10 animate-scale-in z-50">
                            <div className="p-3 border-b border-white/5 mb-2">
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                        <User size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">Supervisor 01</p>
                                        <p className="text-xs text-zinc-400">Lead Authority</p>
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
                                <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-all duration-200">
                                    <Settings size={16} className="text-zinc-400" />
                                    <span>Preferences</span>
                                </button>
                                <div className="h-px bg-white/5 my-1" />
                                <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200">
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
