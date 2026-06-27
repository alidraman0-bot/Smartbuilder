import { create } from 'zustand';
import { getAuthHeaders } from '@/utils/supabase/auth';
import { apiFetch } from '@/lib/apiClient';

interface PipelineStage {
    id: string;
    label: string;
    status: 'pending' | 'active' | 'completed' | 'failed';
    confidence: number;
    duration: string;
}

interface LogEntry {
    time: string;
    module: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
}

interface SystemMetrics {
    gpu: number;
    memory: number;
    threads: string;
}

interface AdvisorData {
    analysis: string;
    suggestion: string;
}

interface DeploymentStage {
    id: string;
    label: string;
    status: 'pending' | 'active' | 'completed' | 'failed';
    timestamp: string | null;
    duration: string | null;
    error: string | null;
}

interface DeploymentLog {
    time: string;
    stage: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
}

interface RunState {
    runId: string;
    state: string; // Backend calls it 'state', mapping to 'stage' in UI
    health: string;
    confidence: number;
    elapsed: string;
    logs: LogEntry[];
    pipeline: PipelineStage[];
    system_metrics: SystemMetrics;
    advisor: AdvisorData;
    research?: unknown;
    business_plan?: unknown;
    prd?: unknown;

    // Deployment state
    deployment_id: string | null;
    deployment_status: string;
    deployment_url: string | null;
    deployment_version: string | null;
    deployment_stages: DeploymentStage[];
    deployment_logs: DeploymentLog[];
    deployment_errors: string[];
    deployment_history: unknown[];

    // Monitoring state
    monitoring_health: 'healthy' | 'degraded' | 'critical' | 'unknown';
    monitoring_metrics: {
        uptime: number;
        error_rate: number;
        response_time_ms: number;
        deployment_age: string;
        usage: {
            dau: number;
            requests: number;
        };
        alerts: string[];
        pulse_summary?: string;
        latency_narrative?: string;
        recommendations?: unknown[];
        remediation_actions?: unknown[];
        incidents?: unknown[];
    };
    monitoring_logs: unknown[];
    executive_summary: unknown;
    compliance_report: unknown;
    isAiCofounderOpen: boolean;

    setRunState: (data: Partial<RunState>) => void;
    startPolling: () => void;
    startDeployment: (buildId: string) => Promise<void>;
    pollDeploymentStatus: (deploymentId: string) => void;
    rollbackDeployment: (deploymentId: string, reason: string) => Promise<void>;
    startMonitoring: (deploymentId: string) => void;
    stopMonitoring: () => void;
    fetchExecutiveSummary: (deploymentId: string) => Promise<void>;
    fetchComplianceReport: () => Promise<void>;
    triggerMonitorAction: (deploymentId: string, action: string) => Promise<void>;
    toggleAiCofounder: (open?: boolean) => void;
}

export const useRunStore = create<RunState>((set) => ({
    runId: "CONNECTING...",
    state: "INIT",
    health: "UNKNOWN",
    confidence: 0,
    elapsed: "00:00:00",
    logs: [],
    pipeline: [],
    system_metrics: {
        gpu: 0,
        memory: 0,
        threads: "0/0"
    },
    advisor: {
        analysis: "Initializing observer...",
        suggestion: "Awaiting system bootstrap."
    },
    research: null,
    business_plan: null,
    prd: null,

    // Deployment initial state
    deployment_id: null,
    deployment_status: "IDLE",
    deployment_url: null,
    deployment_version: null,
    deployment_stages: [],
    deployment_logs: [],
    deployment_errors: [],
    deployment_history: [],

    // Monitoring initial state
    monitoring_health: 'unknown',
    monitoring_metrics: {
        uptime: 0,
        error_rate: 0,
        response_time_ms: 0,
        deployment_age: "0m",
        usage: {
            dau: 0,
            requests: 0
        },
        alerts: []
    },
    monitoring_logs: [],
    executive_summary: null,
    compliance_report: null,
    isAiCofounderOpen: false,

    setRunState: (data) => set((state) => ({ ...state, ...data })),

    startDeployment: async (buildId: string) => {
        try {
            const runId = useRunStore.getState().runId;
            const headers = await getAuthHeaders();
            const deployment = await apiFetch<any>('/api/v1/deploy/start', {
                method: 'POST',
                headers,
                body: JSON.stringify({ run_id: runId, build_id: buildId })
            });

            set((state) => ({
                ...state,
                deployment_id: deployment.deployment_id,
                deployment_status: deployment.status,
                deployment_version: deployment.version,
                deployment_stages: deployment.stages,
                deployment_logs: deployment.logs,
                deployment_errors: deployment.errors,
                deployment_url: deployment.url
            }));

            // Start polling deployment status
            useRunStore.getState().pollDeploymentStatus(deployment.deployment_id);
        } catch (err) {
            console.error('Failed to start deployment:', err);
            set((state) => ({
                ...state,
                deployment_status: "FAILED",
                deployment_errors: ['Failed to start deployment']
            }));
        }
    },

    pollDeploymentStatus: (deploymentId: string) => {
        const fetchStatus = async () => {
            try {
                const headers = await getAuthHeaders();
                const deployment = await apiFetch<any>(`/api/v1/deploy/${deploymentId}/status`, {
                    headers
                });
                set((state) => ({
                    ...state,
                    deployment_status: deployment.status,
                    deployment_stages: deployment.stages,
                    deployment_logs: deployment.logs,
                    deployment_errors: deployment.errors,
                    deployment_url: deployment.url
                }));

                // Stop polling if deployment is complete or failed
                if (deployment.status === 'LIVE' || deployment.status === 'FAILED' || deployment.status === 'ROLLED_BACK') {
                    return true; // Signal to stop polling
                }
            } catch (err) {
                console.error('Failed to fetch deployment status:', err);
            }
            return false;
        };

        fetchStatus();
        const interval = setInterval(async () => {
            const shouldStop = await fetchStatus();
            if (shouldStop) {
                clearInterval(interval);
            }
        }, 3000);

        return () => clearInterval(interval);
    },

    rollbackDeployment: async (deploymentId: string, reason: string) => {
        try {
            const headers = await getAuthHeaders();
            const result = await apiFetch<any>(`/api/v1/deploy/${deploymentId}/rollback`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ reason })
            });

            set((state) => ({
                ...state,
                deployment_status: "ROLLED_BACK",
                deployment_url: result.previous_url,
                deployment_version: result.previous_version
            }));
        } catch (err) {
            console.error('Failed to rollback deployment:', err);
        }
    },

    startPolling: () => {
        let lastPayload = "";
        const fetchData = async () => {
            try {
                const headers = await getAuthHeaders();
                const data = await apiFetch<any>('/api/v1/status', {
                    headers
                });

                const currentPayload = JSON.stringify(data);

                // Only update if data changed to save re-renders
                if (currentPayload !== lastPayload) {
                    set((state) => ({ ...state, ...data }));
                    lastPayload = currentPayload;
                }
            } catch (err) {
                console.error("Failed to fetch status:", err);
                set((state) => ({ ...state, health: "OFFLINE" }));
                lastPayload = "";
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 15000); // Relaxed to 15s to reduce load
        return () => clearInterval(interval);
    },

    startMonitoring: (deploymentId: string) => {
        const fetchMonitorData = async () => {
            try {
                const headers = await getAuthHeaders();
                const metrics = await apiFetch<any>(`/api/v1/monitor/${deploymentId}/status`, {
                    headers
                });
                const logs = await apiFetch<any>(`/api/v1/monitor/${deploymentId}/logs`, {
                    headers
                });

                set((state) => ({
                    ...state,
                    monitoring_health: metrics.health_status,
                    monitoring_metrics: metrics,
                    monitoring_logs: logs
                }));

                if (metrics.health_status === 'shutdown') {
                    return true;
                }
            } catch (err) {
                console.error('Failed to fetch monitoring data:', err);
            }
            return false;
        };

        fetchMonitorData();
        const interval = setInterval(async () => {
            const shouldStop = await fetchMonitorData();
            if (shouldStop) clearInterval(interval);
        }, 5000);
        return () => clearInterval(interval);
    },

    stopMonitoring: () => {
        // Placeholder for cleanup if needed, currently handled by effect cleanup
    },

    fetchExecutiveSummary: async (deploymentId: string) => {
        try {
            const headers = await getAuthHeaders();
            const summary = await apiFetch<any>(`/api/v1/monitor/${deploymentId}/executive`, {
                headers
            });
            set((state) => ({ ...state, executive_summary: summary }));
        } catch (err) {
            console.error('Failed to fetch executive summary:', err);
        }
    },

    fetchComplianceReport: async () => {
        try {
            const headers = await getAuthHeaders();
            const report = await apiFetch<any>(`/api/v1/compliance/readiness`, {
                headers
            });
            set((state) => ({ ...state, compliance_report: report }));
        } catch (err) {
            console.error('Failed to fetch compliance report:', err);
        }
    },

    triggerMonitorAction: async (deploymentId: string, action: string) => {
        try {
            const headers = await getAuthHeaders();
            await apiFetch(`/api/v1/monitor/${deploymentId}/action`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ action })
            });
            console.log(`Action ${action} triggered successfully`);
            if (action === 'shutdown') {
                set((state) => ({ ...state, monitoring_health: 'critical' }));
            }
        } catch (err) {
            console.error(`Failed to trigger monitor action ${action}:`, err);
        }
    },
    toggleAiCofounder: (open) => set((state) => ({
        isAiCofounderOpen: open !== undefined ? open : !state.isAiCofounderOpen
    }))
}));
