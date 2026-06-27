import { createClient } from '@/lib/supabase/browser';

let sessionPromise: Promise<any> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5000; // 5 seconds of promise caching

/**
 * Utility to get consistent authentication headers for backend API requests.
 * Implements persistent promise caching to prevent race conditions during session refresh.
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
    const supabase = createClient();
    const now = Date.now();

    // Prevent multiple simultaneous session checks/refreshes
    // and reuse the same promise if it was fetched very recently
    if (!sessionPromise || (now - lastFetchTime > CACHE_DURATION)) {
        sessionPromise = supabase.auth.getSession().then(result => {
            lastFetchTime = Date.now();
            return result;
        }).catch(err => {
            sessionPromise = null;
            throw err;
        });
    }

    try {
        const { data: { session } } = await sessionPromise;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        return headers;
    } catch (error) {
        console.error('Error fetching auth session:', error);
        return {
            'Content-Type': 'application/json',
        };
    }
}
