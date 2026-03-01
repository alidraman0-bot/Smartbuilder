/**
 * S4: Top Context Bar
 * 
 * Control plane for the builder.
 * - Height: 56px, Fixed
 * - Left: Project info & Status
 * - Center: Build Mode Selector (UI/Logic/Data)
 * - Right: Snapshots & Actions
 */

"use client";

import React from 'react';
import {
    Lock, Sparkles, History, FileText,
    Monitor, Database, Cpu, ChevronDown
} from 'lucide-react';
import { useMvpBuilderStore, BuildMode, BuilderState } from '@/store/useMvpBuilderStore';
import { useBillingStore } from '@/store/useBillingStore';
import { hasFeature } from '@/utils/feature-gating';
import PaywallModal from '@/components/billing/PaywallModal';

export default function TopContextBar() {
    const {
        projectName, uiState, buildMode, setBuildMode,
        buildVersion, freeze
    } = useMvpBuilderStore();

    const { subscription, fetchSubscription } = useBillingStore();
    const [showPaywall, setShowPaywall] = React.useState(false);

    React.useEffect(() => {
        fetchSubscription('demo-org-id');
    }, [fetchSubscription]);

    const isFrozen = uiState === 'S6';

    const handleFreezeClick = () => {
        const currentPlan = subscription?.plan || 'free';
        if (!hasFeature(currentPlan, 'freeze_build')) {
            setShowPaywall(true);
            return;
        }
        freeze();
    };

    return (
        <div className="h-14 bg-[#0a0a0f] border-b border-[#27272a] shadow-md flex items-center justify-between px-4 z-50 select-none">

            {/* LEFT: Project Identify */}
            <div className="flex items-center space-x-4 w-1/4">
                <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                        <h1 className="text-sm font-bold text-white truncate max-w-[200px]">
                            {projectName || "Untitled Project"}
                        </h1>
                        <span className="text-[10px] bg-[#27272a] text-zinc-400 px-1.5 py-0.5 rounded font-mono">
                            v{buildVersion}.0
                        </span>
                    </div>
                </div>

                {/* Status Pill */}
                <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-[10px] uppercase font-bold tracking-wide ${isFrozen
                    ? 'bg-zinc-900 border-zinc-700 text-zinc-400'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                    }`}>
                    {isFrozen ? <Lock size={10} /> : <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                    <span>{isFrozen ? 'Frozen' : 'Stable'}</span>
                </div>
            </div>

            {/* CENTER: Build Mode Selector (Only active in S4) */}
            <div className="flex items-center justify-center space-x-1 bg-[#18181b] p-1 rounded-lg border border-[#27272a]">
                <ModeTab
                    mode="UI"
                    icon={<Monitor size={14} />}
                    active={buildMode === 'UI'}
                    onClick={() => !isFrozen && setBuildMode('UI')}
                    disabled={isFrozen}
                />
                <ModeTab
                    mode="Logic"
                    icon={<Cpu size={14} />}
                    active={buildMode === 'Logic'}
                    onClick={() => !isFrozen && setBuildMode('Logic')}
                    disabled={isFrozen}
                />
                <ModeTab
                    mode="Data"
                    icon={<Database size={14} />}
                    active={buildMode === 'Data'}
                    onClick={() => !isFrozen && setBuildMode('Data')}
                    disabled={isFrozen}
                />
            </div>

            {/* RIGHT: Tools & Actions */}
            <div className="flex items-center justify-end space-x-3 w-1/4">
                <button
                    disabled={isFrozen}
                    className="flex items-center space-x-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors px-2 py-1.5 rounded disabled:opacity-50"
                >
                    <FileText size={14} />
                    <span>PRD</span>
                </button>

                <div className="w-px h-4 bg-[#27272a]" />

                <button
                    disabled={isFrozen}
                    onClick={() => console.log('Revert')}
                    className="flex items-center space-x-2 text-xs font-medium text-zinc-400 hover:text-amber-400 transition-colors px-2 py-1.5 rounded disabled:opacity-50"
                >
                    <History size={14} />
                </button>

                {!isFrozen && (
                    <button
                        onClick={handleFreezeClick}
                        className="ml-2 flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-700 transition-all"
                    >
                        <Lock size={12} />
                        <span>Freeze</span>
                    </button>
                )}
            </div>

            {/* PAYWALL MODAL */}
            {showPaywall && (
                <PaywallModal
                    feature="freeze_build"
                    onClose={() => setShowPaywall(false)}
                />
            )}
        </div>
    );
}

function ModeTab({ mode, icon, active, onClick, disabled }: any) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center space-x-2 px-6 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${active
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 disabled:opacity-50'
                }`}
        >
            {icon}
            <span>{mode}</span>
        </button>
    );
}
