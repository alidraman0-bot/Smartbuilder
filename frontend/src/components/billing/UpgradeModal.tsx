"use client";

import React, { useState } from 'react';
import { X, Check, Sparkles, Loader2, Crown, Zap } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface UpgradeModalProps {
    plan: string;
    onClose: () => void;
    onSuccess?: () => void;
}

// Plan details
const PLAN_DETAILS = {
    starter: {
        name: 'Builder (Starter)',
        price: 2900, // $29.00
        displayPrice: '$29',
        features: [
            '200 Monthly Idea Generations',
            '10 Ideas per Click',
            'MVP Builder Access',
            'PRD Generation',
            'GitHub Connection',
            'PDF Exports',
            '1 Active Project'
        ],
        color: 'from-blue-500 to-indigo-500'
    },
    pro: {
        name: 'Founder (Pro)',
        price: 7900, // $79.00
        displayPrice: '$79',
        features: [
            'Everything in Builder',
            '1,000 Monthly Idea Generations',
            '3 Active Projects',
            'Freeze Build Capability',
            'Production Deployment',
            'Priority AI Processing',
            'Custom Domain Support'
        ],
        color: 'from-indigo-500 to-purple-500'
    },
    team: {
        name: 'Team',
        price: 19900, // $199.00
        displayPrice: '$199',
        features: [
            'Everything in Founder',
            '5,000+ Monthly Idea Generations',
            'Unlimited Projects',
            'Team Collaboration Access',
            'Shared Workspace',
            'Audit logs & Security',
            'Dedicated Account Manager'
        ],
        color: 'from-purple-500 to-pink-500'
    }
};

export default function UpgradeModal({ plan, onClose, onSuccess }: UpgradeModalProps) {
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pollSubscriptionStatus = async (orgId: string, targetPlan: string) => {
        setVerifying(true);
        let attempts = 0;
        const maxAttempts = 15;

        const checkStatus = async () => {
            attempts++;
            try {
                const res = await fetch(`/api/v1/billing/subscription?org_id=${orgId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.plan === targetPlan && data.status === 'active') {
                        if (onSuccess) {
                            onSuccess();
                        } else {
                            window.location.href = '/billing?payment=success';
                        }
                        return true;
                    }
                }
            } catch (err) {
                console.error('Polling error:', err);
            }

            if (attempts >= maxAttempts) {
                window.location.href = '/billing?payment=processing';
                return true;
            }
            return false;
        };

        const interval = setInterval(async () => {
            const done = await checkStatus();
            if (done) clearInterval(interval);
        }, 2000);
    };

    const planDetails = PLAN_DETAILS[plan as keyof typeof PLAN_DETAILS];

    if (!planDetails) {
        return null;
    }

    const handleUpgrade = async () => {
        setLoading(true);
        setError(null);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('You must be logged in to upgrade');
            }

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
                    const res = await fetch('/api/v1/billing/ensure-org', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${session?.access_token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        org_id = data.org_id;
                        console.info('Auto-provisioned default organization:', org_id);
                    } else {
                        const errorData = await res.json();
                        console.error('Organization verification failed:', errorData.detail || res.statusText);
                    }
                } catch (err) {
                    console.error('Failed to verify/provision organization (network/exception):', err);
                }
            }

            if (!org_id) {
                throw new Error('No organization found for your account. Please create one first or contact support.');
            }

            const email = user.email;

            // Call backend to initialize Paystack transaction
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch('/api/v1/billing/upgrade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({
                    plan: plan,
                    email: email,
                    org_id: org_id,
                    callback_url: `${window.location.origin}/billing?payment=success`
                })
            });

            let data;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await response.json();
            } else {
                const text = await response.text();
                console.error("Non-JSON response:", text);
                throw new Error(text || "Server error");
            }

            if (!response.ok) {
                throw new Error(data?.detail || 'Failed to initialize payment');
            }

            // Initialize Paystack Popup
            const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
            const finalAmount = Math.round(data.amount_ghs || (planDetails.price * 15));

            console.log('Initializing Paystack Pop with:', {
                keyExists: !!paystackKey,
                email: email,
                amount: finalAmount,
                currency: 'GHS',
                ref: data.reference
            });

            if (!paystackKey) {
                throw new Error('Payment configuration missing: Public key not found.');
            }

            const handler = (window as any).PaystackPop.setup({
                key: paystackKey,
                email: email,
                amount: finalAmount,
                currency: 'GHS', // Must be GHS for Paystack account
                ref: data.reference,
                metadata: {
                    org_id: org_id,
                    plan: plan,
                    custom_fields: [
                        {
                            display_name: "Plan",
                            variable_name: "plan",
                            value: planDetails.name
                        }
                    ]
                },
                callback: function (response: any) {
                    // Payment successful
                    console.log('Payment successful:', response);
                    setLoading(false);

                    // Start polling for backend update via webhook
                    pollSubscriptionStatus(org_id, plan);
                },
                onClose: function () {
                    // User closed popup
                    setLoading(false);
                }
            });

            handler.openIframe();

        } catch (err: any) {
            console.error('Upgrade error:', err);
            setError(err.message || 'Failed to process upgrade. Please try again.');
            setLoading(false);
        }
    };

    return (
        <>
            {/* Minimalist Light Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="relative w-full max-w-[500px] pointer-events-auto bg-white rounded-[32px] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden animate-in zoom-in-95 fade-in duration-300"
                    onClick={(e) => e.stopPropagation()}
                >

                    {/* Header Section */}
                    <div className="relative pt-10 px-8 pb-6 text-center">
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col items-center gap-4">
                            {/* Plan Badge */}
                            <div className={`px-4 py-1 rounded-full bg-gradient-to-r ${planDetails.color} text-white text-xs font-bold tracking-tight shadow-sm`}>
                                {planDetails.name.split(' ')[0]}
                            </div>

                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                                Upgrade to {planDetails.name.split(' (')[0]}
                            </h2>
                            <p className="text-slate-500 text-sm max-w-[280px] leading-relaxed">
                                Unlock these features by upgrading to a {plan.charAt(0).toUpperCase() + plan.slice(1)} plan.
                            </p>
                        </div>
                    </div>

                    {/* Main Content Pane */}
                    <div className="px-10 pb-12 space-y-10">
                        {verifying ? (
                            <div className="py-12 flex flex-col items-center text-center space-y-4">
                                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-slate-900">Verifying Payment</h3>
                                    <p className="text-slate-500 text-xs">This will only take a moment...</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Features Grid */}
                                <div className="px-10 pb-4">
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-2">
                                        {planDetails.features.slice(0, 4).map((feature, index) => (
                                            <div key={index} className="flex items-center gap-2.5">
                                                <div className="p-0.5 rounded-full bg-emerald-50 text-emerald-600">
                                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                </div>
                                                <span className="text-[13px] font-semibold text-slate-600 line-clamp-1">{feature}</span>
                                            </div>
                                        ))}
                                        {planDetails.features.length > 4 && (
                                            <>
                                                <div className="flex items-center gap-2.5">
                                                    <div className="p-0.5 rounded-full bg-emerald-50 text-emerald-600">
                                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                    </div>
                                                    <span className="text-[13px] font-semibold text-slate-600">Advanced Settings</span>
                                                </div>
                                                <div className="flex items-center gap-2.5">
                                                    <div className="p-0.5 rounded-full bg-emerald-50 text-emerald-600">
                                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                    </div>
                                                    <span className="text-[13px] font-semibold text-slate-600">Priority Support</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Highlighted Plan Box */}
                                <div className={`relative p-6 rounded-2xl bg-white border-2 border-indigo-600/10 shadow-sm flex items-center justify-between group transition-all`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-5 h-5 rounded-full border-4 border-white ring-2 ring-indigo-600 bg-indigo-600 animate-in fade-in duration-300`} />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900">1 month subscription</span>
                                            <span className="text-xs text-slate-500 font-medium">Auto-renewing plan</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-bold text-slate-900">
                                            ${planDetails.price / 100}
                                        </span>
                                        <span className="text-slate-500 text-sm font-medium"> / mo</span>
                                    </div>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="p-3 rounded-xl bg-red-50 text-red-600 text-[11px] font-bold uppercase tracking-wider text-center border border-red-100 animate-in fade-in slide-in-from-top-1">
                                        {error}
                                    </div>
                                )}

                                {/* Main CTA Action */}
                                <div className="space-y-4 pt-2">
                                    <button
                                        onClick={handleUpgrade}
                                        disabled={loading}
                                        className={`w-full py-4 rounded-2xl bg-gradient-to-r ${planDetails.color} text-white font-bold text-base shadow-lg shadow-indigo-200 hover:shadow-indigo-300/50 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3`}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Connecting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Subscribe Now</span>
                                            </>
                                        )}
                                    </button>

                                    <p className="text-xs text-slate-400 text-center font-medium">
                                        Cancel anytime from your <a href="/billing" className="text-slate-600 hover:underline decoration-slate-300 underline-offset-4">billing page.</a>
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
