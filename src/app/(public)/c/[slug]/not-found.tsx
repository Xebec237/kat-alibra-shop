import React from 'react';
import Link from 'next/link';
import { Search, Store } from 'lucide-react';
import { MarqueKat } from '@/components/brand/LogoKat';

/**
 * Adresse de boutique inconnue.
 *
 * Le visiteur arrive presque toujours par un lien reçu sur WhatsApp : il n'a
 * pas tapé cette adresse et ne peut pas la corriger. On l'oriente donc vers la
 * recherche plutôt que de le laisser sur un constat d'échec.
 */
export default function BoutiqueIntrouvable() {
  return (
    <div className="min-h-screen bg-[#F6F1E7] text-[#2E2C24] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5"
          aria-label="Accueil KAT"
        >
          <span className="w-10 h-10 rounded-2xl bg-[#6B7A3D] text-[#F7F2E2] flex items-center justify-center shadow-xs">
            <MarqueKat className="w-7 h-7" />
          </span>
          <span className="font-bold font-display text-2xl tracking-tight">KAT</span>
        </Link>

        <div className="rounded-3xl bg-[#FBF8F2] border border-[#E4DAC4] p-8 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#F6F1E7] border border-[#E4DAC4] text-[#726C5C] mx-auto flex items-center justify-center">
            <Store className="w-7 h-7 opacity-50" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-bold font-display">Boutique introuvable</h1>
            <p className="text-xs text-[#726C5C] leading-relaxed">
              Cette adresse ne correspond à aucune boutique. Le lien est
              peut-être incomplet, ou le commerçant a changé l&apos;adresse de sa
              vitrine.
            </p>
          </div>

          <Link
            href="/recherche"
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#6B7A3D] text-white px-6 py-3 text-sm font-bold hover:bg-[#54602F] transition-colors"
          >
            <Search className="w-4 h-4" />
            Chercher une boutique
          </Link>
        </div>

        <p className="text-[11px] text-[#9B9484]">
          Vous êtes commerçant ?{' '}
          <Link href="/register" className="font-semibold text-[#6B7A3D] hover:underline">
            Ouvrez votre boutique gratuitement
          </Link>
        </p>
      </div>
    </div>
  );
}
