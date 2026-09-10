'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { getCurrentProfile } from '@/lib/queries/merchant';
import type { Category } from '@/lib/supabase/types';

export type CategoryResult =
  | { ok: true; category: Category }
  | { ok: false; error: string };

export type SimpleResult = { ok: true } | { ok: false; error: string };

const DEMO_ERROR =
  "Mode démonstration : aucun projet Supabase n'est branché, la modification n'est pas enregistrée.";

export async function createCategory(
  nom: string,
  ordre: number
): Promise<CategoryResult> {
  if (!isSupabaseConfigured) return { ok: false, error: DEMO_ERROR };

  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: 'Session expirée. Reconnectez-vous.' };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .insert({ store_id: profile.id, nom: nom.trim(), ordre })
    .select('*')
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message || 'Création impossible' };
  }

  revalidatePath('/categories');
  return { ok: true, category: data as Category };
}

export async function deleteCategory(categoryId: string): Promise<SimpleResult> {
  if (!isSupabaseConfigured) return { ok: false, error: DEMO_ERROR };

  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: 'Session expirée. Reconnectez-vous.' };

  const supabase = await createClient();
  // Les produits rattachés ne sont pas supprimés : la FK est ON DELETE SET NULL,
  // ils basculent simplement en « sans catégorie ».
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)
    .eq('store_id', profile.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath('/categories');
  revalidatePath('/produits');
  return { ok: true };
}
