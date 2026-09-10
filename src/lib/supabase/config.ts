/**
 * Configuration Supabase de ce déploiement.
 *
 * POURQUOI ON N'UTILISE PAS `NEXT_PUBLIC_SUPABASE_URL` :
 * l'intégration Supabase↔Vercel est propriétaire des variables portant les noms
 * standard et les réécrit à chaque synchronisation. Sur ce projet elle pointait
 * vers une autre base que celle contenant la boutique, et toute correction
 * manuelle dans Vercel était écrasée à la synchronisation suivante.
 *
 * On lit donc des variables préfixées `KAT_`, que l'intégration ne connaît pas
 * et ne peut donc pas écraser, avec repli sur les valeurs publiques du projet
 * KAT2.0. L'URL et la clé publiable sont publiques par conception — la clé
 * publiable est de toute façon livrée dans le bundle du navigateur, et ce sont
 * les policies RLS qui protègent les données, pas son secret.
 */

/** Projet KAT2.0 — la base qui contient la boutique et son catalogue. */
const DEFAULT_URL = 'https://qugbywnysxwwefmynnxu.supabase.co';
const DEFAULT_ANON_KEY = 'sb_publishable_klXg_0jquhABGaB0ICJCjA_jvpzspTY';

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_KAT_SUPABASE_URL || DEFAULT_URL;

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_KAT_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

// Valeurs de remplissage présentes dans .env.example tant qu'aucun projet réel
// n'a été créé.
const PLACEHOLDERS = ['demo-kat', 'votre-projet', 'votre-cle', 'demo-anon-key', '.demo-'];

function isPlaceholder(value: string) {
  const lower = value.toLowerCase();
  return PLACEHOLDERS.some((token) => lower.includes(token));
}

/**
 * Indique si de vrais identifiants Supabase sont configurés.
 *
 * Sans cette vérification, chaque requête part vers un hôte inexistant et
 * bloque le rendu le temps du timeout DNS : la page semble ne jamais s'ouvrir.
 * On sert alors mockData sans appel réseau.
 */
export const isSupabaseConfigured =
  SUPABASE_URL.startsWith('https://') &&
  SUPABASE_URL.endsWith('.supabase.co') &&
  SUPABASE_ANON_KEY.length > 0 &&
  !isPlaceholder(SUPABASE_URL) &&
  !isPlaceholder(SUPABASE_ANON_KEY);
