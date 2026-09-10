import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from './config';

/**
 * ⚠️ USAGE SERVEUR UNIQUEMENT — ne jamais importer depuis un composant client.
 *
 * Client `service_role`, qui contourne RLS.
 *
 * La clé est lue UNIQUEMENT dans `KAT_SUPABASE_SECRET_KEY`. On ignore
 * délibérément `SUPABASE_SERVICE_ROLE_KEY` : l'intégration Supabase↔Vercel en
 * est propriétaire et y écrit la clé du projet auquel elle est reliée, qui
 * n'est pas forcément celui de la boutique. Une clé valide mais appartenant à
 * un autre projet produit des 401 silencieux — pire qu'une clé absente, car
 * l'absence, elle, déclenche le repli sur le client public.
 *
 * Renvoie `null` si aucune clé n'est fournie : l'appelant retombe alors sur le
 * client public, qui suffit à créer une commande (les policies autorisent
 * l'insertion publique sur `orders` et `order_items`).
 */
export function createAdminClient(): SupabaseClient | null {
  const serviceRoleKey = process.env.KAT_SUPABASE_SECRET_KEY || '';

  if (!isSupabaseConfigured || !serviceRoleKey) return null;

  return createSupabaseClient(SUPABASE_URL, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Client public côté serveur, sans session utilisateur.
 *
 * Utilisé pour la prise de commande d'un visiteur non authentifié quand aucune
 * clé secrète n'est configurée. Il est soumis à RLS : il peut insérer une
 * commande, mais ne peut ni la relire ni toucher au fichier client.
 */
export function createPublicServerClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;

  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
