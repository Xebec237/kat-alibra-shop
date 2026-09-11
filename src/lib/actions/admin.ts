'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export type AdminResult = { ok: true } | { ok: false; error: string };

/**
 * Confie ou retire le rôle d'administrateur.
 *
 * Aucune vérification n'est faite ici : la fonction Postgres appelée contrôle
 * elle-même que l'appelant est administrateur, qu'il ne modifie pas son propre
 * rôle, et qu'il ne retire pas le dernier administrateur. Dupliquer ces règles
 * dans l'application les ferait diverger tôt ou tard.
 */
export async function definirRoleAdmin(
  profileId: string,
  estAdmin: boolean
): Promise<AdminResult> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: 'Supabase non configuré.' };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc('admin_definir_role', {
      p_profile_id: profileId,
      p_admin: estAdmin,
    });

    if (error) return { ok: false, error: error.message };

    revalidatePath('/admin');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur inconnue' };
  }
}
