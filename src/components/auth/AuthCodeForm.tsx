'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Mail, MessageCircle, Store, ArrowRight, ArrowLeft, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/client';
import { isValidEmail, isValidPhone, toE164, translateAuthError } from '@/lib/auth/otp';

interface AuthCodeFormProps {
  mode: 'login' | 'register';
  /** Route à ouvrir une fois la session établie. */
  redirectTo: string;
  /** Message remonté par le lien de connexion, s'il a échoué. */
  initialError?: string | null;
}

/** Délai avant de pouvoir redemander un lien, en secondes. */
const RESEND_DELAY = 45;

export const AuthCodeForm: React.FC<AuthCodeFormProps> = ({
  mode,
  redirectTo,
  initialError = null,
}) => {
  const isRegister = mode === 'register';

  const [sent, setSent] = useState(false);
  const [nomBoutique, setNomBoutique] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');

  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Compte à rebours avant réémission, pour ne pas marteler l'envoi.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const sendLink = useCallback(async (): Promise<boolean> => {
    setError(null);

    if (isRegister && !nomBoutique.trim()) {
      setError('Donnez un nom à votre boutique.');
      return false;
    }
    // Le numéro WhatsApp est la ligne de commande de la boutique : il est requis
    // à l'inscription, même si la connexion se fait par email.
    if (isRegister && !isValidPhone(whatsapp)) {
      setError('Renseignez le numéro WhatsApp qui recevra les commandes.');
      return false;
    }
    if (!isValidEmail(email)) {
      setError('Cette adresse email ne semble pas valide.');
      return false;
    }

    setIsSending(true);

    const supabase = createClient();
    const { error: sendError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        // Une connexion ne doit jamais créer de compte au passage : sinon une
        // faute de frappe fabriquerait une boutique fantôme.
        shouldCreateUser: isRegister,
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        ...(isRegister
          ? {
              data: {
                nom_boutique: nomBoutique.trim(),
                whatsapp_number: toE164(whatsapp).replace('+', ''),
              },
            }
          : {}),
      },
    });

    setIsSending(false);

    if (sendError) {
      setError(translateAuthError(sendError.message));
      return false;
    }

    setSecondsLeft(RESEND_DELAY);
    return true;
  }, [email, isRegister, nomBoutique, redirectTo, whatsapp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await sendLink()) setSent(true);
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
            {isRegister ? 'Créez votre boutique en 5 minutes' : 'Connexion Espace Marchand'}
          </h1>
          <p className="text-xs text-[#726C5C]">
            Sans mot de passe : vous recevez un lien de connexion par email.
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-4">
          {error ? (
            <p
              role="alert"
              className="text-xs text-[#B00020] bg-[#FCEBEC] border border-[#F5C6CB] rounded-xl px-3 py-2"
            >
              {error}
            </p>
          ) : null}

          {sent ? (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#EBF0DE] text-[#54602F] mx-auto flex items-center justify-center">
                <MailCheck className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <p className="font-bold text-sm text-[#2E2C24]">Consultez votre boîte mail</p>
                <p className="text-xs text-[#726C5C] leading-relaxed">
                  Un lien de connexion vient d&apos;être envoyé à{' '}
                  <span className="font-semibold text-[#2E2C24]">{email.trim()}</span>. Ouvrez-le
                  et vous arriverez directement sur votre catalogue.
                </p>
              </div>

              <p className="text-[11px] text-[#9B9484] bg-[#F6F1E7] border border-[#E4DAC4] rounded-xl px-3 py-2 leading-relaxed">
                Rien reçu au bout d&apos;une minute ? Vérifiez vos courriers indésirables — les
                liens de connexion y atterrissent souvent.
              </p>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setError(null);
                  }}
                  className="inline-flex items-center gap-1 text-[#726C5C] hover:text-[#2E2C24] font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Changer d&apos;adresse
                </button>

                <button
                  type="button"
                  disabled={secondsLeft > 0 || isSending}
                  onClick={() => sendLink()}
                  className="text-[#6B7A3D] hover:underline font-semibold disabled:text-[#9B9484] disabled:no-underline disabled:cursor-not-allowed"
                >
                  {secondsLeft > 0 ? `Renvoyer dans ${secondsLeft}s` : 'Renvoyer le lien'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister ? (
                <>
                  <Input
                    label="Nom de votre boutique *"
                    placeholder="Ex: Alibra Shop"
                    value={nomBoutique}
                    onChange={(e) => setNomBoutique(e.target.value)}
                    leftIcon={<Store className="w-4 h-4" />}
                    required
                  />
                  <Input
                    label="Numéro WhatsApp *"
                    type="tel"
                    placeholder="6 79 52 75 41"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    leftIcon={<MessageCircle className="w-4 h-4" />}
                    helperText="Ce numéro recevra les commandes de vos clients."
                    required
                  />
                </>
              ) : null}

              <Input
                label="Adresse email *"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="votre-boutique@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                helperText={
                  isRegister
                    ? "C'est par cette adresse que vous vous connecterez ensuite."
                    : undefined
                }
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSending}
                className="w-full h-12"
              >
                <span>{isRegister ? 'Créer ma boutique' : 'Recevoir mon lien'}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          )}
        </Card>

        <p className="text-center text-xs text-[#726C5C]">
          {isRegister ? (
            <>
              Vous avez déjà une boutique ?{' '}
              <Link href="/login" className="font-bold text-[#6B7A3D] hover:underline">
                Me connecter
              </Link>
            </>
          ) : (
            <>
              Vous n&apos;avez pas encore de boutique ?{' '}
              <Link href="/register" className="font-bold text-[#6B7A3D] hover:underline">
                Créer ma boutique gratuitement
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
};
