'use client';

import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';
import { formatPrice } from '@/lib/utils/formatters';

interface CartBottomBarProps {
  currency?: string;
  onOpenCheckout: () => void;
}

export const CartBottomBar: React.FC<CartBottomBarProps> = ({
  currency = 'FCFA',
  onOpenCheckout,
}) => {
  const { totalCount, totalAmount, setIsCartOpen } = useCart();

  if (totalCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-4 bg-[var(--kat-surface,#FBF8F2)]/95 backdrop-blur-md border-t border-[var(--kat-bordure,#E4DAC4)] shadow-lg animate-in slide-in-from-bottom-5 duration-200">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Résumé du panier */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
        >
          <div className="relative p-2.5 rounded-xl bg-[var(--kat-accent-clair,#EBF0DE)] text-[var(--kat-accent-texte,#54602F)]">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[var(--kat-accent,#6B7A3D)] text-white text-[11px] font-bold flex items-center justify-center border-2 border-[#FBF8F2]">
              {totalCount}
            </span>
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#726C5C] font-semibold block">
              Total ({totalCount} {totalCount > 1 ? 'articles' : 'article'})
            </span>
            <span className="text-base sm:text-lg font-bold text-[#2E2C24]">
              {formatPrice(totalAmount, currency)}
            </span>
          </div>
        </button>

        {/* Bouton de commande */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="hidden sm:inline-flex items-center justify-center px-4 py-3 rounded-xl border border-[var(--kat-bordure,#E4DAC4)] text-xs font-semibold text-[#2E2C24] hover:bg-[var(--kat-fond,#F6F1E7)]"
          >
            Voir le panier
          </button>
          
          <button
            type="button"
            onClick={onOpenCheckout}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--kat-accent,#6B7A3D)] text-white font-bold text-sm hover:bg-[var(--kat-accent-fonce,#54602F)] shadow-sm transition-all duration-150 active:scale-95"
          >
            <span>Commander</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
