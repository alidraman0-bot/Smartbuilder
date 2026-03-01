import { create } from 'zustand';
import { getAuthHeaders } from '@/utils/supabase/auth';

interface Snapshot {
    active_users: {
        "24h": number;
        "7d": number;
        "30d": number;
    };
    active_mvps: number;
    success_rate: number;
    auto_fix_rate: number;
    deployment_rate: number;
    mrr: number;
    daily_ai_cost: number;
    trends: Record<string, string>;
}

interface InfraItem {
    name: string;
    status: 'healthy' | 'degraded' | 'critical';
    latency: string;
    error_rate: string;
    queue_depth: number;
}

interface AiEngine {
    engine: string;
    status: string;
    requests_per_min: number;
    error_rate: string;
    avg_execution: string;
    cost_per_exec: string;
    monthly_cost: string;
    strict_mode: boolean;
}

interface FailureIntel {
    category: string;
    count: number;
    impact: string;
    root_cause: string;
    fix_effectiveness: string;
}

interface RevenueRisk {
    revenue: {
        mrr: number;
        arpu: number;
        churn: string;
        expansion: string;
    };
    costs: {
        total_ai_cost: number;
        margin: string;
        cost_per_build: number;
        cost_per_freeze: number;
    };
    risks: Array<{
        id: string;
        title: string;
        severity: string;
        status: string;
        mitigation: string;
    }>;
}

interface VcsHealth {
    vcs: {
        ai_commits: number;
        rollback_freq: string;
        conflict_rate: string;
        stability_score: number;
    };
    github: {
        limit: number;
        remaining: number;
        reset: string;
        status: string;
    };
    lock_status: string;
}

interface FounderState {
    snapshot: Snapshot | null;
    infra: InfraItem[];
    aiEngine: AiEngine | null;
    failures: FailureIntel[];
    revenueRisk: RevenueRisk | null;
    vcsHealth: VcsHealth | null;
    systemStatus: string;
    emergencyMode: boolean;
    featureFlags: Record<string, boolean>;
    isLoading: boolean;
    investorMode: boolean;

    fetchSnapshot: () => Promise<void>;
    fetchInfra: () => Promise<void>;
    fetchAiEngine: () => Promise<void>;
    fetchFailures: () => Promise<void>;
    fetchRevenueRisk: () => Promise<void>;
    fetchStatus: () => Promise<void>;
    fetchVcsHealth: () => Promise<void>;
    updateFeatureFlag: (flag: string, value: boolean) => Promise<void>;
    triggerEmergency: (action: string) => Promise<void>;
    toggleInvestorMode: () => void;
    fetchAll: () => Promise<void>;
}


export const useFounderStore = create<FounderState>((set, get) => ({
    snapshot: null,
    infra: [],
    aiEngine: null,
    failures: [],
    revenueRisk: null,
    vcsHealth: null,
    systemStatus: 'operational',
    emergencyMode: false,
    featureFlags: {},
    isLoading: false,
    investorMode: false,

    fetchSnapshot: async () => {
        try {
            const headers = await getAuthHeaders();
            const res = await fetch('/api/v1/founder/snapshot', { headers });
            if (res.ok) set({ snapshot: await res.json() });
        } catch (error) {
            console.error('Failed to fetch snapshot:', error);
        }
    },

    fetchInfra: async () => {
        try {
            const headers = await getAuthHeaders();
            const res = await fetch('/api/v1/founder/infra', { headers });
            if (res.ok) set({ infra: await res.json() });
        } catch (error) {
            console.error('Failed to fetch infra:', error);
        }
    },

    fetchAiEngine: async () => {
        try {
            const headers = await getAuthHeaders();
            const res = await fetch('/api/v1/founder/ai-engine', { headers });
            if (res.ok) set({ aiEngine: await res.json() });
        } catch (error) {
            console.error('Failed to fetch AI engine:', error);
        }
    },

    fetchFailures: async () => {
        try {
            const headers = await getAuthHeaders();
            const res = await fetch('/api/v1/founder/failures', { headers });
            if (res.ok) set({ failures: await res.json() });
        } catch (error) {
            console.error('Failed to fetch failures:', error);
        }
    },

    fetchRevenueRisk: async () => {
        try {
            const headers = await getAuthHeaders();
            const res = await fetch('/api/v1/founder/revenue-risk', { headers });
            if (res.ok) set({ revenueRisk: await res.json() });
        } catch (error) {
            console.error('Failed to fetch revenue risk:', error);
        }
    },

    fetchStatus: async () => {
        try {
            const headers = await getAuthHeaders();
            const res = await fetch('/api/v1/founder/status', { headers });
            if (res.ok) {
                const data = await res.json();
                set({
                    systemStatus: data.system_status,
                    emergencyMode: data.emergency_mode,
                    featureFlags: data.featureFlags
                });
            }
        } catch (error) {
            console.error('Failed to fetch status:', error);
        }
    },

    fetchVcsHealth: async () => {
        try {
            const headers = await getAuthHeaders();
            const res = await fetch('/api/v1/founder/vcs-health', { headers });
            if (res.ok) set({ vcsHealth: await res.json() });
        } catch (error) {
            console.error('Failed to fetch VCS health:', error);
        }
    },

    updateFeatureFlag: async (flag, value) => {
        try {
            const headers = await getAuthHeaders();
            const res = await fetch('/api/v1/founder/feature-flag', {
                method: 'POST',
                headers,
                body: JSON.stringify({ flag, value })
            });
            if (res.ok) {
                const data = await res.json();
                set({ featureFlags: data.flags });
            }
        } catch (error) {
            console.error('Failed to update feature flag:', error);
        }
    },

    triggerEmergency: async (action) => {
        try {
            const headers = await getAuthHeaders();
            const res = await fetch('/api/v1/founder/emergency', {
                method: 'POST',
                headers,
                body: JSON.stringify({ action })
            });
            if (res.ok) {
                await get().fetchStatus();
            }
        } catch (error) {
            console.error('Failed to trigger emergency:', error);
        }
    },

    toggleInvestorMode: () => set((state) => ({ investorMode: !state.investorMode })),

    fetchAll: async () => {
        set({ isLoading: true });
        await Promise.all([
            get().fetchSnapshot(),
            get().fetchInfra(),
            get().fetchAiEngine(),
            get().fetchFailures(),
            get().fetchRevenueRisk(),
            get().fetchStatus(),
            get().fetchVcsHealth()
        ]);
        set({ isLoading: false });
    }
}));
