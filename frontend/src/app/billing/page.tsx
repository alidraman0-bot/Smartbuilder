"use client";

import React, { useState, useEffect } from 'react';
import {
    CreditCard, Check, AlertCircle, Loader2, Sparkles, Users,
    Lock, Zap, TrendingUp, Shield, Calendar, DollarSign,
    ExternalLink, Download, RefreshCw
} from 'lucide-react';
import UpgradeModal from '@/components/billing/UpgradeModal';
import { createClient } from '@/utils/supabase/client';

interface Subscription {
    plan: string;
    status: 'active' | 'past_due' | 'cancelled' | 'trialing';
    current_period_end?: string;
    features: Record<string, any>;
}

interface BillingEvent {
    id: string;
    date: string;
    amount: number;
    currency: string;
    status: 'paid' | 'failed' | 'pending' | 'cancelled';
    type: string;
}

interface PaymentMethod {
    card_brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
}

const PLAN_PRICES = {
    free: { amount: 0, currency: '$' },
    starter: { amount: 29, currency: '$' },
    pro: { amount: 79, currency: '$' },
    team: { amount: 199, currency: '$' },
    enterprise: { amount: 'Custom', currency: '' }
};

export default function BillingPage() {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
    const [billingHistory, setBillingHistory] = useState<BillingEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string>('');

    useEffect(() => {
        fetchBillingData();
    }, []);

    const fetchBillingData = async () => {
        try {
            const supabase = createClient();

            // Get session first to ensure we have a token
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                console.warn('No active session found. Redirecting to login...');
                // Optional: Redirect to login or show functionality as disabled
                setLoading(false);
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error('No user found');
                setLoading(false);
                return;
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
                    const res = await fetch('/api/v1/billing/ensure-org', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${session.access_token}`,
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
                    console.error('Failed to verify organization:', err);
                }
            }

            if (!org_id) {
                console.warn('No organization found for user. Billing features may be limited.');
                setLoading(false);
                return;
            }

            const authHeader = { 'Authorization': `Bearer ${session.access_token}` };

            // Fetch subscription
            const subRes = await fetch(`/api/v1/billing/subscription?org_id=${org_id}`, { headers: authHeader });
            if (subRes.status === 401) {
                console.error("401 Unauthorized fetching subscription. Session might be invalid.");
                // Optionally force refresh session here?
            }
            const subData = await subRes.json();
            setSubscription(subData);

            // Fetch payment method
            const pmRes = await fetch(`/api/v1/billing/payment-method?org_id=${org_id}`, { headers: authHeader });
            if (pmRes.ok) {
                const pmData = await pmRes.json();
                if (pmData.card_brand) {
                    setPaymentMethod(pmData);
                }
            }

            // Fetch billing history
            const historyRes = await fetch(`/api/v1/billing/history?org_id=${org_id}`, { headers: authHeader });
            if (historyRes.ok) {
                const historyData = await historyRes.json();
                setBillingHistory(historyData.history || []);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching billing data:', error);
            setLoading(false);
        }
    };

    const handleUpgrade = (plan: string) => {
        setSelectedPlan(plan);
        setShowUpgradeModal(true);
    };

    const handleManageBilling = () => {
        const plansSection = document.getElementById('plans');
        if (plansSection) {
            plansSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleUpdatePaymentMethod = () => {
        const paymentSection = document.getElementById('payment');
        if (paymentSection) {
            paymentSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleCancelSubscription = async () => {
        if (!window.confirm('Are you sure you want to cancel your subscription? Your projects will move to read-only access at the end of the current period.')) {
            return;
        }

        setLoading(true);
        try {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            const { data: { user } } = await supabase.auth.getUser();

            // Find org_id again (or ideally store it in state, but let's be safe)
            let { data: orgMember } = await supabase
                .from('org_members')
                .select('org_id')
                .eq('user_id', user?.id)
                .maybeSingle();

            const org_id = orgMember?.org_id;

            const res = await fetch('/api/v1/billing/cancel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ org_id, reason: 'User requested via UI' })
            });

            if (res.ok) {
                alert('Your subscription has been cancelled. It will remain active until the end of the billing period.');
                fetchBillingData();
            } else {
                const data = await res.json();
                throw new Error(data.detail || 'Cancellation failed');
            }
        } catch (err: any) {
            console.error('Cancellation error:', err);
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
        );
    }

    const currentPlan = subscription?.plan || 'starter';
    const status = subscription?.status || 'active';

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-32">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-white tracking-tight">Billing</h1>
                    <p className="text-zinc-400">Manage your subscription, payment methods, and billing history</p>
                </div>
                <button
                    onClick={() => {
                        setLoading(true);
                        fetchBillingData();
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 text-zinc-300 rounded-xl hover:bg-white/10 hover:text-white transition-all group"
                >
                    <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    <span>Sync Status</span>
                </button>
            </header>

            {/* Warning Banner (Past Due) */}
            {status === 'past_due' && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 flex items-start space-x-4">
                    <AlertCircle className="w-6 h-6 text-yellow-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-yellow-300">Payment Failed</h3>
                        <p className="text-sm text-yellow-200/80 mt-1">
                            We couldn't process your last payment for the {currentPlan} plan. Please update your billing information to keep your features active.
                        </p>
                        <button className="mt-4 px-4 py-2 bg-yellow-500 text-black rounded-xl font-semibold hover:bg-yellow-400 transition-colors">
                            Update Billing
                        </button>
                    </div>
                </div>
            )}

            {/* Success Banner */}
            {typeof window !== 'undefined' && window.location.search.includes('payment=success') && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 flex items-start space-x-4 mb-8">
                    <Sparkles className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-emerald-300">Upgrade Successful!</h3>
                        <p className="text-sm text-emerald-200/80 mt-1">
                            Your account has been upgraded. You now have access to {currentPlan} features.
                        </p>
                    </div>
                </div>
            )}

            {/* Section 1: Subscription Overview */}
            <section className="glass-card rounded-[32px] border border-white/5 p-8 bg-gradient-to-br from-white/[0.02] to-transparent">
                <div className="flex items-center justify-between">
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-zinc-500 uppercase tracking-wider font-bold">Current Plan</p>
                            <h2 className="text-3xl font-bold text-white capitalize mt-1">{currentPlan}</h2>
                        </div>

                        <div className="flex items-center space-x-8">
                            <div>
                                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Status</p>
                                <div className="flex items-center space-x-2 mt-1">
                                    <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-emerald-400' :
                                        status === 'past_due' ? 'bg-yellow-400' :
                                            'bg-zinc-500'
                                        }`} />
                                    <span className={`text-sm font-semibold capitalize ${status === 'active' ? 'text-emerald-400' :
                                        status === 'past_due' ? 'text-yellow-400' :
                                            'text-zinc-400'
                                        }`}>
                                        {status === 'past_due' ? 'Past Due' : status}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Billing Cycle</p>
                                <p className="text-sm font-semibold text-white mt-1">Monthly</p>
                            </div>

                            {subscription?.current_period_end && (
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Renewal</p>
                                    <p className="text-sm font-semibold text-white mt-1">
                                        {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleManageBilling}
                            className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
                        >
                            Manage Billing
                        </button>
                        {currentPlan !== 'team' && currentPlan !== 'enterprise' && (
                            <button
                                onClick={() => handleUpgrade('team')}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                            >
                                Upgrade Plan
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Section 2: Plan Management */}
            <section id="plans" className="space-y-6 scroll-mt-24">
                <h2 className="text-2xl font-bold text-white">Available Plans</h2>

                <div className="glass-card rounded-[32px] border border-white/5 overflow-hidden bg-white/[0.01]">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left px-8 py-4 text-sm font-bold text-zinc-400 uppercase tracking-wider">Plan</th>
                                <th className="text-left px-8 py-4 text-sm font-bold text-zinc-400 uppercase tracking-wider">Price</th>
                                <th className="text-left px-8 py-4 text-sm font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                                <th className="text-right px-8 py-4 text-sm font-bold text-zinc-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(['free', 'starter', 'pro', 'team'] as const).map((plan) => {
                                const isCurrent = plan === currentPlan;
                                const price = PLAN_PRICES[plan];

                                const planLabels = {
                                    free: "Explorer (Free)",
                                    starter: "Builder (Starter)",
                                    pro: "Founder (Pro)",
                                    team: "Team"
                                };

                                return (
                                    <tr key={plan} className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${plan === 'pro' ? 'bg-indigo-500/5' : ''}`}>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-lg font-bold text-white tracking-tight">{planLabels[plan]}</span>
                                                {plan === 'pro' && (
                                                    <span className="bg-indigo-500 text-[10px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Recommended</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-base font-semibold text-zinc-300">
                                                {price.currency}{price.amount} / month
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            {isCurrent && (
                                                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                                                    <Check className="w-4 h-4 text-emerald-400" />
                                                    <span className="text-sm font-semibold text-emerald-400">Current</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            {!isCurrent && plan !== 'free' && (
                                                <button
                                                    onClick={() => handleUpgrade(plan)}
                                                    className={`px-4 py-2 rounded-xl font-semibold transition-all ${plan === 'pro'
                                                        ? 'bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-indigo-500/20'
                                                        : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                                                        }`}
                                                >
                                                    Upgrade Now
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className="px-8 py-4 bg-white/[0.02] border-t border-white/5">
                        <p className="text-xs text-zinc-500">
                            All plans include core Smartbuilder features. No hidden fees. Cancel anytime.
                        </p>
                    </div>
                </div>
            </section>

            {/* Section 3: Usage & Limits */}
            <section id="usage" className="space-y-6 scroll-mt-24">
                <h2 className="text-2xl font-bold text-white">Usage & Limits</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <UsageCard
                        icon={<Sparkles className="w-5 h-5" />}
                        label="Idea Generation"
                        current={0} // TODO: Fetch from usage service
                        limit={subscription?.features?.idea_clicks}
                        locked={false}
                    />
                    <UsageCard
                        icon={<Zap className="w-5 h-5" />}
                        label="Ideas per Click"
                        current={subscription?.features?.ideas_per_click || 5}
                        limit={subscription?.features?.ideas_per_click || 5}
                        locked={false}
                    />
                    <UsageCard
                        icon={<Lock className="w-5 h-5" />}
                        label="Freeze Builds"
                        current={0}
                        limit={-1}
                        locked={!subscription?.features?.freeze_build}
                    />
                    <UsageCard
                        icon={<TrendingUp className="w-5 h-5" />}
                        label="API Access"
                        current={0}
                        limit={-1}
                        locked={!subscription?.features?.api_access}
                    />
                </div>
            </section>

            {/* Section 4: Payment Method */}
            {paymentMethod && (
                <section id="payment" className="space-y-6 scroll-mt-24">
                    <h2 className="text-2xl font-bold text-white">Payment Method</h2>

                    <div className="glass-card rounded-[32px] border border-white/5 p-8 bg-white/[0.01]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
                                    <CreditCard className="w-8 h-8 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Card</p>
                                    <p className="text-lg font-bold text-white capitalize mt-1">
                                        {paymentMethod.card_brand} •••• {paymentMethod.last4}
                                    </p>
                                    <p className="text-sm text-zinc-400 mt-1">
                                        Expires {paymentMethod.exp_month}/{paymentMethod.exp_year}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleUpdatePaymentMethod}
                                className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
                            >
                                Update Payment Method
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* Section 5: Billing History */}
            <section id="history" className="space-y-6 scroll-mt-24">
                <h2 className="text-2xl font-bold text-white">Billing History</h2>

                <div className="glass-card rounded-[32px] border border-white/5 overflow-hidden bg-white/[0.01]">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left px-8 py-4 text-sm font-bold text-zinc-400 uppercase tracking-wider">Date</th>
                                <th className="text-left px-8 py-4 text-sm font-bold text-zinc-400 uppercase tracking-wider">Amount</th>
                                <th className="text-left px-8 py-4 text-sm font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                                <th className="text-right px-8 py-4 text-sm font-bold text-zinc-400 uppercase tracking-wider">Invoice</th>
                            </tr>
                        </thead>
                        <tbody>
                            {billingHistory.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-12 text-center text-zinc-500">
                                        No billing history available
                                    </td>
                                </tr>
                            ) : (
                                billingHistory.map((event) => (
                                    <tr key={event.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-5">
                                            <span className="text-base text-white">
                                                {new Date(event.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-base font-semibold text-white">
                                                {event.currency}{(event.amount / 100).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <StatusBadge status={event.status} />
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm flex items-center space-x-1 ml-auto">
                                                <Download className="w-4 h-4" />
                                                <span>Download</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Section 6: Cancellation */}
            <section className="space-y-6">
                <div className="glass-card rounded-[32px] border border-red-500/20 p-8 bg-red-500/5">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-white">Cancel Subscription</h3>
                            <p className="text-sm text-zinc-400 max-w-2xl">
                                Your projects will remain accessible in read-only mode. You can reactivate anytime without losing your data.
                            </p>
                        </div>
                        <button
                            onClick={handleCancelSubscription}
                            disabled={loading || status !== 'active'}
                            className="px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-semibold hover:bg-red-500/20 transition-all whitespace-nowrap disabled:opacity-30"
                        >
                            Cancel Subscription
                        </button>
                    </div>
                </div>
            </section>

            {/* Upgrade Modal */}
            {showUpgradeModal && (
                <UpgradeModal
                    plan={selectedPlan}
                    onClose={() => setShowUpgradeModal(false)}
                />
            )}
        </div>
    );
}

// Usage Card Component
function UsageCard({ icon, label, current, limit, locked }: {
    icon: React.ReactNode;
    label: string;
    current: number;
    limit: number;
    locked: boolean;
}) {
    const isUnlimited = limit === -1;
    const percentage = isUnlimited ? 0 : (current / limit) * 100;

    return (
        <div className="glass-card rounded-2xl border border-white/5 p-6 bg-white/[0.01] space-y-4">
            <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    {icon}
                </div>
                {locked && <Lock className="w-4 h-4 text-zinc-600" />}
            </div>

            <div>
                <p className="text-sm font-bold text-zinc-400">{label}</p>
                <p className="text-2xl font-bold text-white mt-1">
                    {locked ? (
                        <span className="text-zinc-600">Locked</span>
                    ) : isUnlimited ? (
                        <span>{current} / Unlimited</span>
                    ) : (
                        <span>{current} / {limit}</span>
                    )}
                </p>
            </div>

            {!locked && !isUnlimited && (
                <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                </div>
            )}

            {locked && (
                <p className="text-xs text-zinc-600">
                    🔒 Available on Team plan
                </p>
            )}
        </div>
    );
}

// Status Badge
function StatusBadge({ status }: { status: string }) {
    const colors = {
        paid: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        failed: 'bg-red-500/10 border-red-500/30 text-red-400',
        pending: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
        cancelled: 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400'
    };

    return (
        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${colors[status as keyof typeof colors] || colors.pending}`}>
            <div className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="text-sm font-semibold capitalize">{status}</span>
        </div>
    );
}

