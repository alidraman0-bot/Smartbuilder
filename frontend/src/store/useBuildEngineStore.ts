/**
 * Build Engine Store
 * 
 * Manages the state for the MVP Builder pipeline.
 * Interfaces with the multi-agent orchestrator instead of monolithic Base44.
 */

import { create } from 'zustand';
import { apiFetch } from '@/lib/apiClient';
import { getAuthHeaders } from '@/utils/supabase/auth';

// Types
interface TimelineEvent {
    timestamp: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
}

interface BuildEngineState {
    // Core state
    sessionId: string | null;
    runId: string | null;
    status: 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6'; // Empty to Frozen
    previewUrl: string | null;
    error: string | null;
    projectName: string | null;

    // Agent outputs
    plan: any | null;
    architectureSnapshot: any | null;
    files: Record<string, string>;

    // Timeline
    timeline: TimelineEvent[];

    // UI tracking
    isBuilding: boolean;

    // Actions
    startBuild: (runId: string, blueprint?: any) => Promise<void>;
    iterateBuild: (prompt: string) => Promise<void>;
    loadProject: (projectId: string) => Promise<void>;
    previewControl: (action: 'restart' | 'refresh') => Promise<void>;
    ingestLogs: (logs: string, errorType?: string) => Promise<void>;
    pollStatus: () => void;
    stopPolling: () => void;
    reset: () => void;
    // Derived state
    projectType: 'web' | 'mobile';
}



let pollInterval: ReturnType<typeof setInterval> | null = null;

const initialState = {
    sessionId: null as string | null,
    runId: null as string | null,
    status: 'S0' as BuildEngineState['status'],
    previewUrl: null as string | null,
    error: null as string | null,
    plan: null,
    architectureSnapshot: null,
    files: {},
    timeline: [],
    isBuilding: false,
    projectName: null,
    projectType: 'web' as 'web' | 'mobile',
};

export const useBuildEngineStore = create<BuildEngineState>((set, get) => ({
    ...initialState,

    startBuild: async (runId: string, blueprint?: any) => {
        set({ ...initialState, status: 'S1', runId, isBuilding: true });

        try {
            // Treat blueprint as 'idea' if it's just a string, or parse as dict
            const ideaContent = typeof blueprint === 'string' ? blueprint : JSON.stringify(blueprint);

            const headers = await getAuthHeaders();
            const data = await apiFetch<any>(`/api/v1/mvp-builder/init`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    run_id: runId,
                    idea: ideaContent
                }),
            });

            set({
                sessionId: data.session_id,
                status: data.state || 'S2',
            });

            // Start polling
            get().pollStatus();

        } catch (err) {
            set({ status: 'S5', error: 'Network error: Could not reach build server', isBuilding: false });
        }
    },

    iterateBuild: async (prompt: string) => {
        const { sessionId } = get();
        if (!sessionId) return;

        set({ isBuilding: true });

        try {
            const headers = await getAuthHeaders();
            await apiFetch(`/api/v1/mvp-builder/${sessionId}/iterate`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ prompt }),
            });

            get().pollStatus();

        } catch (err) {
            set({ status: 'S5', error: 'Network error during iteration', isBuilding: false });
        }
    },

    previewControl: async (action: 'restart' | 'refresh') => {
        const { sessionId, previewUrl } = get();
        if (!sessionId) return;

        if (action === 'refresh') {
            if (previewUrl) {
                // Force iframe refresh by appending timestamp
                const urlObj = new URL(previewUrl);
                urlObj.searchParams.set('t', Date.now().toString());
                set({ previewUrl: urlObj.toString() });
            }
            return;
        }

        if (action === 'restart') {
            set({ isBuilding: true });
            try {
                const headers = await getAuthHeaders();
                await apiFetch(`/api/v1/mvp-builder/${sessionId}/preview-control`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ action: 'restart' }),
                });

                // Restart successful, poll to get updated timeline
                get().pollStatus();
            } catch (err) {
                set({ error: 'Network error during restart', isBuilding: false });
            }
        }
    },

    loadProject: async (projectId: string) => {
        set({ ...initialState, status: 'S4', isBuilding: true });

        try {
            const headers = await getAuthHeaders();
            const data = await apiFetch<any>(`/api/v1/mvp-builder/load/${projectId}`, {
                method: 'POST',
                headers
            });

            set({
                sessionId: data.session_id,
                status: data.state || 'S4',
                runId: projectId
            });

            // Start polling to hydrate the rest of the UI
            get().pollStatus();

        } catch (err) {
            set({ status: 'S5', error: 'Network error: Could not load project', isBuilding: false });
        }
    },

    pollStatus: () => {
        // Clear existing poll
        if (pollInterval) clearInterval(pollInterval);

        const poll = async () => {
            const { sessionId, status } = get();
            if (!sessionId) return;

            // Stop polling tightly if Stable (S4) or Frozen (S6) and not actively waiting
            if ((status === 'S4' || status === 'S6') && !get().isBuilding) {
                if (pollInterval) clearInterval(pollInterval);
                return;
            }

            try {
                const headers = await getAuthHeaders();
                const data = await apiFetch<any>(`/api/v1/mvp-builder/${sessionId}/state`, { headers });

                const isCurrentlyBuilding = ['S2', 'S3', 'S5'].includes(data.state);
                const detectedProjectType: 'web' | 'mobile' =
                    (data.plan?.project_type === 'mobile' ||
                     data.prd_snapshot?.project_type === 'mobile')
                        ? 'mobile' : 'web';

                set({
                    status: data.state,
                    previewUrl: data.preview_url,
                    error: data.last_error?.message || null,
                    timeline: data.timeline || [],
                    plan: data.prd_snapshot || data.plan || null,
                    architectureSnapshot: data.architecture_snapshot,
                    files: (() => {
                        // files from API is List[{path, content}], convert to Record<string,string>
                        const raw = data.files || [];
                        if (Array.isArray(raw)) {
                            return Object.fromEntries(raw.map((f: any) => [f.path, f.content]));
                        }
                        return raw;
                    })(),
                    isBuilding: isCurrentlyBuilding,
                    projectName: data.project_name || null,
                    projectType: detectedProjectType,
                });

                // Stop polling when done
                if (['S4', 'S6'].includes(data.state)) {
                    if (pollInterval) clearInterval(pollInterval);
                    set({ isBuilding: false });
                }

            } catch (err: any) {
                console.error('pollStatus failed:', err);
            }
        };

        // Poll immediately, then every 2 seconds
        poll();
        pollInterval = setInterval(poll, 2000);
    },

    stopPolling: () => {
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
        }
    },

    ingestLogs: async (logs: string, errorType: string = 'runtime') => {
        const { sessionId } = get();
        if (!sessionId) return;
        try {
            const headers = await getAuthHeaders();
            await apiFetch(`/api/v1/mvp-builder/${sessionId}/ingest-logs`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ logs, error_type: errorType }),
            });
        } catch (err: any) {
            console.error('ingestLogs failed:', err);
        }
    },

    reset: () => {
        if (pollInterval) clearInterval(pollInterval);
        set(initialState);
    },
}));
