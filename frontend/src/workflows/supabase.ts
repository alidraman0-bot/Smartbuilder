import { createClient } from '@supabase/supabase-js';

let supabaseClient: any = null;

export const supabase = new Proxy({} as any, {
  get(target, prop) {
    if (!supabaseClient) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
      supabaseClient = createClient(url, key);
    }
    const val = supabaseClient[prop];
    if (typeof val === 'function') {
      return val.bind(supabaseClient);
    }
    return val;
  }
});
