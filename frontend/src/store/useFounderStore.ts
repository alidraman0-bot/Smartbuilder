import { create } from 'zustand';

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
        const res = await fetch('/api/v1/founder/snapshot');
        if (res.ok) set({ snapshot: await res.json() });
    },

    fetchInfra: async () => {
        const res = await fetch('/api/v1/founder/infra');
        if (res.ok) set({ infra: await res.json() });
    },

    fetchAiEngine: async () => {
        const res = await fetch('/api/v1/founder/ai-engine');
        if (res.ok) set({ aiEngine: await res.json() });
    },

    fetchFailures: async () => {
        const res = await fetch('/api/v1/founder/failures');
        if (res.ok) set({ failures: await res.json() });
    },

    fetchRevenueRisk: async () => {
        const res = await fetch('/api/v1/founder/revenue-risk');
        if (res.ok) set({ revenueRisk: await res.json() });
    },

    fetchStatus: async () => {
        const res = await fetch('/api/v1/founder/status');
        if (res.ok) {
            const data = await res.json();
            set({
                systemStatus: data.system_status,
                emergencyMode: data.emergency_mode,
                featureFlags: data.feature_flags
            });
        }
    },

    fetchVcsHealth: async () => {
        const res = await fetch('/api/v1/founder/vcs-health');
        if (res.ok) set({ vcsHealth: await res.json() });
    },

    updateFeatureFlag: async (flag, value) => {
        const res = await fetch('/api/v1/founder/feature-flag', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ flag, value })
        });
        if (res.ok) {
            const data = await res.json();
            set({ featureFlags: data.flags });
        }
    },

    triggerEmergency: async (action) => {
        const res = await fetch('/api/v1/founder/emergency', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
        });
        if (res.ok) {
            await get().fetchStatus();
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
