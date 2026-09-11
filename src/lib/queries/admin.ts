import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export interface BoutiqueAdmin {
  id: string;
  nom_boutique: string;
  slug: string;
  email: string | null;
  whatsapp_number: string;
  ville: string | null;
  logo_url: string | null;
  est_admin: boolean;
  inscrit_le: string;
  derniere_connexion: string | null;
  email_confirme: boolean;
  nb_articles: number;
  nb_commandes: number;
  total_ventes: number;
}

/**
 * Annuaire des marchands inscrits.
 *
 * Appelle une fonction SECURITY DEFINER qui vérifie elle-même que l'appelant est
 * administrateur : le contrôle vit dans la base, pas ici. Un utilisateur qui
 * forgerait la requête obtiendrait une erreur Postgres, pas les données.
 *
 * Renvoie `null` quand l'accès est refusé — l'appelant distingue ainsi
 * « pas administrateur » de « aucune boutique ».
 */
export async function getBoutiquesAdmin(): Promise<BoutiqueAdmin[] | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('admin_liste_boutiques');

    if (error) return null;
    return (data ?? []) as BoutiqueAdmin[];
  } catch {
    return null;
  }
}

/** Vrai si le marchand connecté porte le marqueur administrateur. */
export async function estAdmin(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from('profiles')
      .select('est_admin')
      .eq('user_id', user.id)
      .maybeSingle();

    return Boolean(data?.est_admin);
  } catch {
    return false;
  }
}
