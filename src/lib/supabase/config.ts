export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Valeurs de remplissage présentes dans .env.example / .env.local tant que le
// projet Supabase réel n'a pas été créé.
const PLACEHOLDERS = ['demo-kat', 'votre-projet', 'votre-cle', 'demo-anon-key', '.demo-'];

function isPlaceholder(value: string) {
  const lower = value.toLowerCase();
  return PLACEHOLDERS.some((token) => lower.includes(token));
}

/**
 * Indique si de vrais identifiants Supabase sont configurés.
 *
 * Sans cette vérification, chaque requête part vers un hôte inexistant
 * (ex. demo-kat.supabase.co) et bloque le rendu pendant ~7 s le temps du
 * timeout DNS : la page semble ne jamais s'ouvrir dans le navigateur.
 * En mode démo on saute donc les appels réseau et on sert mockData.
 */
export const isSupabaseConfigured =
  SUPABASE_URL.startsWith('https://') &&
  SUPABASE_URL.endsWith('.supabase.co') &&
  SUPABASE_ANON_KEY.length > 0 &&
  !isPlaceholder(SUPABASE_URL) &&
  !isPlaceholder(SUPABASE_ANON_KEY);
