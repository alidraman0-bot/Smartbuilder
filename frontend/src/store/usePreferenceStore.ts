import { create } from 'zustand';
import { getAuthHeaders } from '@/utils/supabase/auth';
import { apiFetch } from '@/lib/apiClient';

interface PreferenceState {
    preferences: Record<string, any>;
    loading: boolean;
    error: string | null;
    fetchPreferences: () => Promise<void>;
    updatePreference: (key: string, value: any) => Promise<void>;
    updatePreferences: (updates: Record<string, any>) => Promise<void>;
}

export const usePreferenceStore = create<PreferenceState>((set, get) => ({
    preferences: {},
    loading: false,
    error: null,

    fetchPreferences: async () => {
        set({ loading: true, error: null });
        try {
            const headers = await getAuthHeaders();
            const data = await apiFetch<any>('/api/v1/preferences/', {
                headers
            });
            set({ preferences: data, loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    updatePreference: async (key: string, value: any) => {
        try {
            const headers = await getAuthHeaders();
            const data = await apiFetch<any>(`/api/v1/preferences/${key}?value=${JSON.stringify(value)}`, {
                method: 'POST',
                headers
            });
            set((state) => ({
                preferences: { ...state.preferences, [key]: data.value },
            }));
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    updatePreferences: async (updates: Record<string, any>) => {
        set({ loading: true });
        try {
            const headers = await getAuthHeaders();
            await apiFetch('/api/v1/preferences/update', {
                method: 'POST',
                headers,
                body: JSON.stringify({ preferences: updates }),
            });

            set((state) => ({
                preferences: { ...state.preferences, ...updates },
                loading: false,
            }));
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },
}));
