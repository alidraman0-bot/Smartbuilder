import { create } from 'zustand';
import { getAuthHeaders } from '@/utils/supabase/auth';

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
            const response = await fetch('/api/v1/preferences/', {
                headers
            });
            if (!response.ok) throw new Error('Failed to fetch preferences');
            const data = await response.json();
            set({ preferences: data, loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    updatePreference: async (key: string, value: any) => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`/api/v1/preferences/${key}?value=${JSON.stringify(value)}`, {
                method: 'POST',
                headers
            });
            if (!response.ok) throw new Error('Failed to update preference');
            const data = await response.json();
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
            const response = await fetch('/api/v1/preferences/update', {
                method: 'POST',
                headers,
                body: JSON.stringify({ preferences: updates }),
            });
            if (!response.ok) throw new Error('Failed to update preferences');

            set((state) => ({
                preferences: { ...state.preferences, ...updates },
                loading: false,
            }));
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },
}));
