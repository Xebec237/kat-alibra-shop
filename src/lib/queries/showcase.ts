import { createPublicServerClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import type { Product } from '@/lib/supabase/types';

export interface Showcase {
  nomBoutique: string;
  slug: string;
  ville: string | null;
  produits: Product[];
}

/**
 * Une vraie boutique à mettre en avant sur la page d'accueil.
 *
 * Montrer un catalogue réel plutôt que des images de stock : le visiteur voit
 * exactement ce que ses propres clients verront. On ne retient que les articles
 * avec photo — la maquette du téléphone n'a rien à afficher sans elles.
 *
 * Lecture publique uniquement : `profiles` et `products` actifs sont ouverts à
 * tous, c'est ce qui fait vivre les vitrines.
 */
export async function getShowcase(): Promise<Showcase | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const supabase = createPublicServerClient();
    if (!supabase) return null;

    const { data: produits } = await supabase
      .from('products')
      .select('*')
      .eq('actif', true)
      .order('created_at', { ascending: false })
      .limit(24);

    const avecPhoto = (produits ?? []).filter(
      (p: Product) => Array.isArray(p.images) && p.images.length > 0
    );

    if (avecPhoto.length === 0) return null;

    // La boutique retenue est celle du produit le plus récent : la page
    // d'accueil suit ainsi l'activité réelle de la plateforme.
    const storeId = avecPhoto[0].store_id;

    const { data: profile } = await supabase
      .from('profiles')
      .select('nom_boutique, slug, ville')
      .eq('id', storeId)
      .maybeSingle();

    if (!profile) return null;

    return {
      nomBoutique: profile.nom_boutique,
      slug: profile.slug,
      ville: profile.ville,
      produits: avecPhoto.filter((p: Product) => p.store_id === storeId).slice(0, 4),
    };
  } catch {
    // La page d'accueil doit s'afficher même si la base est injoignable.
    return null;
  }
}
