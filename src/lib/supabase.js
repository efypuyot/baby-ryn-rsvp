import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ''
).trim();

export const APP_MODE = url && key ? 'live' : import.meta.env.DEV ? 'demo' : 'unconfigured';

/** Do not initialize with a service_role or secret key. */
export const supabase = APP_MODE === 'live'
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;
