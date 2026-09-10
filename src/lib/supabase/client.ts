import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from './config';

export function createClient() {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase non configuré : renseignez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local'
    );
  }

  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
