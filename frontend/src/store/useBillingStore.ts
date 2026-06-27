import { create } from 'zustand';
import { getAuthHeaders } from '@/utils/supabase/auth';
import { createClient } from '@/lib/supabase/browser';

interface Subscription {
    plan: string;
    status: 'active' | 'past_due' | 'cancelled' | 'trialing' | 'free';
    current_period_end?: string;
    features: Record<string, any>;
}

interface BillingState {
    subscription: Subscription | null;
    orgId: string | null;
    loading: boolean;
    error: string | null;
    fetchSubscription: (orgId?: string) => Promise<void>;
}

export const useBillingStore = create<BillingState>((set, get) => ({
    subscription: { plan: 'pro', status: 'active', features: {} }, // Default to Pro
    orgId: null,
    loading: false,
    error: null,

    fetchSubscription: async (orgId?: string) => {
        // Payment system not configured for this environment - using default Pro plan
        console.info('[BillingStore] Using default subscription (Stripe/Paystack integration is offline)');
        return;
    },
}));

