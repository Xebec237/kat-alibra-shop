import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, isSupabaseConfigured } from './config';

/**
 * ⚠️ USAGE SERVEUR UNIQUEMENT — ne jamais importer depuis un composant client.
 *
 * Utilise la clé service_role, qui contourne RLS. Nécessaire pour la création
 * de commande depuis la vitrine publique : le visiteur n'est pas authentifié et
 * `orders` n'expose volontairement aucune policy SELECT publique (sinon
 * n'importe qui pourrait lire les coordonnées de tous les clients).
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!isSupabaseConfigured || !serviceRoleKey) {
    throw new Error(
      'Supabase admin non configuré : renseignez SUPABASE_SERVICE_ROLE_KEY dans .env.local'
    );
  }

  return createSupabaseClient(SUPABASE_URL, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
