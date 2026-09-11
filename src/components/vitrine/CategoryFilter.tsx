'use client';

import React from 'react';
import { Category } from '@/lib/supabase/types';
import { cn } from '@/lib/utils/cn';

interface CategoryFilterProps {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedId,
  onSelect,
}) => {
  return (
    <div className="py-2">
      <div className="flex items-center justify-between px-1 mb-2.5">
        <h2 className="text-xs sm:text-sm font-bold font-display uppercase tracking-wider text-[#2E2C24]">
          Catégories
        </h2>
        <span className="text-[11px] text-[#726C5C]">
          {categories.length} rayons
        </span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 px-1">
        {categories.map((cat) => {
          const isSelected =
            selectedId === cat.id || (selectedId === 'all' && cat.id === 'cat-all');

          const iconMap: Record<string, string> = {
            'cat-all': '✨',
            'cat-robes': '👗',
            'cat-vestes': '🧥',
            'cat-sacs': '👜',
            'cat-chaussures': '👠',
            'cat-accessoires': '⌚',
          };

          const icon = cat.icon || iconMap[cat.id] || '🏷️';

          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id === 'cat-all' ? 'all' : cat.id)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[72px] sm:min-w-[80px] p-2.5 rounded-2xl transition-all duration-200 shrink-0 border text-center group",
                isSelected
                  ? "bg-[var(--kat-accent,#6B7A3D)] text-white border-[#54602F] shadow-sm scale-[1.02]"
                  : "bg-[var(--kat-surface,#FBF8F2)] text-[#726C5C] border-[var(--kat-bordure,#E4DAC4)] hover:border-[var(--kat-accent,#6B7A3D)]/40 hover:bg-[var(--kat-fond,#F6F1E7)]"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-1.5 transition-transform group-hover:scale-110",
                  isSelected ? "bg-white/20" : "bg-[var(--kat-fond,#F6F1E7)] border border-[var(--kat-bordure,#E4DAC4)]/60"
                )}
              >
                {icon}
              </div>
              <span
                className={cn(
                  "text-[11px] font-semibold leading-tight line-clamp-1",
                  isSelected ? "text-white" : "text-[#2E2C24]"
                )}
              >
                {cat.nom}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
