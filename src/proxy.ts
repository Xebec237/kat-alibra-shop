import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from '@/lib/supabase/config';

// Convention Next.js 16 : `middleware.ts` a été renommé `proxy.ts`.
// Rafraîchit la session Supabase à chaque requête et ferme l'espace marchand.

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/produits',
  '/commandes',
  '/clients',
  '/categories',
  '/catalogues',
  '/parametres',
  '/bienvenue',
  '/admin',
];

export async function proxy(request: NextRequest) {
  // Mode démo (aucun projet Supabase branché) : on laisse tout passer, sinon
  // le dashboard de démonstration deviendrait inaccessible.
  if (!isSupabaseConfigured) return NextResponse.next();

  // Rattrapage du lien de connexion.
  //
  // Supabase ne redirige que vers les adresses inscrites dans « Redirect URLs ».
  // Quand le chemin exact n'y figure pas, il retombe sur le « Site URL », donc
  // sur la racine — et le code de connexion arrive là au lieu de /auth/callback.
  // On le réachemine plutôt que d'exiger une liste blanche parfaite, sans quoi
  // le marchand verrait la page d'accueil sans comprendre qu'il n'est pas
  // connecté.
  const code = request.nextUrl.searchParams.get('code');
  if (code && !request.nextUrl.pathname.startsWith('/auth/callback')) {
    const callback = new URL('/auth/callback', request.url);
    callback.searchParams.set('code', code);
    callback.searchParams.set(
      'next',
      request.nextUrl.searchParams.get('next') || '/bienvenue'
    );
    return NextResponse.redirect(callback);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // getUser() revalide le jeton auprès de Supabase — ne pas utiliser getSession(),
  // qui se contente de lire un cookie falsifiable.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Marchand déjà connecté : inutile de lui réafficher les écrans d'accès.
  if (user && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // Tout sauf les assets statiques, les images et la vitrine publique.
    '/((?!_next/static|_next/image|favicon.ico|c/|recherche|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
