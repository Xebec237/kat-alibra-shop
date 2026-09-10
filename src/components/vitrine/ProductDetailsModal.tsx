'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  Share2,
  Star,
  Check,
  ShoppingBag,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { Product } from '@/lib/supabase/types';
import { formatPrice } from '@/lib/utils/formatters';
import { useCart } from '@/lib/context/CartContext';
import { Button } from '@/components/ui/Button';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  currency?: string;
  onDirectOrder?: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  currency = 'FCFA',
  onDirectOrder,
}) => {
  const { addItem, setIsCartOpen } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      setSelectedSize(product.sizes?.[0] || 'Standard');
      setSelectedColor(product.colors?.[0]?.name || '');
    }
  }, [product]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const effectivePrice =
    product.prix_promo && product.prix_promo > 0 ? product.prix_promo : product.prix;
  const hasPromo = Boolean(product.prix_promo && product.prix_promo > 0);
  const isOutOfStock = !product.en_stock || product.stock <= 0;

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({
          title: product.nom,
          text: `Découvrez ${product.nom} sur KAT !`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddToCart = () => {
    addItem(product, 1, {
      taille: selectedSize,
      couleur: selectedColor,
    });
    setIsCartOpen(true);
    onClose();
  };

  const handleBuyNow = () => {
    addItem(product, 1, {
      taille: selectedSize,
      couleur: selectedColor,
    });
    onClose();
    if (onDirectOrder) {
      onDirectOrder();
    } else {
      setIsCartOpen(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-[#2E2C24]/50 backdrop-blur-sm animate-in fade-in">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Conteneur de la fiche produit (Style iPhone App) */}
      <div className="relative w-full max-w-lg bg-[#FBF8F2] border border-[#E4DAC4] rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col z-10 overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200">
        {/* Top Bar avec retour et partage */}
        <div className="p-4 border-b border-[#E4DAC4]/60 flex items-center justify-between bg-[#FBF8F2]/90 backdrop-blur-xs sticky top-0 z-20">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#F6F1E7] border border-[#E4DAC4] flex items-center justify-center text-[#2E2C24] hover:bg-[#E4DAC4]/40 transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <span className="text-xs font-bold font-display uppercase tracking-wider text-[#726C5C]">
            Détails de l&apos;article
          </span>

          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-[#F6F1E7] border border-[#E4DAC4] flex items-center justify-center text-[#2E2C24] hover:bg-[#E4DAC4]/40 transition-colors"
            aria-label="Partager"
          >
            {copied ? <Check className="w-4 h-4 text-[#3F7D4F]" /> : <Share2 className="w-4 h-4 text-[#726C5C]" />}
          </button>
        </div>

        {/* Corps défilant */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Photo principale focalisée */}
          <div className="relative aspect-[4/4.5] w-full rounded-3xl overflow-hidden bg-[#F6F1E7] border border-[#E4DAC4] shadow-xs">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.nom}
                fill
                sizes="(max-width: 640px) 100vw, 500px"
                className="object-cover"
                priority
              />
            ) : null}

            {/* Badge promotion ou rupture */}
            <div className="absolute top-3 left-3">
              {isOutOfStock ? (
                <span className="px-3 py-1 rounded-full bg-[#B4553C] text-white text-xs font-bold">
                  Rupture de stock
                </span>
              ) : hasPromo ? (
                <span className="px-3 py-1 rounded-full bg-[#2E2C24] text-white text-xs font-bold">
                  PROMO EXCLUSIVE
                </span>
              ) : null}
            </div>
          </div>

          {/* Miniatures */}
          {product.images && product.images.length > 1 ? (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-16 h-16 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-[#6B7A3D] scale-105'
                      : 'border-[#E4DAC4] opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          ) : null}

          {/* Titre et Avis */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl sm:text-2xl font-bold font-display text-[#2E2C24] leading-tight">
                {product.nom}
              </h1>
              <div className="text-right shrink-0">
                <span className="text-xl sm:text-2xl font-extrabold text-[#2E2C24] block">
                  {formatPrice(effectivePrice, currency)}
                </span>
                {hasPromo ? (
                  <span className="text-xs text-[#726C5C] line-through">
                    {formatPrice(product.prix, currency)}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Avis étoiles */}
            <div className="flex items-center gap-1.5 text-xs text-[#726C5C]">
              <div className="flex items-center text-[#B98A2E]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="font-bold text-[#2E2C24]">
                {product.rating || 4.9}
              </span>
              <span>•</span>
              <span>{product.reviews_count || 120} Avis clients</span>
            </div>
          </div>

          {/* Sélecteur de Tailles (Comme sur la maquette : M, L, XL, XXL) */}
          {product.sizes && product.sizes.length > 0 ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold uppercase tracking-wider text-[#726C5C]">
                  Taille
                </span>
                <span className="text-[#6B7A3D] font-semibold">
                  Sélection : {selectedSize}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[48px] h-11 px-3.5 rounded-2xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#2E2C24] text-white shadow-xs scale-105'
                          : 'bg-[#F6F1E7] border border-[#E4DAC4] text-[#2E2C24] hover:border-[#6B7A3D]'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Nuancier de Couleurs (Comme sur la maquette avec coche) */}
          {product.colors && product.colors.length > 0 ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold uppercase tracking-wider text-[#726C5C]">
                  Couleurs
                </span>
                <span className="text-[#6B7A3D] font-semibold">
                  {selectedColor}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {product.colors.map((color) => {
                  const isSelected = selectedColor === color.name;
                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setSelectedColor(color.name)}
                      className={`relative w-9 h-9 rounded-full transition-transform flex items-center justify-center border-2 ${
                        isSelected
                          ? 'border-[#2E2C24] scale-110 shadow-sm'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {isSelected ? (
                        <Check
                          className={`w-4 h-4 ${
                            color.hex === '#FFFFFF' || color.hex === '#F6F1E7'
                              ? 'text-[#2E2C24]'
                              : 'text-white'
                          }`}
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Description */}
          {product.description ? (
            <div className="space-y-1.5 pt-2 border-t border-[#E4DAC4]/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#726C5C]">
                Description du produit
              </h3>
              <p className="text-xs sm:text-sm text-[#2E2C24] leading-relaxed whitespace-pre-line bg-[#F6F1E7]/70 p-3.5 rounded-2xl border border-[#E4DAC4]/70">
                {product.description}
              </p>
            </div>
          ) : null}
        </div>

        {/* Double boutons d'action (Add to Cart + Buy Now) */}
        <div className="p-4 sm:p-5 border-t border-[#E4DAC4] bg-[#FBF8F2] flex items-center gap-3 sticky bottom-0 z-20">
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className="flex-1 h-12 rounded-2xl border-2 border-[#E4DAC4] bg-[#F6F1E7] text-[#2E2C24] font-bold text-xs sm:text-sm hover:bg-[#E4DAC4]/40 transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <ShoppingBag className="w-4 h-4 text-[#6B7A3D]" />
            <span>Ajouter au panier</span>
          </button>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleBuyNow}
            className="flex-1 h-12 rounded-2xl bg-[#6B7A3D] text-white font-bold text-xs sm:text-sm hover:bg-[#54602F] shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Commander direct</span>
          </button>
        </div>
      </div>
    </div>
  );
};
