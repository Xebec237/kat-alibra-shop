import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { mockProfile } from '@/lib/mockData';
import type { Profile } from '@/lib/supabase/types';

/**
 * Profil de la boutique du marchand connecté (usage serveur).
 *
 * Renvoie `mockProfile` tant qu'aucun projet Supabase n'est branché, pour que
 * le dashboard de démonstration reste consultable. Renvoie `null` si Supabase
 * est configuré mais que personne n'est authentifié — le proxy a normalement
 * déjà redirigé vers /login dans ce cas.
 */
/**
 * Adresse de connexion du marchand.
 *
 * Elle vit dans `auth.users`, pas dans `profiles` : c'est l'identifiant de
 * connexion, distinct des informations de la boutique.
 */
export async function getCurrentEmail(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.email ?? null;
  } catch {
    return null;
  }
}

export async function getCurrentProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured) return mockProfile;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error || !data) return null;

  return data as Profile;
}
