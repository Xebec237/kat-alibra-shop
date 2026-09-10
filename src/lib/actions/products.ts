'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { getCurrentProfile } from '@/lib/queries/merchant';

export type ActionResult = { ok: true } | { ok: false; error: string };

const DEMO_ERROR =
  "Mode démonstration : aucun projet Supabase n'est branché, la modification n'est pas enregistrée.";

/**
 * Écritures sur les produits du marchand connecté.
 *
 * On revérifie systématiquement le `store_id` à partir de la session plutôt que
 * de faire confiance à un identifiant venu du client : RLS bloquerait de toute
 * façon, mais un refus explicite donne un message clair au lieu d'un échec muet.
 */
async function requireStoreId() {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error('Session expirée. Reconnectez-vous.');
  return profile.id;
}

export async function toggleProductActive(
  productId: string,
  actif: boolean
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: false, error: DEMO_ERROR };

  try {
    const storeId = await requireStoreId();
    const supabase = await createClient();

    const { error } = await supabase
      .from('products')
      .update({ actif })
      .eq('id', productId)
      .eq('store_id', storeId);

    if (error) return { ok: false, error: error.message };

    revalidatePath('/produits');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur inconnue' };
  }
}

export async function toggleProductStock(
  productId: string,
  enStock: boolean
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: false, error: DEMO_ERROR };

  try {
    const storeId = await requireStoreId();
    const supabase = await createClient();

    const { error } = await supabase
      .from('products')
      .update({ en_stock: enStock })
      .eq('id', productId)
      .eq('store_id', storeId);

    if (error) return { ok: false, error: error.message };

    revalidatePath('/produits');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur inconnue' };
  }
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: false, error: DEMO_ERROR };

  try {
    const storeId = await requireStoreId();
    const supabase = await createClient();

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('store_id', storeId);

    if (error) return { ok: false, error: error.message };

    revalidatePath('/produits');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur inconnue' };
  }
}

export interface NewProductInput {
  nom: string;
  description?: string | null;
  prix: number;
  prix_promo?: number | null;
  category_id?: string | null;
  stock: number;
  images: string[];
  sizes?: string[];
}

export async function updateProduct(
  productId: string,
  input: NewProductInput
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: false, error: DEMO_ERROR };

  try {
    const storeId = await requireStoreId();
    const supabase = await createClient();

    const { error } = await supabase
      .from('products')
      .update({
        nom: input.nom,
        description: input.description || null,
        prix: input.prix,
        prix_promo:
          input.prix_promo && input.prix_promo > 0 && input.prix_promo < input.prix
            ? input.prix_promo
            : null,
        category_id: input.category_id || null,
        stock: input.stock,
        en_stock: input.stock > 0,
        images: input.images,
        sizes: input.sizes || [],
      })
      .eq('id', productId)
      .eq('store_id', storeId);

    if (error) return { ok: false, error: error.message };

    revalidatePath('/produits');
    revalidatePath(`/produits/${productId}/modifier`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur inconnue' };
  }
}

export async function createProduct(
  input: NewProductInput
): Promise<ActionResult & { id?: string }> {
  if (!isSupabaseConfigured) return { ok: false, error: DEMO_ERROR };

  try {
    const storeId = await requireStoreId();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('products')
      .insert({
        store_id: storeId,
        nom: input.nom,
        description: input.description || null,
        prix: input.prix,
        // La contrainte SQL exige prix_promo < prix : on ignore une promo invalide
        // plutôt que de laisser l'insertion échouer sur une erreur cryptique.
        prix_promo:
          input.prix_promo && input.prix_promo > 0 && input.prix_promo < input.prix
            ? input.prix_promo
            : null,
        category_id: input.category_id || null,
        stock: input.stock,
        en_stock: input.stock > 0,
        images: input.images,
        sizes: input.sizes || [],
      })
      .select('id')
      .single();

    if (error) return { ok: false, error: error.message };

    revalidatePath('/produits');
    return { ok: true, id: data?.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur inconnue' };
  }
}
