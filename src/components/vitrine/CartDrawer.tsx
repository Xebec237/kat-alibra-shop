'use client';

import React from 'react';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';
import { formatPrice } from '@/lib/utils/formatters';
import { Button } from '@/components/ui/Button';

interface CartDrawerProps {
  currency?: string;
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  currency = 'FCFA',
  onOpenCheckout,
}) => {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    totalCount,
    totalAmount,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#2E2C24]/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        className="fixed inset-0"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />
      
      <div className="relative w-full max-w-md bg-[#FBF8F2] border-l border-[#E4DAC4] h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-right duration-200">
        {/* En-tête tiroir */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E4DAC4]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#6B7A3D]" />
            <h2 className="font-bold text-lg text-[#2E2C24] font-display">
              Mon Panier ({totalCount})
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-lg text-[#726C5C] hover:text-[#2E2C24] hover:bg-[#E4DAC4]/30 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Liste des articles */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-[#F6F1E7] border border-[#E4DAC4] flex items-center justify-center text-[#726C5C]">
                <ShoppingBag className="w-8 h-8 opacity-40" />
              </div>
              <p className="font-semibold text-[#2E2C24]">Votre panier est vide</p>
              <p className="text-xs text-[#726C5C]">
                Explorez le catalogue et sélectionnez vos articles favoris.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCartOpen(false)}
                className="mt-2"
              >
                Continuer les achats
              </Button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center text-xs text-[#726C5C] pb-2 border-b border-[#E4DAC4]/40">
                <span>Articles sélectionnés</span>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[#B4553C] hover:underline flex items-center gap-1 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Vider
                </button>
              </div>

              {items.map((item) => {
                const effectivePrice = item.prix_promo && item.prix_promo > 0 ? item.prix_promo : item.prix;
                const lineTotal = effectivePrice * item.quantite;

                return (
                  <div
                    key={item.id}
                    className="flex gap-3 bg-[#F6F1E7]/70 p-3 rounded-2xl border border-[#E4DAC4]/70"
                  >
                    {/* Image miniature */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#F6F1E7] border border-[#E4DAC4] shrink-0">
                      {item.image ? (
                        <Image src={item.image} alt={item.nom} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-[#726C5C]">
                          Article
                        </div>
                      )}
                    </div>

                    {/* Infos article */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-semibold text-xs text-[#2E2C24] line-clamp-1">
                          {item.nom}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-[#726C5C] hover:text-[#B4553C] transition-colors p-1"
                          aria-label="Supprimer l'article"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 bg-[#FBF8F2] border border-[#E4DAC4] rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantite - 1)}
                            className="w-6 h-6 flex items-center justify-center text-[#2E2C24] hover:bg-[#E4DAC4]/30 rounded"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-[#2E2C24]">
                            {item.quantite}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantite + 1)}
                            className="w-6 h-6 flex items-center justify-center text-[#2E2C24] hover:bg-[#E4DAC4]/30 rounded"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-bold text-xs sm:text-sm text-[#2E2C24]">
                          {formatPrice(lineTotal, currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Pied du panier avec total et bouton commander */}
        {items.length > 0 ? (
          <div className="p-4 sm:p-5 border-t border-[#E4DAC4] bg-[#FBF8F2] space-y-3">
            <div className="space-y-1.5 text-xs text-[#726C5C]">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span className="font-semibold text-[#2E2C24]">{formatPrice(totalAmount, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>Frais de livraison</span>
                <span className="text-[#6B7A3D] font-medium">À convenir sur WhatsApp</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-2 border-t border-[#E4DAC4]/60">
              <span className="font-bold text-sm text-[#2E2C24]">Total estimé</span>
              <span className="font-bold text-xl text-[#2E2C24]">{formatPrice(totalAmount, currency)}</span>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                setIsCartOpen(false);
                onOpenCheckout();
              }}
              className="w-full h-12"
            >
              <span>Passer la commande</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
