import { create } from 'zustand';
import { Resource, IntelligenceData } from '@/types/resources';

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
    applyResource: (resourceId: string) => Promise<void>;
    setStage: (stage: string | null) => void;
}

const API_BASE_URL = 'http://localhost:8000/api/v1/resources';

export const useResourceStore = create<ResourceState>((set, get) => ({
    resources: [],
    intelligence: null,
    isLoading: false,
    error: null,
    selectedStage: null,

    fetchResources: async (stage?: string) => {
        set({ isLoading: true, error: null });
        try {
            const query = stage ? `?stage=${stage}` : '';
            const response = await fetch(`${API_BASE_URL}/${query}`);
            if (!response.ok) throw new Error('Failed to fetch resources');
            const data = await response.json();
            set({ resources: data });
        } catch (err) {
            set({ error: (err as Error).message });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchIntelligence: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/intelligence`);
            if (!response.ok) throw new Error('Failed to fetch intelligence');
            const data = await response.json();
            set({ intelligence: data });
        } catch (err) {
            console.error("Failed to fetch intelligence", err);
        }
    },

    applyResource: async (resourceId: string) => {
        set({ isLoading: true });
        try {
            // In a real app we'd get the actual project ID
            const projectId = "proj-123";
            const response = await fetch(`${API_BASE_URL}/${resourceId}/apply?project_id=${projectId}`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error('Failed to apply resource');

            // Could trigger a refresh or toast here
            console.log('Resource applied successfully');
        } catch (err) {
            set({ error: (err as Error).message });
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
