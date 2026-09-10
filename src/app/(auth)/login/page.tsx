import React from 'react';
import { AuthCodeForm } from '@/components/auth/AuthCodeForm';

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

/**
 * Composant serveur : `searchParams` est lu ici plutôt que via
 * `useSearchParams`, qui aurait imposé une frontière Suspense. Avec un
 * `fallback={null}`, le HTML servi était vide et le visiteur voyait un écran
 * blanc jusqu'au chargement du JavaScript.
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect } = await searchParams;

  // On n'accepte qu'un chemin interne : une URL absolue permettrait de
  // renvoyer le marchand vers un site tiers après connexion.
  const safeRedirect =
    redirect && redirect.startsWith('/') && !redirect.startsWith('//')
      ? redirect
      : '/dashboard';

  return <AuthCodeForm mode="login" redirectTo={safeRedirect} />;
}
