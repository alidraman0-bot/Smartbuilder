import { create } from 'zustand';
import { Resource, IntelligenceData } from '@/types/resources';
import { getAuthHeaders } from '@/utils/supabase/auth';
import { apiFetch } from '@/lib/apiClient';

interface ResourceState {
    resources: Resource[];
    intelligence: IntelligenceData | null;
    isLoading: boolean;
    error: string | null;

    // Filters
    selectedStage: string | null; // null = "All Projects" / Neutral

    // Actions
    fetchResources: (stage?: string) => Promise<void>;
    fetchIntelligence: () => Promise<void>;
    applyResource: (resourceId: string, projectId: string) => Promise<void>;
    setStage: (stage: string | null) => void;
}

const API_BASE_URL = '/api/v1/resources';

export const useResourceStore = create<ResourceState>((set, get) => ({
    resources: [],
    intelligence: null,
    isLoading: false,
    error: null,
    selectedStage: null,

    fetchResources: async (stage?: string) => {
        set({ isLoading: true, error: null });
        try {
            const headers = await getAuthHeaders();
            const query = stage ? `?stage=${stage}` : '';
            const data = await apiFetch<any>(`${API_BASE_URL}/${query}`, {
                headers
            });
            set({ resources: data });
        } catch (err: any) {
            set({ error: err.message });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchIntelligence: async () => {
        try {
            const headers = await getAuthHeaders();
            const data = await apiFetch<any>(`${API_BASE_URL}/intelligence`, {
                headers
            });
            set({ intelligence: data });
        } catch (err) {
            console.error("Failed to fetch intelligence", err);
        }
    },

    applyResource: async (resourceId: string, projectId: string) => {
        set({ isLoading: true });
        try {
            const headers = await getAuthHeaders();
            await apiFetch(`${API_BASE_URL}/${resourceId}/apply?project_id=${projectId}`, {
                method: 'POST',
                headers
            });

            // Could trigger a refresh or toast here
            console.log('Resource applied successfully');
        } catch (err: any) {
            set({ error: err.message });
        } finally {
            set({ isLoading: false });
        }
    },

    setStage: (stage) => {
        set({ selectedStage: stage });
        // Trigger re-fetch when stage changes
        get().fetchResources(stage || undefined);
    }
}));

