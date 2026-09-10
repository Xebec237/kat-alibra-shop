'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { getCurrentProfile } from '@/lib/queries/merchant';
import type { OrderStatus } from '@/lib/supabase/types';

export type SimpleResult = { ok: true } | { ok: false; error: string };

const DEMO_ERROR =
  "Mode démonstration : aucun projet Supabase n'est branché, la modification n'est pas enregistrée.";

export async function updateOrderStatus(
  orderId: string,
  statut: OrderStatus
): Promise<SimpleResult> {
  if (!isSupabaseConfigured) return { ok: false, error: DEMO_ERROR };

  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: 'Session expirée. Reconnectez-vous.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('orders')
    .update({ statut })
    .eq('id', orderId)
    .eq('store_id', profile.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath('/commandes');
  revalidatePath('/dashboard');
  return { ok: true };
}
