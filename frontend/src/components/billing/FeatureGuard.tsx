"use client";

import React from 'react';
import { Lock, ArrowUpCircle } from 'lucide-react';
import { hasFeature, type FeatureKey, getFeatureLockMessage } from '@/utils/feature-gating';
import Link from 'next/link';

interface FeatureGuardProps {
    feature: FeatureKey;
    plan: string; // The current user/org plan
    children: React.ReactNode;
    fallback?: React.ReactNode;
    showLockUI?: boolean; // If true, shows a standardized "Upgrade to unlock" overlay
}

export default function FeatureGuard({
    feature,
    plan,
    children,
    fallback,
    showLockUI = true
}: FeatureGuardProps) {
    const isEnabled = hasFeature(plan, feature);

    if (isEnabled) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    if (showLockUI) {
        return (
            <div className="relative group rounded-xl overflow-hidden border border-white/5 bg-white/[0.01]">
                {/* Blurred Content Placeholder */}
                <div className="opacity-30 pointer-events-none blur-[2px] select-none" aria-hidden="true">
                    {children}
                </div>

                {/* Lock Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-10 p-6 text-center animate-fade-in">
                    <div className="p-3 bg-zinc-900/80 rounded-2xl border border-white/10 mb-4 shadow-xl">
                        <Lock className="w-6 h-6 text-indigo-400" />
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">Feature Locked</h3>
                    <p className="text-sm text-zinc-400 max-w-[250px] mb-6">
                        {getFeatureLockMessage(feature)}
                    </p>

                    <Link
                        href="/billing"
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center space-x-2 text-sm"
                    >
                        <ArrowUpCircle className="w-4 h-4" />
                        <span>Upgrade Plan</span>
                    </Link>
                </div>
            </div>
        );
    }

    return null;
}
