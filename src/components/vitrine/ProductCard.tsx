'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, Check, Bookmark, Heart } from 'lucide-react';
import { Product } from '@/lib/supabase/types';
import { formatPrice } from '@/lib/utils/formatters';
import { useCart } from '@/lib/context/CartContext';
import { Badge } from '@/components/ui/Badge';

interface ProductCardProps {
  product: Product;
  currency?: string;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency = 'FCFA',
  onOpenDetails,
}) => {
  const { items, addItem, isFavorite, toggleFavorite } = useCart();

  const cartItem = items.find((i) => i.id.startsWith(product.id));
  const isInCart = Boolean(cartItem);
  const isFav = isFavorite(product.id);

  const effectivePrice =
    product.prix_promo && product.prix_promo > 0 ? product.prix_promo : product.prix;
  const hasPromo = Boolean(product.prix_promo && product.prix_promo > 0);
  const discountPercent =
    product.discount_percent ||
    (hasPromo ? Math.round(((product.prix - product.prix_promo!) / product.prix) * 100) : 0);
  const isOutOfStock = !product.en_stock || product.stock <= 0;

  return (
    <div className="group relative bg-[var(--kat-surface,#FBF8F2)] border border-[var(--kat-bordure,#E4DAC4)] rounded-3xl overflow-hidden flex flex-col transition-all duration-200 hover:border-[#6B7A3D]/50 hover:shadow-xs">
      {/* Conteneur image */}
      <div
        onClick={() => onOpenDetails(product)}
        className="relative aspect-[4/4.5] w-full bg-[var(--kat-fond,#F6F1E7)] cursor-pointer overflow-hidden"
      >
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.nom}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#726C5C] text-xs">
            Photo indisponible
          </div>
        )}

        {/* Badge réduction style capsule sombre ou alerte rupture */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {isOutOfStock ? (
            <span className="px-2 py-0.5 rounded-full bg-[#B4553C] text-white text-[10px] font-bold shadow-xs">
              Rupture
            </span>
          ) : discountPercent > 0 ? (
            <span className="px-2.5 py-0.5 rounded-full bg-[#2E2C24] text-white text-[10px] font-bold shadow-xs">
              -{discountPercent}%
            </span>
          ) : null}
        </div>

        {/* Bouton Favori / Bookmark */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-xs transition-all shadow-xs ${
            isFav
              ? 'bg-[#B4553C] text-white'
              : 'bg-white/80 text-[#726C5C] hover:bg-white hover:text-[#B4553C]'
          }`}
          aria-label="Enregistrer dans les favoris"
        >
          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white' : ''}`} />
        </button>
      </div>

      {/* Contenu et prix */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div
          onClick={() => onOpenDetails(product)}
          className="cursor-pointer space-y-1 mb-2"
        >
          <h3 className="font-bold text-xs sm:text-sm text-[#2E2C24] line-clamp-1 hover:text-[var(--kat-accent,#6B7A3D)] transition-colors leading-snug">
            {product.nom}
          </h3>
          {product.sizes && product.sizes.length > 0 ? (
            <p className="text-[10px] text-[#726C5C]">
              Tailles : {product.sizes.slice(0, 3).join(', ')}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col">
            <span className="font-extrabold text-sm sm:text-base text-[#2E2C24]">
              {formatPrice(effectivePrice, currency)}
            </span>
            {hasPromo ? (
              <span className="text-[10px] text-[#726C5C] line-through">
                {formatPrice(product.prix, currency)}
              </span>
            ) : null}
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={() => onOpenDetails(product)}
            className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${
              isInCart
                ? 'bg-[var(--kat-accent-clair,#EBF0DE)] text-[var(--kat-accent-texte,#54602F)] border border-[#6B7A3D]/40'
                : 'bg-[var(--kat-accent,#6B7A3D)] text-white hover:bg-[var(--kat-accent-fonce,#54602F)]'
            }`}
            title="Choisir taille et couleur"
          >
            {isInCart ? (
              <Check className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
