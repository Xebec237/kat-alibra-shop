import { createClient } from './client';

export const PRODUCT_IMAGES_BUCKET = 'product-images';

/** Limites appliquées avant l'envoi, pour échouer vite et avec un message clair. */
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/**
 * Envoie une image produit dans le bucket public `product-images`.
 *
 * Le chemin est préfixé par l'identifiant de la boutique : les policies
 * Storage autorisent l'upload à tout marchand authentifié, ce préfixe garde
 * les fichiers rangés par boutique et évite les collisions de noms.
 */
export async function uploadProductImage(
  file: File,
  storeId: string
): Promise<UploadResult> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { ok: false, error: 'Format accepté : JPG, PNG, WebP ou AVIF.' };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return { ok: false, error: 'Image trop lourde (5 Mo maximum).' };
  }

  const supabase = createClient();

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${storeId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (error) return { ok: false, error: error.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);

  return { ok: true, url: publicUrl };
}
