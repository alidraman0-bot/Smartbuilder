import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/apiClient';

export interface Project {
    id: string;
    project_id: string;
    name: string;
    description: string;
    status: string;
    template: string;
    created_at: string;
    updated_at: string;
    progress: number;
    org_id: string;
}

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Using the full path defined in backend
            const data = await apiFetch<Project[]>('/api/v1/projects/list');
            setProjects(data);
        } catch (err: any) {
            console.error("Calling API: /api/v1/projects/list", err);
            setError(err.message || 'Failed to fetch projects');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    return { projects, isLoading, error, refetch: fetchProjects };
}
