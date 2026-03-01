/**
 * MVP Builder Store
 * 
 * Manages the complete state of the MVP Builder including:
 * - 7 UI states (S0-S6)
 * - Build sessions and iterations
 * - Execution timeline and logs
 * - Auto-fix state
 * - Preview management
 */

import { create } from 'zustand';
import { getAuthHeaders } from '@/utils/supabase/auth';

export type BuilderState = 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6';
export type BuildMode = 'UI' | 'Logic' | 'Data';
export type PreviewStatus = 'loading' | 'ready' | 'error' | 'paused';

export interface TimelineEvent {
    timestamp: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
}

export interface FileNode {
    path: string;
    content: string;
    type: string;
}

export interface ErrorInfo {
    message: string;
    category: string;
    file: string | null;
}

interface MvpBuilderState {
    // Current state
    uiState: BuilderState;
    sessionId: string | null;

    // Build data
    buildMode: BuildMode;
    projectName: string;
    buildVersion: number;
    prdSnapshot: any | null;
    researchSnapshot: any | null;

    // Execution tracking
    executionTimeline: TimelineEvent[];
    currentFiles: FileNode[];
    buildLogs: any[];

    // Auto-fix state
    autoFixAttempts: number;
    maxAutoFixAttempts: number;
    lastError: ErrorInfo | null;
    canRevert: boolean;

    // Preview
    previewUrl: string | null;
    previewStatus: PreviewStatus;

    // Loading states
    isLoading: boolean;

    // Actions
    createSession: (runId: string, prd: any, research?: any, idea?: string) => Promise<void>;
    fetchSessionState: (sessionId: string) => Promise<void>;
    submitIdea: (idea: string, runId?: string) => Promise<void>;
    iterate: (prompt: string, buildMode?: BuildMode) => Promise<void>;
    freeze: () => Promise<void>;
    revert: () => Promise<void>;
    setBuildMode: (mode: BuildMode) => void;
    reset: () => void;
    startStatePolling: () => void;
}

const initialState = {
    uiState: 'S0' as BuilderState,
    sessionId: null,
    buildMode: 'UI' as BuildMode,
    projectName: '',
    buildVersion: 1,
    prdSnapshot: null,
    researchSnapshot: null,
    executionTimeline: [],
    currentFiles: [],
    buildLogs: [],
    autoFixAttempts: 0,
    maxAutoFixAttempts: 3,
    lastError: null,
    canRevert: false,
    previewUrl: null,
    previewStatus: 'loading' as PreviewStatus,
    isLoading: false,
};

export const useMvpBuilderStore = create<MvpBuilderState>((set, get) => ({
    ...initialState,

    createSession: async (runId: string, prd: any, research?: any, idea?: string) => {
        set({ isLoading: true });

        try {
            const headers = await getAuthHeaders();
            const response = await fetch('/api/v1/mvp-builder/init', {
                method: 'POST',
                headers,
                body: JSON.stringify({ run_id: runId, prd, research, idea })
            });

            if (!response.ok) {
                throw new Error('Failed to create session');
            }

            const data = await response.json();

            set({
                sessionId: data.session_id,
                uiState: data.state as BuilderState,
                prdSnapshot: prd || { title: 'New Project', summary: idea },
                researchSnapshot: research || null,
                projectName: prd?.title || 'New Project',
                isLoading: false
            });

            // If we started with an idea, we might have transitioned straight to S2
            if (data.state !== 'S0' && data.state !== 'S1') {
                get().startStatePolling();
            }

        } catch (error) {
            console.error('Error creating session:', error);
            set({ isLoading: false });
            throw error;
        }
    },

    fetchSessionState: async (sessionId: string) => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(
                `/api/v1/mvp-builder/${sessionId}/state`,
                { headers }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch session state');
            }

            const data = await response.json();

            set({
                sessionId: data.session_id,
                uiState: data.state as BuilderState,
                projectName: data.project_name,
                buildMode: data.build_mode as BuildMode,
                buildVersion: data.build_version,
                prdSnapshot: data.prd_snapshot,
                researchSnapshot: data.research_snapshot,
                executionTimeline: data.timeline || [],
                currentFiles: data.files || [],
                previewUrl: data.preview_url,
                previewStatus: data.preview_status as PreviewStatus,
                autoFixAttempts: data.auto_fix_attempts || 0,
                lastError: data.last_error,
                canRevert: data.can_revert || false
            });
        } catch (error) {
            console.error('Error fetching session state:', error);
            throw error;
        }
    },

    submitIdea: async (idea: string, runId?: string) => {
        const { sessionId, createSession } = get();

        // If no session but runId provided (Start from S1), create session with idea
        if (!sessionId && runId) {
            return createSession(runId, null, null, idea);
        }

        if (!sessionId) throw new Error('No active session');

        set({ isLoading: true });

        try {
            const headers = await getAuthHeaders();
            const response = await fetch(
                `/api/v1/mvp-builder/${sessionId}/submit-idea`,
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ idea })
                }
            );

            if (!response.ok) {
                throw new Error('Failed to submit idea');
            }

            const data = await response.json();
            set({ uiState: data.state as BuilderState, isLoading: false });

            // Start polling for state updates
            get().startStatePolling();
        } catch (error) {
            console.error('Error submitting idea:', error);
            set({ isLoading: false });
            throw error;
        }
    },

    iterate: async (prompt: string, buildMode?: BuildMode) => {
        const { sessionId } = get();
        if (!sessionId) throw new Error('No active session');

        set({ isLoading: true });

        try {
            const headers = await getAuthHeaders();
            const response = await fetch(
                `/api/v1/mvp-builder/${sessionId}/iterate`,
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        prompt,
                        build_mode: buildMode || get().buildMode
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Failed to iterate');
            }

            const data = await response.json();
            set({
                uiState: data.state as BuilderState,
                buildVersion: data.build_version,
                isLoading: false
            });

            // Refresh state
            await get().fetchSessionState(sessionId);
        } catch (error) {
            console.error('Error iterating:', error);
            set({ isLoading: false });
            throw error;
        }
    },

    freeze: async () => {
        const { sessionId } = get();
        if (!sessionId) throw new Error('No active session');

        set({ isLoading: true });

        try {
            const headers = await getAuthHeaders();
            const response = await fetch(
                `/api/v1/mvp-builder/${sessionId}/freeze`,
                {
                    method: 'POST',
                    headers
                }
            );

            if (!response.ok) {
                throw new Error('Failed to freeze build');
            }

            const data = await response.json();
            set({ uiState: data.state as BuilderState, isLoading: false });
        } catch (error) {
            console.error('Error freezing build:', error);
            set({ isLoading: false });
            throw error;
        }
    },

    revert: async () => {
        const { sessionId } = get();
        if (!sessionId) throw new Error('No active session');

        set({ isLoading: true });

        try {
            const headers = await getAuthHeaders();
            const response = await fetch(
                `/api/v1/mvp-builder/${sessionId}/revert`,
                {
                    method: 'POST',
                    headers
                }
            );

            if (!response.ok) {
                throw new Error('Failed to revert build');
            }

            const data = await response.json();
            set({
                uiState: data.state as BuilderState,
                buildVersion: data.build_version,
                autoFixAttempts: 0,
                lastError: null,
                isLoading: false
            });

            // Refresh state
            await get().fetchSessionState(sessionId);
        } catch (error) {
            console.error('Error reverting build:', error);
            set({ isLoading: false });
            throw error;
        }
    },

    setBuildMode: (mode: BuildMode) => {
        set({ buildMode: mode });
    },

    reset: () => {
        set(initialState);
    },

    // Helper: Start polling for state updates during build
    startStatePolling: () => {
        const { sessionId, uiState } = get();
        if (!sessionId) return;

        // Poll while in transitional states
        const shouldPoll = ['S2', 'S3', 'S5'].includes(uiState);

        if (shouldPoll) {
            const interval = setInterval(async () => {
                const currentState = get().uiState;
                // Stop polling when reaching stable or frozen state
                if (['S4', 'S6'].includes(currentState)) {
                    clearInterval(interval);
                    return;
                }

                try {
                    await get().fetchSessionState(sessionId);
                } catch (error) {
                    console.error('Polling error:', error);
                    clearInterval(interval);
                }
            }, 1000); // Poll every second

            // Cleanup after 5 minutes
            setTimeout(() => clearInterval(interval), 300000);
        }
    }
}));

