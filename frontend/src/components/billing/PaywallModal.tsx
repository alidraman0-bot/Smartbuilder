"use client";

import React from 'react';
import {
    X, Sparkles, Zap, Lock, ArrowRight, ShieldCheck,
    Rocket, Users, Code, Hammer
} from 'lucide-react';
import { type FeatureKey, getFeatureLockMessage, getRecommendedPlan } from '@/utils/feature-gating';
import UpgradeModal from './UpgradeModal';
import { useState } from 'react';

interface PaywallModalProps {
    feature: FeatureKey;
    onClose: () => void;
    title?: string;
    description?: string;
}

const FEATURE_ASSETS: Record<string, {
    icon: React.ReactNode,
    color: string,
    headline: string,
    benefit: string
}> = {
    idea_generation: {
        icon: <Zap className="w-8 h-8" />,
        color: "from-amber-400 to-orange-500",
        headline: "You're on Fire!",
        benefit: "Unlock 200+ generations and keep the momentum going."
    },
    mvp_builder: {
        icon: <Hammer className="w-8 h-8" />,
        color: "from-blue-500 to-indigo-500",
        headline: "Ready to Build?",
        benefit: "Turn your validated ideas into real code with the MVP Builder."
    },
    freeze_build: {
        icon: <ShieldCheck className="w-8 h-8" />,
        color: "from-indigo-500 to-purple-500",
        headline: "Production Ready?",
        benefit: "Freeze your build state to ensure stability and reliability."
    },
    deployment: {
        icon: <Rocket className="w-8 h-8" />,
        color: "from-purple-500 to-pink-500",
        headline: "Ship to Production",
        benefit: "Launch your MVP on a public URL in seconds."
    },
    team_access: {
        icon: <Users className="w-8 h-8" />,
        color: "from-emerald-500 to-teal-500",
        headline: "Built for Teams",
        benefit: "Invite your co-founders and engineers to build together."
    }
};

export default function PaywallModal({ feature, onClose, title, description }: PaywallModalProps) {
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const assets = FEATURE_ASSETS[feature] || FEATURE_ASSETS.idea_generation;
    const recommendedPlan = getRecommendedPlan(feature);

    if (showUpgradeModal) {
        return <UpgradeModal plan={recommendedPlan} onClose={onClose} />;
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] animate-fade-in"
                onClick={onClose}
            />

            {/* Paywall Container */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="glass-card rounded-[40px] border border-white/10 max-w-xl w-full bg-[#09090b] shadow-[0_0_100px_rgba(99,102,241,0.15)] overflow-hidden pointer-events-auto animate-scale-in"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Visual Header */}
                    <div className={`relative h-48 bg-gradient-to-br ${assets.color} p-10 flex items-center justify-between overflow-hidden`}>
                        <div className="relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mb-4">
                                {assets.icon}
                            </div>
                            <h2 className="text-3xl font-bold text-white tracking-tight">
                                {title || assets.headline}
                            </h2>
                        </div>

                        {/* Abstract Background Shapes */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-black/20 rounded-full mr-10 -mb-10 blur-2xl" />

                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-10 space-y-8">
                        <div className="space-y-3">
                            <p className="text-xl font-medium text-white leading-tight">
                                {description || getFeatureLockMessage(feature)}
                            </p>
                            <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
                                <Sparkles size={16} />
                                <span className="text-sm uppercase tracking-wider">{assets.benefit}</span>
                            </div>
                        </div>

                        {/* Social Proof / Trust */}
                        <div className="grid grid-cols-3 gap-4 py-6 border-y border-white/5">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-white">20,000+</p>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">Users Shipped</p>
                            </div>
                            <div className="text-center border-x border-white/5">
                                <p className="text-2xl font-bold text-white">100ms</p>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">Generation Time</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-white">99.9%</p>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">Build Uptime</p>
                            </div>
                        </div>

                        {/* Call to Action */}
                        <div className="space-y-4">
                            <button
                                onClick={() => setShowUpgradeModal(true)}
                                className={`w-full py-5 rounded-[20px] bg-gradient-to-r ${assets.color} text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all flex items-center justify-center space-x-3`}
                            >
                                <span>Upgrade Instantly</span>
                                <ArrowRight size={20} />
                            </button>
                            <p className="text-center text-zinc-500 text-sm">
                                Cancel anytime • Upgrade in 30 seconds
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scale-in {
                    from { 
                        opacity: 0; 
                        transform: scale(0.9) translateY(20px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: scale(1) translateY(0); 
                    }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .animate-scale-in { animation: scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </>
    );
}
