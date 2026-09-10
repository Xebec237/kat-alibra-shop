'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { getCurrentProfile } from '@/lib/queries/merchant';

export type SimpleResult = { ok: true } | { ok: false; error: string };

const DEMO_ERROR =
  "Mode démonstration : aucun projet Supabase n'est branché, la modification n'est pas enregistrée.";

export interface ProfileUpdateInput {
  nom_boutique: string;
  slug: string;
  whatsapp_number: string;
  description?: string | null;
  ville?: string | null;
  adresse?: string | null;
  devise: string;
}

export async function updateProfile(
  input: ProfileUpdateInput
): Promise<SimpleResult> {
  if (!isSupabaseConfigured) return { ok: false, error: DEMO_ERROR };

  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: 'Session expirée. Reconnectez-vous.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      nom_boutique: input.nom_boutique.trim(),
      slug: input.slug.trim(),
      whatsapp_number: input.whatsapp_number,
      description: input.description?.trim() || null,
      ville: input.ville?.trim() || null,
      adresse: input.adresse?.trim() || null,
      devise: input.devise,
    })
    .eq('id', profile.id);

  if (error) {
    // `slug` porte une contrainte UNIQUE : c'est l'adresse publique de la
    // vitrine, deux boutiques ne peuvent pas la partager.
    if (error.code === '23505') {
      return {
        ok: false,
        error: 'Cette adresse de boutique est déjà prise. Choisissez-en une autre.',
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath('/parametres/boutique');
  revalidatePath('/dashboard');
  revalidatePath(`/c/${input.slug.trim()}`);
  return { ok: true };
}
