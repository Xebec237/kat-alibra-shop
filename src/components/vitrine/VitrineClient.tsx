'use client';

import React, { useState, useMemo } from 'react';
import { Profile, Product, Category, Catalog } from '@/lib/supabase/types';
import { CartProvider } from '@/lib/context/CartContext';
import { VitrineHeader } from '@/components/vitrine/VitrineHeader';
import { CategoryFilter } from '@/components/vitrine/CategoryFilter';
import { ProductCard } from '@/components/vitrine/ProductCard';
import { ProductDetailsModal } from '@/components/vitrine/ProductDetailsModal';
import { CartBottomBar } from '@/components/vitrine/CartBottomBar';
import { CartDrawer } from '@/components/vitrine/CartDrawer';
import { CheckoutModal } from '@/components/vitrine/CheckoutModal';
import { HeroPromoBanner } from '@/components/vitrine/HeroPromoBanner';
import { LookbookStoryModal } from '@/components/vitrine/LookbookStoryModal';
import { ShoppingBag } from 'lucide-react';
import { getTeinte, variablesTeinte } from '@/lib/theme/palette';

interface VitrineClientProps {
  profile: Profile;
  catalog: Catalog;
  categories: Category[];
  products: Product[];
  /** Le visiteur est le marchand propriétaire de cette boutique. */
  estProprietaire?: boolean;
}

export const VitrineClient: React.FC<VitrineClientProps> = ({
  profile,
  catalog,
  categories,
  products,
  estProprietaire = false,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLookbookOpen, setIsLookbookOpen] = useState(false);

  // Filtrage des produits par catégorie et recherche
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.actif) return false;
      const matchesCategory =
        selectedCategoryId === 'all' || p.category_id === selectedCategoryId;
      const matchesSearch =
        !searchQuery.trim() ||
        p.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategoryId, searchQuery]);

  // Le lookbook fait défiler les visuels plein écran : sans photo il n'a rien à
  // montrer, on ne garde donc que les articles actifs qui en ont une.
  const lookbookProducts = useMemo(
    () => products.filter((p) => p.actif && p.images && p.images.length > 0),
    [products]
  );

  return (
    <CartProvider storeSlug={profile.slug}>
      {/* Le <body> porte le crème par défaut, hors de ce conteneur : sans ça,
          il réapparaît au rebond de défilement sur mobile et dans la barre
          d'adresse teintée des navigateurs. */}
      <style>{`body{background-color:${getTeinte(profile.couleur_theme).fond}}`}</style>

      <div
        className="min-h-screen bg-[var(--kat-fond,#F6F1E7)] pb-28 text-[#2E2C24]"
        style={variablesTeinte(profile.couleur_theme)}
      >
        {/* En-tête marchand (logo, partage, WhatsApp et recherche) */}
        <VitrineHeader
          profile={profile}
          catalog={catalog}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenLookbook={
            lookbookProducts.length > 0 ? () => setIsLookbookOpen(true) : undefined
          }
          estProprietaire={estProprietaire}
        />

        {/* Bannière promo : n'a de sens que s'il y a des articles à explorer */}
        {lookbookProducts.length > 0 ? (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4">
            <HeroPromoBanner
              onExplore={() => setIsLookbookOpen(true)}
              mediaUrl={profile.lookbook_media_url}
              mediaType={profile.lookbook_media_type}
              nomBoutique={profile.nom_boutique}
            />
          </div>
        ) : null}

        {/* Filtre catégories horizontal */}
        <CategoryFilter
          categories={categories}
          selectedId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
        />

        {/* Grille de produits */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-5">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 px-4 bg-[var(--kat-surface,#FBF8F2)] border border-[var(--kat-bordure,#E4DAC4)] rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[var(--kat-fond,#F6F1E7)] border border-[var(--kat-bordure,#E4DAC4)] mx-auto flex items-center justify-center text-[#726C5C]">
                <ShoppingBag className="w-6 h-6 opacity-40" />
              </div>
              <p className="font-semibold text-[#2E2C24]">Aucun article trouvé</p>
              <p className="text-xs text-[#726C5C]">
                Essayez de modifier votre recherche ou sélectionnez une autre catégorie.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currency={profile.devise || 'FCFA'}
                  onOpenDetails={(p) => setActiveProduct(p)}
                />
              ))}
            </div>
          )}

          {/* Footer discret */}
          <footer className="mt-16 text-center py-6 border-t border-[var(--kat-bordure,#E4DAC4)]/60 space-y-1.5">
            <p className="text-xs font-semibold text-[#726C5C]">
              Boutique propulsée par <span className="text-[var(--kat-accent,#6B7A3D)] font-display font-bold">KAT</span>
            </p>
            <p className="text-[11px] text-[#9B9484]">
              Créez vous aussi votre catalogue en ligne en 5 minutes
            </p>
          </footer>
        </main>

        {/* Modale détails produit */}
        <ProductDetailsModal
          product={activeProduct}
          isOpen={Boolean(activeProduct)}
          onClose={() => setActiveProduct(null)}
          currency={profile.devise || 'FCFA'}
        />

        {/* Barre fixe en bas (Mobile) */}
        <CartBottomBar
          currency={profile.devise || 'FCFA'}
          onOpenCheckout={() => setIsCheckoutOpen(true)}
        />

        {/* Tiroir panier latéral */}
        <CartDrawer
          currency={profile.devise || 'FCFA'}
          onOpenCheckout={() => setIsCheckoutOpen(true)}
        />

        {/* Mode Lookbook : navigation plein écran, article par article */}
        <LookbookStoryModal
          products={lookbookProducts}
          isOpen={isLookbookOpen}
          onClose={() => setIsLookbookOpen(false)}
          currency={profile.devise || 'FCFA'}
          onSelectProduct={(p) => {
            setIsLookbookOpen(false);
            setActiveProduct(p);
          }}
        />

        {/* Modale de commande WhatsApp */}
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          profile={profile}
          catalog={catalog}
          currency={profile.devise || 'FCFA'}
        />
      </div>
    </CartProvider>
  );
};
