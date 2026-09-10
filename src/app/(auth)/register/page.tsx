'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, Lock, Mail, Phone, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { cleanWhatsAppNumber } from '@/lib/utils/formatters';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export default function RegisterPage() {
  const router = useRouter();
  const [nomBoutique, setNomBoutique] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const cleaned = cleanWhatsAppNumber(whatsappNumber);

    // Mode démo : aucun projet Supabase branché, on ouvre le dashboard mock.
    if (!isSupabaseConfigured) {
      router.push('/dashboard');
      return;
    }

    const supabase = createClient();
    // `nom_boutique` et `whatsapp_number` sont lus par le trigger
    // handle_new_user() qui crée la ligne `profiles` correspondante.
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          nom_boutique: nomBoutique.trim(),
          whatsapp_number: cleaned,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
      return;
    }

    // Si la confirmation par email est activée, aucune session n'est ouverte.
    if (!data.session) {
      setConfirmationSent(true);
      setIsLoading(false);
      return;
    }

    router.push('/dashboard');
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
            Créez votre boutique en 5 minutes
          </h1>
          <p className="text-xs text-[#726C5C]">
            Rejoignez les commerçants qui vendent proprement sur WhatsApp.
          </p>
        </div>

        {/* Formulaire */}
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

            {confirmationSent ? (
              <p
                role="status"
                className="text-xs text-[#1E7E34] bg-[#E8F8EE] border border-[#BDEBD0] rounded-xl px-3 py-2"
              >
                Boutique créée. Confirmez votre adresse email via le lien que nous venons
                de vous envoyer, puis connectez-vous.
              </p>
            ) : null}

            <Input
              label="Nom de votre boutique *"
              placeholder="Ex: Douala Chic, Kribi Mode..."
              value={nomBoutique}
              onChange={(e) => setNomBoutique(e.target.value)}
              leftIcon={<Store className="w-4 h-4" />}
              required
            />

            <Input
              label="Numéro WhatsApp pour les commandes *"
              placeholder="Ex: 237690000000"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              helperText="Format international sans + ni espaces."
              leftIcon={<Phone className="w-4 h-4" />}
              required
            />

            <Input
              label="Votre adresse Email *"
              type="email"
              placeholder="boutique@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Mot de passe *"
              type="password"
              placeholder="Au moins 6 caractères"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full h-12 font-bold"
              >
                <span>Lancer mon catalogue</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </form>
        </Card>

        {/* Connexion existante */}
        <p className="text-center text-xs text-[#726C5C]">
          Vous avez déjà un compte ?{' '}
          <Link href="/login" className="font-bold text-[#6B7A3D] hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
