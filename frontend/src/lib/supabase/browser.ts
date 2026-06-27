import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | undefined

export const createClient = () => {
    if (client) return client

    client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
                storageKey: 'sb-auth-token',
                flowType: 'pkce',
            },
            global: {
                fetch: (...args) => {
                    return fetch(...args).catch(err => {
                        console.error('Supabase fetch error:', err);
                        throw err;
                    });
                }
            }
        }
    )

    // Patch the auth lock to a no-op to prevent "Lock broken by another request" AbortErrors
    // We do this after initialization to avoid potential SSR serialization issues with functions.
    if (typeof window !== 'undefined' && (client as any).auth) {
        (client as any).auth.lock = (_name: any, _acquireTimeout: any, fn: any) => fn();
    }

    return client
}
