'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowUpRight, Sparkles } from 'lucide-react';

interface HeroPromoBannerProps {
  onExplore: () => void;
  /** Visuel choisi par le marchand dans ses paramètres. */
  mediaUrl?: string | null;
  mediaType?: 'image' | 'video' | null;
  nomBoutique: string;
}

export const HeroPromoBanner: React.FC<HeroPromoBannerProps> = ({
  onExplore,
  mediaUrl,
  mediaType,
  nomBoutique,
}) => {
  const aMedia = Boolean(mediaUrl);

  return (
    <button
      type="button"
      onClick={onExplore}
      aria-label="Ouvrir le lookbook"
      className="relative w-full text-left rounded-3xl overflow-hidden text-white p-5 sm:p-6 cursor-pointer shadow-md group border border-[#E4DAC4]/30"
      style={{
        backgroundColor: 'var(--kat-accent-fonce, #54602F)',
      }}
    >
      {/* Visuel de fond */}
      <div
        className={`absolute inset-y-0 right-0 overflow-hidden ${
          aMedia ? 'w-full' : 'w-1/2 sm:w-2/5'
        }`}
      >
        {aMedia ? (
          mediaType === 'video' ? (
            // Muet et en lecture automatique : une bannière qui émet du son
            // dans un fil de navigation est une nuisance, et les navigateurs
            // mobiles bloquent de toute façon l'autoplay non muet.
            <video
              src={mediaUrl ?? undefined}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
          ) : (
            <Image
              src={mediaUrl ?? ''}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 700px"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )
        ) : (
          <div
            className="w-full h-full"
            style={{
              background:
                'linear-gradient(135deg, var(--kat-accent, #6B7A3D), var(--kat-accent-fonce, #54602F))',
            }}
          />
        )}

        {/* Voile dégradé : sans lui, le texte devient illisible dès que le
            marchand choisit une photo claire. */}
        <div
          className={`absolute inset-0 ${
            aMedia
              ? 'bg-gradient-to-r from-[#2E2C24]/90 via-[#2E2C24]/60 to-[#2E2C24]/20'
              : 'bg-gradient-to-r from-[#2E2C24] via-[#2E2C24]/60 to-transparent'
          }`}
        />
      </div>

      {/* Contenu textuel */}
      <div className="relative z-10 max-w-[65%] sm:max-w-[60%] space-y-2.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[10px] font-bold tracking-wider uppercase text-white">
          <Sparkles className="w-3 h-3" />
          <span>Collection {nomBoutique}</span>
        </div>

        <h2 className="text-lg sm:text-2xl font-bold font-display leading-tight text-white">
          Découvrez la collection.{' '}
          <span className="opacity-80">Article par article.</span>
        </h2>

        <span
          className="inline-flex items-center gap-1 text-white text-xs sm:text-sm font-extrabold px-3 py-1 rounded-full shadow-xs"
          style={{ backgroundColor: 'var(--kat-accent, #6B7A3D)' }}
        >
          Ouvrir le lookbook
          <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </button>
  );
};
