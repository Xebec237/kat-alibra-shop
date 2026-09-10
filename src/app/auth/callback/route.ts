import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

/**
 * Point d'arrivée du lien reçu par email.
 *
 * Supabase renvoie ici avec un `code` à usage unique, qu'on échange contre une
 * session posée en cookie. C'est cet échange qui connecte réellement le
 * marchand : sans lui, le lien ne ferait que rouvrir la page de connexion.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const errorDescription = url.searchParams.get('error_description');

  // On ne suit qu'un chemin interne : une URL absolue permettrait de détourner
  // le marchand vers un site tiers juste après sa connexion.
  const requested = url.searchParams.get('next') || '/bienvenue';
  const next =
    requested.startsWith('/') && !requested.startsWith('//') ? requested : '/bienvenue';

  if (errorDescription) {
    return NextResponse.redirect(
      new URL(`/login?erreur=${encodeURIComponent(errorDescription)}`, url.origin)
    );
  }

  if (!code || !isSupabaseConfigured) {
    return NextResponse.redirect(new URL('/login?erreur=lien_invalide', url.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    // Lien déjà utilisé ou expiré : les liens de connexion sont à usage unique.
    return NextResponse.redirect(new URL('/login?erreur=lien_expire', url.origin));
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
