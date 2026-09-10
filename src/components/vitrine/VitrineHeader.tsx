'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Search,
  MessageCircle,
  Share2,
  Check,
  Sparkles,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { Profile, Catalog } from '@/lib/supabase/types';
import { cleanWhatsAppNumber } from '@/lib/utils/formatters';

interface VitrineHeaderProps {
  profile: Profile;
  catalog?: Catalog;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenLookbook?: () => void;
}

export const VitrineHeader: React.FC<VitrineHeaderProps> = ({
  profile,
  catalog,
  searchQuery,
  onSearchChange,
  onOpenLookbook,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({
          title: profile.nom_boutique,
          text:
            catalog?.description ||
            profile.description ||
            `Découvrez le catalogue de ${profile.nom_boutique}`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const directWhatsAppLink = `https://wa.me/${cleanWhatsAppNumber(
    profile.whatsapp_number
  )}?text=${encodeURIComponent(
    `Bonjour ${profile.nom_boutique}, j'ai vu votre catalogue sur KAT et je souhaite avoir des renseignements.`
  )}`;

  return (
    <header className="bg-[#FBF8F2] border-b border-[#E4DAC4]/70 pt-4 pb-4 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-3.5">
        {/* Top App Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden border border-[#E4DAC4] bg-[#F6F1E7] shrink-0 shadow-xs">
              {profile.logo_url ? (
                <Image
                  src={profile.logo_url}
                  alt={profile.nom_boutique}
                  fill
                  sizes="44px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#EBF0DE] text-[#54602F] font-bold text-sm font-display">
                  {profile.nom_boutique.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-bold font-display text-[#2E2C24] leading-tight">
                  {profile.nom_boutique}
                </h1>
                <CheckCircle2 className="w-4 h-4 text-[#6B7A3D] shrink-0" />
              </div>
              <p className="text-[11px] text-[#726C5C] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#6B7A3D]" />
                {profile.ville || 'Douala, Cameroun'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenLookbook ? (
              <button
                type="button"
                onClick={onOpenLookbook}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EBF0DE] text-[#54602F] border border-[#DDE6C9] text-xs font-semibold hover:bg-[#DDE6C9] transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mode Lookbook</span>
              </button>
            ) : null}

            <button
              onClick={handleShare}
              className="p-2.5 rounded-full bg-[#F6F1E7] border border-[#E4DAC4] text-[#2E2C24] hover:bg-[#E4DAC4]/30 transition-colors shadow-xs"
              title="Partager le catalogue"
              aria-label="Partager"
            >
              {copied ? (
                <Check className="w-4 h-4 text-[#3F7D4F]" />
              ) : (
                <Share2 className="w-4 h-4 text-[#726C5C]" />
              )}
            </button>

            <a
              href={directWhatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-[#E8F8EE] border border-[#BDEBD0] text-[#1E7E34] hover:bg-[#d5f3df] transition-colors shadow-xs"
              title="Message WhatsApp"
              aria-label="Contacter sur WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
            </a>
          </div>
        </div>

        {/* Barre de recherche style capsule */}
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-[#726C5C] pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher parmi les articles..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#F6F1E7] border border-[#E4DAC4] rounded-full pl-10 pr-24 py-2.5 text-xs sm:text-sm text-[#2E2C24] placeholder-[#9B9484] focus:outline-none focus:border-[#6B7A3D] focus:bg-[#FBF8F2] transition-colors"
          />
          {onOpenLookbook ? (
            <button
              type="button"
              onClick={onOpenLookbook}
              className="absolute right-1.5 px-3 py-1 rounded-full bg-[#6B7A3D] text-white text-[11px] font-bold flex items-center gap-1 hover:bg-[#54602F] transition-colors shadow-xs"
            >
              <Sparkles className="w-3 h-3" />
              <span>Lookbook</span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
};
