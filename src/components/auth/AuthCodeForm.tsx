'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, MessageCircle, Store, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/client';
import {
  type AuthChannel,
  OTP_MAX_LENGTH,
  formatIdentifier,
  isValidCode,
  isValidEmail,
  isValidPhone,
  toE164,
  translateAuthError,
} from '@/lib/auth/otp';

interface AuthCodeFormProps {
  mode: 'login' | 'register';
  /** Route à ouvrir une fois la session établie. */
  redirectTo: string;
}

/** Délai avant de pouvoir redemander un code, en secondes. */
const RESEND_DELAY = 45;

export const AuthCodeForm: React.FC<AuthCodeFormProps> = ({ mode, redirectTo }) => {
  const router = useRouter();
  const isRegister = mode === 'register';

  const [step, setStep] = useState<'identifier' | 'code'>('identifier');
  const [channel, setChannel] = useState<AuthChannel>('phone');

  const [nomBoutique, setNomBoutique] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const codeInputRef = useRef<HTMLInputElement>(null);

  // Compte à rebours avant réémission, pour ne pas marteler l'envoi.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  useEffect(() => {
    if (step === 'code') codeInputRef.current?.focus();
  }, [step]);

  const sendCode = useCallback(async (): Promise<boolean> => {
    setError(null);

    if (isRegister && !nomBoutique.trim()) {
      setError('Donnez un nom à votre boutique.');
      return false;
    }
    // Le numéro WhatsApp est la ligne de commande de la boutique : il est requis
    // à l'inscription même quand le code arrive par email.
    if (isRegister && !isValidPhone(whatsapp)) {
      setError('Renseignez le numéro WhatsApp qui recevra les commandes.');
      return false;
    }
    if (channel === 'email' && !isValidEmail(email)) {
      setError('Cette adresse email ne semble pas valide.');
      return false;
    }
    if (channel === 'phone' && !isValidPhone(whatsapp)) {
      setError('Ce numéro WhatsApp ne semble pas valide.');
      return false;
    }

    setIsSending(true);

    const supabase = createClient();
    const { error: sendError } = await supabase.auth.signInWithOtp({
      ...(channel === 'email' ? { email: email.trim() } : { phone: toE164(whatsapp) }),
      options: {
        // Une connexion ne doit jamais créer de compte au passage : sinon une
        // faute de frappe fabriquerait une boutique fantôme.
        shouldCreateUser: isRegister,
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
  }, [channel, email, isRegister, nomBoutique, whatsapp]);

  const handleSubmitIdentifier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await sendCode()) setStep('code');
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidCode(code)) {
      setError('Saisissez le code reçu, uniquement des chiffres.');
      return;
    }

    setIsVerifying(true);

    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp(
      channel === 'email'
        ? { email: email.trim(), token: code.trim(), type: 'email' }
        : { phone: toE164(whatsapp), token: code.trim(), type: 'sms' }
    );

    setIsVerifying(false);

    if (verifyError) {
      setError(translateAuthError(verifyError.message));
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  const channelButton = (value: AuthChannel, icon: React.ReactNode, label: string) => (
    <button
      type="button"
      onClick={() => {
        setChannel(value);
        setError(null);
      }}
      className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
        channel === value
          ? 'bg-[#6B7A3D] text-white border-[#6B7A3D] shadow-xs'
          : 'bg-[#FBF8F2] text-[#726C5C] border-[#E4DAC4] hover:bg-[#F6F1E7]'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

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
            {step === 'code'
              ? `Code envoyé à ${formatIdentifier(channel, channel === 'email' ? email : whatsapp)}`
              : 'Sans mot de passe : vous recevez un code à usage unique.'}
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

          {step === 'identifier' ? (
            <form onSubmit={handleSubmitIdentifier} className="space-y-4">
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

              <div className="space-y-1.5 text-left">
                <span className="block text-xs font-semibold uppercase tracking-wider text-[#726C5C]">
                  Recevoir le code par
                </span>
                <div className="flex gap-2">
                  {channelButton('phone', <MessageCircle className="w-3.5 h-3.5" />, 'WhatsApp')}
                  {channelButton('email', <Mail className="w-3.5 h-3.5" />, 'Email')}
                </div>
              </div>

              {channel === 'email' ? (
                <Input
                  label={isRegister ? 'Adresse email *' : 'Adresse email'}
                  type="email"
                  placeholder="votre-boutique@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />
              ) : !isRegister ? (
                <Input
                  label="Numéro WhatsApp"
                  type="tel"
                  placeholder="6 79 52 75 41"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  leftIcon={<MessageCircle className="w-4 h-4" />}
                  required
                />
              ) : null}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSending}
                className="w-full h-12"
              >
                <span>Recevoir mon code</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="flex justify-center">
                <div className="w-11 h-11 rounded-2xl bg-[#EBF0DE] text-[#54602F] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>

              <Input
                ref={codeInputRef}
                label="Code reçu"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={OTP_MAX_LENGTH}
                placeholder="00000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-[0.4em] font-bold"
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isVerifying}
                className="w-full h-12"
              >
                <span>{isRegister ? 'Créer ma boutique' : 'Me connecter'}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep('identifier');
                    setCode('');
                    setError(null);
                  }}
                  className="inline-flex items-center gap-1 text-[#726C5C] hover:text-[#2E2C24] font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Modifier
                </button>

                <button
                  type="button"
                  disabled={secondsLeft > 0 || isSending}
                  onClick={() => sendCode()}
                  className="text-[#6B7A3D] hover:underline font-semibold disabled:text-[#9B9484] disabled:no-underline disabled:cursor-not-allowed"
                >
                  {secondsLeft > 0 ? `Renvoyer dans ${secondsLeft}s` : 'Renvoyer le code'}
                </button>
              </div>
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
