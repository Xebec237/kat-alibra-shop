'use client';

import { useEffect, useState } from 'react';
import { MarqueKat } from '@/components/brand/LogoKat';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';

/**
 * Rattrape les jetons de connexion livrés dans le fragment de l'URL.
 *
 * Selon la façon dont le lien a été émis, Supabase renvoie soit `?code=`, que
 * le serveur échange dans /auth/callback, soit `#access_token=…`. Le fragment
 * n'est jamais transmis au serveur : sans ce composant, le marchand
 * atterrirait sur la page d'accueil, non connecté, sans le moindre indice.
 *
 * Monté dans le layout racine : la destination dépend des « Redirect URLs »
 * configurées et n'est donc pas garantie d'être une page précise.
 */
export function HashSessionCatcher() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || typeof window === 'undefined') return;

    const hash = window.location.hash;
    if (!hash.includes('access_token')) return;

    const params = new URLSearchParams(hash.slice(1));
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    if (!access_token || !refresh_token) return;

    setBusy(true);

    (async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.setSession({ access_token, refresh_token });

      // On efface le fragment dans tous les cas : il porte des jetons valides,
      // qu'il ne faut pas laisser traîner dans la barre d'adresse ni dans
      // l'historique du navigateur.
      window.history.replaceState(null, '', window.location.pathname + window.location.search);

      if (error) {
        setBusy(false);
        router.replace('/login?erreur=lien_expire');
        return;
      }

      router.replace('/bienvenue');
      router.refresh();
    })();
  }, [router]);

  if (!busy) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#F6F1E7] flex flex-col items-center justify-center gap-3">
      <span className="w-10 h-10 rounded-2xl bg-[#6B7A3D] text-[#F7F2E2] flex items-center justify-center shrink-0">
        <MarqueKat className="w-7 h-7" />
      </span>
      <p className="text-sm font-semibold text-[#2E2C24]">Connexion en cours…</p>
    </div>
  );
}
