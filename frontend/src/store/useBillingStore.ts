import { create } from 'zustand';
import { getAuthHeaders } from '@/utils/supabase/auth';

interface Subscription {
    plan: string;
    status: 'active' | 'past_due' | 'cancelled' | 'trialing' | 'free';
    current_period_end?: string;
    features: Record<string, any>;
}

interface BillingState {
    subscription: Subscription | null;
    loading: boolean;
    error: string | null;
    fetchSubscription: (orgId: string) => Promise<void>;
}

export const useBillingStore = create<BillingState>((set) => ({
    subscription: null,
    loading: false,
    error: null,

    fetchSubscription: async (orgId: string) => {
        set({ loading: true, error: null });
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`/api/v1/billing/subscription?org_id=${orgId}`, {
                headers
            });
            if (!response.ok) {
                set({
                    subscription: {
                        plan: 'free',
                        status: 'free',
                        features: {}
                    },
                    loading: false
                });
                return;
            }
            const data = await response.json();
            set({ subscription: data, loading: false });
        } catch (error: any) {
            console.error('Failed to fetch subscription:', error);
            set({
                subscription: {
                    plan: 'free',
                    status: 'free',
                    features: {}
                },
                loading: false
            });
        }
    },
}));

