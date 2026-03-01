import { create } from 'zustand';
import { getAuthHeaders } from '@/utils/supabase/auth';

export interface MemoryEvent {
    id: string;
    project_id: string;
    type: string;
    title: string;
    description?: string;
    artifact_ref_type?: string;
    artifact_ref_id?: string;
    actor: 'user' | 'smartbuilder_ai';
    metadata: any;
    created_at: string;
}

interface MemoryState {
    timeline: MemoryEvent[];
    isLoading: boolean;
    error: string | null;

    fetchTimeline: (projectId: string) => Promise<void>;
    logManualEvent: (projectId: string, event: Partial<MemoryEvent>) => Promise<void>;
}

const API_BASE_URL = 'http://localhost:8000/api/v1/memory';

export const useMemoryStore = create<MemoryState>((set, get) => ({
    timeline: [],
    isLoading: false,
    error: null,

    fetchTimeline: async (projectId: string) => {
        set({ isLoading: true, error: null });
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/${projectId}/timeline`, {
                headers
            });
            if (!response.ok) throw new Error('Failed to fetch timeline');
            const data = await response.json();
            set({ timeline: data });
        } catch (err) {
            set({ error: (err as Error).message });
        } finally {
            set({ isLoading: false });
        }
    },

    logManualEvent: async (projectId: string, event: Partial<MemoryEvent>) => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/${projectId}/log`, {
                method: 'POST',
                headers,
                body: JSON.stringify(event)
            });
            if (!response.ok) throw new Error('Failed to log event');

            // Refresh timeline after logging
            await get().fetchTimeline(projectId);
        } catch (err) {
            console.error("Failed to log manual event", err);
        }
    }
}));

