import { useState, useCallback } from 'react';
import { apiFetch } from '@/lib/apiClient';
import { Idea } from '@/types/idea';
import { getAuthHeaders } from '@/utils/supabase/auth';

export function useIdeas() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateIdeas = useCallback(async (
        mode: 'validate_idea' | 'feature_expansion',
        userInput: string,
        projectId: string | null
    ): Promise<Idea[]> => {
        setIsLoading(true);
        setError(null);
        try {
            const headers = await getAuthHeaders();
            const response = await apiFetch<any>('/api/v1/ideas/generate', {
                method: 'POST',
                headers,
                body: JSON.stringify({ mode, user_input: userInput, project_id: projectId })
            });
            // The fallback and specific error checks (429, 402) can be handled in the component
            return Array.isArray(response) ? response : (response?.ideas || []);
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const discoverIdeas = useCallback(async (projectId: string | null): Promise<Idea[]> => {
        setIsLoading(true);
        setError(null);
        try {
            const headers = await getAuthHeaders();
            const data = await apiFetch<any>('/api/v1/ideas/discovery', {
                method: 'POST',
                headers,
                body: JSON.stringify({ project_id: projectId })
            });
            
            const ideasArray: any[] = Array.isArray(data) ? data : (data?.ideas || []);
            const globalSignals: any[] = data?.signals || [];

            return ideasArray.map((item: any) => ({
                ...item,
                is_discovery_only: true,
                thesis: item.thesis || item.summary || item.description || item.problem || item.solution || '',
                opportunity_score: item.opportunity_score ?? item.validation_score ?? item.confidence_score ?? 80,
                confidence_score: item.confidence_score ?? item.validation_score ?? 80,
                market_size: item.market_size ?? item.target_market ?? 'Unknown',
                signals: item.signals_used || item.signals || globalSignals, // Fallback to global scan signals
                idea_id: item.idea_id || item.id || crypto.randomUUID(),
                id: item.id || item.idea_id || crypto.randomUUID(),
            }));
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const generateFromSignal = useCallback(async (
        source: string,
        title: string,
        description: string
    ): Promise<any> => {
        setIsLoading(true);
        setError(null);
        try {
            const headers = await getAuthHeaders();
            const data = await apiFetch<any>('/api/v1/generate-from-signal', {
                method: 'POST',
                headers,
                body: JSON.stringify({ source, title, description })
            });
            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchIdeaDetails = useCallback(async (idea: Idea): Promise<any> => {
        setIsLoading(true);
        setError(null);
        try {
            const headers = await getAuthHeaders();
            const result = await apiFetch<any>('/api/idea-details', {
                method: 'POST',
                headers,
                body: JSON.stringify({ idea, mode: 'deep' })
            });
            return result;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        generateIdeas,
        discoverIdeas,
        generateFromSignal,
        fetchIdeaDetails,
        isLoading,
        error,
        setError
    };
}
