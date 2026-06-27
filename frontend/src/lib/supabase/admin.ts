import { createClient } from '@supabase/supabase-js'

let adminClient: any = null;

export const supabaseAdmin = new Proxy({} as any, {
  get(target, prop) {
    if (!adminClient) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";
      adminClient = createClient(url, key);
    }
    const val = adminClient[prop];
    if (typeof val === 'function') {
      return val.bind(adminClient);
    }
    return val;
  }
});
