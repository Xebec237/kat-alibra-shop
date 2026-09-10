'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Package,
} from 'lucide-react';
import { Product, Profile } from '@/lib/supabase/types';
import {
  toggleProductActive,
  toggleProductStock,
  deleteProduct,
} from '@/lib/actions/products';
import { formatPrice } from '@/lib/utils/formatters';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface ProductsClientProps {
  initialProducts: Product[];
  profile: Profile;
}

export const ProductsClient: React.FC<ProductsClientProps> = ({ initialProducts, profile }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Mise à jour optimiste puis appel serveur : on remet l'état d'origine si
  // l'écriture échoue, pour ne jamais afficher un statut qui n'est pas en base.
  const handleToggleActive = async (id: string, current: boolean) => {
    setError(null);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, actif: !current } : p))
    );

    const result = await toggleProductActive(id, !current);
    if (!result.ok) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, actif: current } : p))
      );
      setError(result.error);
    }
  };

  const handleToggleStock = async (id: string, current: boolean) => {
    setError(null);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, en_stock: !current } : p))
    );

    const result = await toggleProductStock(id, !current);
    if (!result.ok) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, en_stock: current } : p))
      );
      setError(result.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    setError(null);
    const snapshot = products;
    setProducts((prev) => prev.filter((p) => p.id !== id));

    const result = await deleteProduct(id);
    if (!result.ok) {
      setProducts(snapshot);
      setError(result.error);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#2E2C24]">
            Gestion des Produits
          </h1>
          <p className="text-xs sm:text-sm text-[#726C5C] mt-1">
            Gérez vos articles, vos prix, vos photos et la disponibilité de vos stocks.
          </p>
        </div>

        <Link href="/produits/nouveau">
          <Button variant="primary" size="md" className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-1.5" />
            Nouveau produit
          </Button>
        </Link>
      </div>

      {error ? (
        <p
          role="alert"
          className="text-xs text-[#B00020] bg-[#FCEBEC] border border-[#F5C6CB] rounded-xl px-3 py-2"
        >
          {error}
        </p>
      ) : null}

      {/* Barre de recherche */}
      <div className="bg-[#FBF8F2] border border-[#E4DAC4] rounded-2xl p-3 flex items-center gap-3">
        <Search className="w-4 h-4 text-[#726C5C] ml-1" />
        <input
          type="text"
          placeholder="Rechercher un produit par nom..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs sm:text-sm text-[#2E2C24] placeholder-[#9B9484] focus:outline-none"
        />
      </div>

      {/* Grille / Liste des produits */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[#FBF8F2] border border-[#E4DAC4] rounded-2xl space-y-3">
          <Package className="w-12 h-12 text-[#726C5C] mx-auto opacity-40" />
          <p className="font-semibold text-[#2E2C24]">Aucun produit trouvé</p>
          <p className="text-xs text-[#726C5C]">
            Commencez par ajouter votre premier article à votre catalogue en ligne.
          </p>
          <Link href="/produits/nouveau">
            <Button variant="primary" size="sm" className="mt-2">
              <Plus className="w-4 h-4 mr-1" /> Ajouter un produit
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-[#FBF8F2] border border-[#E4DAC4] rounded-2xl overflow-hidden divide-y divide-[#E4DAC4]">
          {filteredProducts.map((product) => {
            const hasPromo = Boolean(product.prix_promo && product.prix_promo > 0);
            const isOut = !product.en_stock || product.stock <= 0;

            return (
              <div
                key={product.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#F6F1E7]/40 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Photo miniature */}
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-[#F6F1E7] border border-[#E4DAC4] shrink-0">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={product.nom}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-[#726C5C]">
                        Photo
                      </div>
                    )}
                  </div>

                  {/* Infos produit */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[#2E2C24] truncate">
                        {product.nom}
                      </h3>
                      {!product.actif ? (
                        <Badge variant="neutral" size="sm">Masqué</Badge>
                      ) : isOut ? (
                        <Badge variant="error" size="sm">Rupture</Badge>
                      ) : (
                        <Badge variant="success" size="sm">Actif</Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-bold text-[#2E2C24]">
                        {formatPrice(
                          hasPromo ? product.prix_promo! : product.prix,
                          profile.devise
                        )}
                      </span>
                      {hasPromo ? (
                        <span className="text-[#726C5C] line-through text-[11px]">
                          {formatPrice(product.prix, profile.devise)}
                        </span>
                      ) : null}
                      <span className="text-[#726C5C]">• Stock: {product.stock}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E4DAC4]/60">
                  <Link
                    href={`/c/${profile.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-[#726C5C] hover:text-[#6B7A3D] hover:bg-[#EBF0DE] transition-colors"
                    title="Voir sur la vitrine publique"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  <Link
                    href={`/produits/${product.id}/modifier`}
                    className="p-2 rounded-lg text-[#726C5C] hover:text-[#6B7A3D] hover:bg-[#EBF0DE] transition-colors"
                    title="Modifier le produit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStock(product.id, product.en_stock)}
                    className="text-xs"
                  >
                    {product.en_stock ? 'Mettre en rupture' : 'Remettre en stock'}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(product.id, product.actif)}
                    className="text-xs text-[#726C5C]"
                  >
                    {product.actif ? 'Masquer' : 'Afficher'}
                  </Button>

                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 rounded-lg text-[#726C5C] hover:text-[#B4553C] hover:bg-[#FBECE8] transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
