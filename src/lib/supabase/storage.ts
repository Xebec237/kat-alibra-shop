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

/* -------------------------------------------------------------------------- */
/* Photo de profil de la boutique                                             */
/* -------------------------------------------------------------------------- */

const LOGO_MAX_BYTES = 2 * 1024 * 1024;

/**
 * Envoie le logo de la boutique.
 *
 * Plus petit plafond que pour les articles : le logo est affiché en vignette de
 * 44 pixels dans l'en-tête de la vitrine, une image lourde ralentirait chaque
 * chargement de page sans rien apporter à l'écran.
 */
export async function uploadStoreLogo(
  file: File,
  storeId: string
): Promise<UploadResult> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { ok: false, error: 'Format accepté : JPG, PNG, WebP ou AVIF.' };
  }

  if (file.size > LOGO_MAX_BYTES) {
    return { ok: false, error: 'Image trop lourde (2 Mo maximum pour un logo).' };
  }

  const supabase = createClient();
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${storeId}/logo/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (error) return { ok: false, error: error.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);

  return { ok: true, url: publicUrl };
}

/* -------------------------------------------------------------------------- */
/* Média du lookbook                                                          */
/* -------------------------------------------------------------------------- */

const LOOKBOOK_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const LOOKBOOK_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

const LOOKBOOK_IMAGE_MAX = 5 * 1024 * 1024;
const LOOKBOOK_VIDEO_MAX = 15 * 1024 * 1024;
const LOOKBOOK_DUREE_MAX = 5;

export type LookbookUploadResult =
  | { ok: true; url: string; type: 'image' | 'video' }
  | { ok: false; error: string };

/**
 * Durée d'une vidéo, lue depuis ses métadonnées.
 *
 * Le navigateur ne télécharge que l'en-tête du fichier pour la connaître : on
 * peut donc refuser une vidéo trop longue avant de l'envoyer, plutôt que de
 * faire patienter le marchand sur un transfert qu'on rejettera ensuite.
 */
function dureeVideo(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';

    const terminer = (duree: number | null) => {
      URL.revokeObjectURL(url);
      resolve(duree);
    };

    video.onloadedmetadata = () =>
      terminer(Number.isFinite(video.duration) ? video.duration : null);
    video.onerror = () => terminer(null);
    video.src = url;
  });
}

/**
 * Envoie l'image ou la vidéo de couverture du lookbook.
 *
 * Les vidéos sont limitées à 5 secondes : le lookbook enchaîne les articles, une
 * séquence plus longue bloquerait le visiteur sur l'écran d'ouverture.
 */
export async function uploadLookbookMedia(
  file: File,
  storeId: string
): Promise<LookbookUploadResult> {
  const estImage = LOOKBOOK_IMAGE_TYPES.includes(file.type);
  const estVideo = LOOKBOOK_VIDEO_TYPES.includes(file.type);

  if (!estImage && !estVideo) {
    return {
      ok: false,
      error: 'Format accepté : image JPG, PNG, WebP — ou vidéo MP4, WebM, MOV.',
    };
  }

  if (estImage && file.size > LOOKBOOK_IMAGE_MAX) {
    return { ok: false, error: 'Image trop lourde (5 Mo maximum).' };
  }

  if (estVideo) {
    if (file.size > LOOKBOOK_VIDEO_MAX) {
      return { ok: false, error: 'Vidéo trop lourde (15 Mo maximum).' };
    }

    const duree = await dureeVideo(file);
    if (duree === null) {
      return { ok: false, error: 'Vidéo illisible. Essayez un fichier MP4.' };
    }
    // Marge d'un dixième : un export « 5 secondes » mesure souvent 5,04 s.
    if (duree > LOOKBOOK_DUREE_MAX + 0.1) {
      return {
        ok: false,
        error: `Vidéo de ${duree.toFixed(1)} s — 5 secondes maximum. Raccourcissez-la avant de l'envoyer.`,
      };
    }
  }

  const supabase = createClient();
  const extension = file.name.split('.').pop()?.toLowerCase() || (estVideo ? 'mp4' : 'jpg');
  const path = `${storeId}/lookbook/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (error) return { ok: false, error: error.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);

  return { ok: true, url: publicUrl, type: estVideo ? 'video' : 'image' };
}
