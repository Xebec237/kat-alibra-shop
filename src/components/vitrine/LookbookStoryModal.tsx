'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Heart, Share2, ChevronLeft, ChevronRight, MessageCircle, ShoppingBag, Sparkles } from 'lucide-react';
import { Product } from '@/lib/supabase/types';
import { formatPrice } from '@/lib/utils/formatters';
import { useCart } from '@/lib/context/CartContext';

interface LookbookStoryModalProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  currency?: string;
  onSelectProduct: (product: Product) => void;
}

export const LookbookStoryModal: React.FC<LookbookStoryModalProps> = ({
  products,
  isOpen,
  onClose,
  currency = 'FCFA',
  onSelectProduct,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { addItem, isFavorite, toggleFavorite, setIsCartOpen } = useCart();

  if (!isOpen || products.length === 0) return null;

  const currentProduct = products[currentIndex];
  const isFav = isFavorite(currentProduct.id);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const handleAddToCart = () => {
    addItem(currentProduct, 1, {
      taille: currentProduct.sizes?.[0] || 'Standard',
      couleur: currentProduct.colors?.[0]?.name,
    });
    setIsCartOpen(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in">
      {/* Conteneur Story format 9:16 */}
      <div className="relative w-full max-w-sm h-[94vh] max-h-[820px] rounded-3xl overflow-hidden bg-[#2E2C24] shadow-2xl flex flex-col justify-between">
        {/* Barre de progression des stories en haut */}
        <div className="absolute top-3 left-3 right-3 z-30 flex gap-1">
          {products.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i === currentIndex ? 'bg-white' : i < currentIndex ? 'bg-white/60' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Top bar avec fermeture et badge IA / Lookbook */}
        <div className="absolute top-6 left-4 right-4 z-30 flex items-center justify-between text-white">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#EBF0DE]" />
            <span>Lookbook Story</span>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Photo plein écran */}
        <div className="absolute inset-0">
          {currentProduct.images && currentProduct.images.length > 0 ? (
            <Image
              src={currentProduct.images[0]}
              alt={currentProduct.nom}
              fill
              className="object-cover"
              priority
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        </div>

        {/* Zones tactiles gauche/droite pour défiler */}
        <div className="absolute inset-0 z-10 flex">
          <div onClick={handlePrev} className="w-1/3 h-full cursor-pointer" />
          <div onClick={handleNext} className="w-2/3 h-full cursor-pointer" />
        </div>

        {/* Actions verticales à droite (comme sur la maquette gauche) */}
        <div className="absolute right-4 bottom-28 z-20 flex flex-col gap-3">
          <button
            onClick={() => toggleFavorite(currentProduct.id)}
            className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg transition-transform active:scale-90 ${
              isFav ? 'bg-[#B4553C] text-white' : 'bg-black/40 text-white hover:bg-black/60'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFav ? 'fill-white' : ''}`} />
          </button>

          <button
            onClick={() => {
              onClose();
              onSelectProduct(currentProduct);
            }}
            className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 shadow-lg"
            title="Détails"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>

        {/* Bas de l'écran avec Titre, Prix et Bouton Commander */}
        <div className="relative z-20 p-5 text-white space-y-3">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#EBF0DE] font-semibold block">
              {currentProduct.sizes?.join(' • ') || 'Collection Prestige'}
            </span>
            <h2 className="text-xl font-bold font-display leading-tight">
              {currentProduct.nom}
            </h2>
            <p className="text-xl font-extrabold text-[#EBF0DE] mt-1">
              {formatPrice(currentProduct.prix_promo || currentProduct.prix, currency)}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              className="flex-1 h-12 rounded-2xl bg-white text-[#2E2C24] font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-transform"
            >
              <ShoppingBag className="w-4 h-4 text-[#6B7A3D]" />
              <span>Ajouter au panier</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
