import React from 'react';
import Image from 'next/image';
import { Search, Sparkles, Heart } from 'lucide-react';
import { formatPrice } from '@/lib/utils/formatters';
import { TexteQuiSecrit } from '@/components/landing/TexteQuiSecrit';
import type { Product } from '@/lib/supabase/types';

interface PhoneMockupProps {
  nomBoutique: string;
  ville: string | null;
  produits: Product[];
}

/** Ce que le curseur tape tout seul dans la barre de recherche. */
const RECHERCHES = ['sac à main', 'robe de soirée', 'escarpins', 'montre femme'];

const CATEGORIES = [
  { nom: 'Sacs', emoji: '👜' },
  { nom: 'Robes', emoji: '👗' },
  { nom: 'Chaussures', emoji: '👠' },
  { nom: 'Montres', emoji: '⌚' },
];

/**
 * Aperçu d'une vitrine, présenté dans un cadre de téléphone.
 *
 * Purement décoratif : rien n'y est cliquable, le visiteur va sur la vraie
 * vitrine via les boutons d'appel à l'action. D'où `aria-hidden` — un lecteur
 * d'écran n'a aucun intérêt à parcourir une image de démonstration.
 */
export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  nomBoutique,
  ville,
  produits,
}) => {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-[280px] sm:w-[320px] select-none"
    >
      {/* Halo derrière l'appareil */}
      <div className="absolute -inset-8 bg-[#EBF0DE]/60 blur-3xl rounded-full" />

      <div className="relative rounded-[2.75rem] bg-[#2E2C24] p-2.5 shadow-2xl ring-1 ring-[#2E2C24]/10">
        <div className="relative rounded-[2.25rem] bg-[#F6F1E7] overflow-hidden">
          {/* Encoche */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#2E2C24] rounded-b-2xl z-20" />

          <div className="pt-8 pb-4 px-3.5 space-y-3.5">
            {/* En-tête boutique */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#6B7A3D] text-white flex items-center justify-center text-[11px] font-bold font-display shrink-0">
                {nomBoutique.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[#2E2C24] truncate leading-tight">
                  {nomBoutique}
                </p>
                <p className="text-[9px] text-[#726C5C] truncate">
                  {ville || 'Douala'} · Ouvert
                </p>
              </div>
            </div>

            {/* Recherche */}
            <div className="flex items-center gap-1.5 bg-[#FBF8F2] border border-[#E4DAC4] rounded-full px-2.5 py-1.5">
              <Search className="w-3 h-3 text-[#9B9484] shrink-0" />
              <TexteQuiSecrit termes={RECHERCHES} className="text-[9px] text-[#9B9484]" />
            </div>

            {/* Bandeau promotionnel */}
            <div className="relative rounded-2xl bg-gradient-to-br from-[#54602F] to-[#6B7A3D] px-3 py-3 overflow-hidden">
              <div className="relative z-10 space-y-1">
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/20 text-[7px] font-bold uppercase tracking-wide text-[#EBF0DE]">
                  <Sparkles className="w-2 h-2" />
                  Nouveautés
                </div>
                <p className="text-[11px] font-bold font-display text-white leading-tight">
                  La rentrée est là.
                </p>
                <p className="text-[8px] text-[#EBF0DE]">Commandez sur WhatsApp</p>
              </div>
              <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full bg-white/10" />
            </div>

            {/* Catégories */}
            <div className="flex items-start justify-between px-0.5">
              {CATEGORIES.map((c) => (
                <div key={c.nom} className="flex flex-col items-center gap-1 w-1/4">
                  <div className="w-9 h-9 rounded-full bg-[#FBF8F2] border border-[#E4DAC4] flex items-center justify-center text-sm">
                    {c.emoji}
                  </div>
                  <span className="text-[7.5px] text-[#726C5C] font-medium">{c.nom}</span>
                </div>
              ))}
            </div>

            {/* Grille produits */}
            <div className="grid grid-cols-2 gap-2">
              {produits.slice(0, 4).map((p) => {
                const promo = p.prix_promo && p.prix_promo > 0 ? p.prix_promo : null;
                const remise = promo
                  ? Math.round(((p.prix - promo) / p.prix) * 100)
                  : null;

                return (
                  <div
                    key={p.id}
                    className="rounded-2xl bg-[#FBF8F2] border border-[#E4DAC4] overflow-hidden"
                  >
                    <div className="relative aspect-square bg-[#F6F1E7]">
                      <Image
                        src={p.images[0]}
                        alt=""
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                      {remise ? (
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full bg-[#B4553C] text-white text-[7px] font-bold">
                          -{remise}%
                        </span>
                      ) : null}
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white/85 flex items-center justify-center">
                        <Heart className="w-2 h-2 text-[#726C5C]" />
                      </span>
                    </div>
                    <div className="px-1.5 py-1.5">
                      <p className="text-[8px] font-semibold text-[#2E2C24] truncate leading-tight">
                        {p.nom}
                      </p>
                      <p className="text-[8.5px] font-bold text-[#6B7A3D] mt-0.5">
                        {formatPrice(promo ?? p.prix, 'FCFA')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Barre d'action inférieure */}
          <div className="px-3.5 pb-3.5">
            <div className="rounded-full bg-[#6B7A3D] text-white text-[9px] font-bold py-2 text-center shadow-sm">
              Commander sur WhatsApp
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
