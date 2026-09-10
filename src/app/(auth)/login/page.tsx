import React from 'react';
import { AuthCodeForm } from '@/components/auth/AuthCodeForm';

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string; erreur?: string }>;
}

/** Traduit le motif d'échec renvoyé par /auth/callback. */
function messageErreur(code?: string): string | null {
  if (!code) return null;
  if (code === 'lien_expire') {
    return "Ce lien a expiré ou a déjà servi. Les liens de connexion sont à usage unique : demandez-en un nouveau.";
  }
  if (code === 'lien_invalide') {
    return "Ce lien n'est pas valide. Redemandez-en un ci-dessous.";
  }
  return decodeURIComponent(code);
}

/**
 * Composant serveur : `searchParams` est lu ici plutôt que via
 * `useSearchParams`, qui aurait imposé une frontière Suspense. Avec un
 * `fallback={null}`, le HTML servi était vide et le visiteur voyait un écran
 * blanc jusqu'au chargement du JavaScript.
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect, erreur } = await searchParams;

  // On n'accepte qu'un chemin interne : une URL absolue permettrait de
  // renvoyer le marchand vers un site tiers après connexion.
  const safeRedirect =
    redirect && redirect.startsWith('/') && !redirect.startsWith('//')
      ? redirect
      : '/bienvenue';

  return (
    <AuthCodeForm
      mode="login"
      redirectTo={safeRedirect}
      initialError={messageErreur(erreur)}
    />
  );
}
