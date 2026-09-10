'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Store, Lock, Mail, ArrowRight, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [notice, setNotice] = useState<string | null>(null);

  // Envoi du lien de réinitialisation. On affiche le même message que l'adresse
  // existe ou non : dire « ce compte n'existe pas » permettrait à un inconnu de
  // savoir quels emails sont inscrits sur la plateforme.
  const handleResetPassword = async () => {
    setError(null);
    setNotice(null);

    if (!email.trim()) {
      setError('Saisissez votre adresse email, puis relancez la réinitialisation.');
      return;
    }

    if (!isSupabaseConfigured) {
      setError("Mode démonstration : aucun email ne peut être envoyé.");
      return;
    }

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/login` }
    );

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setNotice(
      `Si un compte existe pour ${email.trim()}, un lien de réinitialisation vient d'y être envoyé.`
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Mode démo : aucun projet Supabase branché, on ouvre le dashboard mock.
    if (!isSupabaseConfigured) {
      router.push(redirectTo);
      return;
    }

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(
        signInError.message === 'Invalid login credentials'
          ? 'Email ou mot de passe incorrect.'
          : signInError.message
      );
      setIsLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#F6F1E7] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#6B7A3D] text-white flex items-center justify-center font-bold font-display text-xl shadow-xs">
              K
            </div>
            <span className="font-bold font-display text-2xl tracking-tight text-[#2E2C24]">
              KAT
            </span>
          </Link>
          <h1 className="text-xl font-bold font-display text-[#2E2C24]">
            Connexion Espace Marchand
          </h1>
          <p className="text-xs text-[#726C5C]">
            Accédez à votre catalogue et gérez vos commandes WhatsApp.
          </p>
        </div>

        {/* Carte formulaire */}
        <Card className="p-6 sm:p-8 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? (
              <p
                role="alert"
                className="text-xs text-[#B00020] bg-[#FCEBEC] border border-[#F5C6CB] rounded-xl px-3 py-2"
              >
                {error}
              </p>
            ) : null}

            {notice ? (
              <p
                role="status"
                className="text-xs text-[#1E7E34] bg-[#E8F8EE] border border-[#BDEBD0] rounded-xl px-3 py-2"
              >
                {notice}
              </p>
            ) : null}

            <Input
              label="Adresse Email"
              type="email"
              placeholder="votre-boutique@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-1.5 text-[#726C5C] cursor-pointer">
                <input type="checkbox" className="rounded border-[#E4DAC4] text-[#6B7A3D]" defaultChecked />
                <span>Se souvenir de moi</span>
              </label>
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-[#6B7A3D] hover:underline font-medium"
              >
                Mot de passe oublié ?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full h-12"
            >
              <span>Se connecter</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        </Card>

        {/* Inscription */}
        <p className="text-center text-xs text-[#726C5C]">
          Vous n&apos;avez pas encore de boutique ?{' '}
          <Link href="/register" className="font-bold text-[#6B7A3D] hover:underline">
            Créer ma boutique gratuitement
          </Link>
        </p>
      </div>
    </div>
  );
}

// `useSearchParams` (lecture du paramètre ?redirect) impose une frontière
// Suspense pour que la page reste prérendue statiquement.
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
