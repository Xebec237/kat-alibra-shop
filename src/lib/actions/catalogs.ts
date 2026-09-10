'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { getCurrentProfile } from '@/lib/queries/merchant';

export type SimpleResult = { ok: true } | { ok: false; error: string };

const DEMO_ERROR =
  "Mode démonstration : aucun projet Supabase n'est branché, la modification n'est pas enregistrée.";

export async function updateCatalog(
  catalogId: string,
  input: { titre: string; description?: string | null }
): Promise<SimpleResult> {
  if (!isSupabaseConfigured) return { ok: false, error: DEMO_ERROR };

  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: 'Session expirée. Reconnectez-vous.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('catalogs')
    .update({
      titre: input.titre.trim(),
      description: input.description?.trim() || null,
    })
    .eq('id', catalogId)
    .eq('store_id', profile.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath('/catalogues');
  revalidatePath(`/c/${profile.slug}`);
  return { ok: true };
}

/**
 * Incrémente le compteur de vues d'un catalogue.
 *
 * Passe par la clé service_role : le visiteur d'une vitrine n'est pas
 * authentifié et `catalogs` n'autorise l'écriture qu'au marchand propriétaire.
 */
export async function incrementCatalogViews(catalogId: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  try {
    const supabase = createAdminClient();

    const { data } = await supabase
      .from('catalogs')
      .select('vues')
      .eq('id', catalogId)
      .maybeSingle();

    if (!data) return;

    await supabase
      .from('catalogs')
      .update({ vues: (data.vues ?? 0) + 1 })
      .eq('id', catalogId);
  } catch {
    // Un compteur de vues ne doit jamais faire échouer l'affichage de la vitrine.
  }
}
