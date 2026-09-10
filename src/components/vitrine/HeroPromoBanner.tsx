'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowUpRight, Sparkles } from 'lucide-react';

interface HeroPromoBannerProps {
  onExplore: () => void;
}

export const HeroPromoBanner: React.FC<HeroPromoBannerProps> = ({ onExplore }) => {
  return (
    <div
      onClick={onExplore}
      className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-[#2E2C24] via-[#3D3A30] to-[#54602F] text-white p-5 sm:p-6 cursor-pointer shadow-md group border border-[#E4DAC4]/30"
    >
      {/* Photo de fond avec fondu */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 sm:w-2/5 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80"
          alt="Mode Prestige"
          fill
          sizes="(max-width: 640px) 50vw, 350px"
          className="object-cover object-top opacity-90 group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2E2C24] via-[#2E2C24]/60 to-transparent" />
      </div>

      {/* Contenu textuel */}
      <div className="relative z-10 max-w-[65%] sm:max-w-[60%] space-y-2.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[10px] font-bold tracking-wider uppercase text-[#EBF0DE]">
          <Sparkles className="w-3 h-3" />
          <span>Sélection Prestige</span>
        </div>

        <h2 className="text-lg sm:text-2xl font-bold font-display leading-tight text-white">
          Le style qui vous ressemble.{' '}
          <span className="text-[#EBF0DE]">Fait pour vous.</span>
        </h2>

        <div className="inline-block bg-[#6B7A3D] text-white text-xs sm:text-sm font-extrabold px-3 py-1 rounded-full shadow-xs">
          Jusqu&apos;à -20% de remise
        </div>
      </div>

      {/* Bouton flèche circulaire en haut à droite */}
      <div className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 text-[#2E2C24] flex items-center justify-center backdrop-blur-xs shadow-md group-hover:scale-110 transition-transform">
        <ArrowUpRight className="w-4 h-4" />
      </div>
    </div>
  );
};
