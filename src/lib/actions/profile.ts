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
  logo_url?: string | null;
  couleur_theme?: string;
  lookbook_media_url?: string | null;
  lookbook_media_type?: 'image' | 'video' | null;
}

export async function updateProfile(
  input: ProfileUpdateInput
): Promise<SimpleResult> {
  if (!isSupabaseConfigured) return { ok: false, error: DEMO_ERROR };

  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: 'Session expirée. Reconnectez-vous.' };

  const supabase = await createClient();

  const champsBase = {
    nom_boutique: input.nom_boutique.trim(),
    slug: input.slug.trim(),
    whatsapp_number: input.whatsapp_number,
    description: input.description?.trim() || null,
    ville: input.ville?.trim() || null,
    adresse: input.adresse?.trim() || null,
    devise: input.devise,
    logo_url: input.logo_url ?? null,
  };

  const champsApparence = {
    couleur_theme: input.couleur_theme || 'olive',
    // Les deux colonnes vont ensemble : une contrainte l'impose en base.
    lookbook_media_url: input.lookbook_media_url ?? null,
    lookbook_media_type: input.lookbook_media_url
      ? input.lookbook_media_type ?? 'image'
      : null,
  };

  let { error } = await supabase
    .from('profiles')
    .update({ ...champsBase, ...champsApparence })
    .eq('id', profile.id);

  // PGRST204 : colonne inconnue du cache de schéma. La migration 003 n'a pas
  // encore été appliquée — on enregistre au moins les champs existants plutôt
  // que de perdre toute la saisie du marchand.
  if (error && error.code === 'PGRST204') {
    const repli = await supabase
      .from('profiles')
      .update(champsBase)
      .eq('id', profile.id);

    if (!repli.error) {
      revalidatePath('/parametres/boutique');
      return {
        ok: false,
        error:
          "Vos informations sont enregistrées, mais l'apparence (couleur et visuel) n'a pas pu l'être : la migration 003 n'est pas encore appliquée sur la base.",
      };
    }
    error = repli.error;
  }

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
