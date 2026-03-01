
import { create } from 'zustand';
import { getAuthHeaders } from '@/utils/supabase/auth';

export interface DashboardStats {
    active_projects: number;
    success_rate: string;
    ai_efficiency: string;
    avg_build_time: string;
}

export interface SmartAction {
    id: string;
    type: 'opportunity' | 'strategy' | 'maintenance';
    title: string;
    description: string;
    cta: string;
    link: string;
    impact: 'high' | 'medium' | 'low';
}

export interface ActivityLog {
    id: string;
    project_id: string;
    user_name: string;
    action: string;
    target: string;
    timestamp: string;
    details?: string;
}

interface DashboardState {
    stats: DashboardStats | null;
    smart_actions: SmartAction[];
    activity_feed: ActivityLog[];
    latest_deployments: any[];
    isLoading: boolean;
    error: string | null;

    fetchDashboardData: () => Promise<void>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const useDashboardStore = create<DashboardState>((set) => ({
    stats: null,
    smart_actions: [],
    activity_feed: [],
    latest_deployments: [],
    isLoading: false,
    error: null,

    fetchDashboardData: async () => {
        set({ isLoading: true, error: null });
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/api/v1/analytics/dashboard`, {
                headers
            });
            if (!response.ok) throw new Error('Failed to fetch dashboard data');

            const data = await response.json();
            set({
                stats: {
                    active_projects: data.active_projects,
                    success_rate: data.success_rate,
                    ai_efficiency: data.ai_efficiency,
                    avg_build_time: data.avg_build_time
                },
                smart_actions: data.smart_actions,
                activity_feed: data.recent_activity,
                latest_deployments: data.latest_deployments || [],
                isLoading: false
            });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    }
}));

