'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Upload, Check, ImagePlus, Trash2 } from 'lucide-react';
import { Category, Product, Profile } from '@/lib/supabase/types';
import { createProduct, updateProduct } from '@/lib/actions/products';
import { uploadProductImage } from '@/lib/supabase/storage';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface ProductFormProps {
  categories: Category[];
  profile: Profile;
  /** Fourni en mode édition ; absent en création. */
  product?: Product;
}

export const ProductForm: React.FC<ProductFormProps> = ({ categories, profile, product }) => {
  const isEdit = Boolean(product);
  const router = useRouter();
  const [nom, setNom] = useState(product?.nom ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [prix, setPrix] = useState(product ? String(product.prix) : '');
  const [prixPromo, setPrixPromo] = useState(
    product?.prix_promo ? String(product.prix_promo) : ''
  );
  const [categoryId, setCategoryId] = useState(
    product?.category_id ?? categories[0]?.id ?? ''
  );
  const [stock, setStock] = useState(product ? String(product.stock) : '10');
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddImageUrl = () => {
    if (imageUrl.trim()) {
      setImages((prev) => [...prev, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    for (const file of Array.from(files)) {
      const result = await uploadProductImage(file, profile.id);
      if (result.ok) {
        setImages((prev) => [...prev, result.url]);
      } else {
        setError(`${file.name} : ${result.error}`);
      }
    }

    setIsUploading(false);
    // Permet de re-sélectionner le même fichier après une suppression.
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nom.trim() || !prix) {
      setError('Le nom et le prix du produit sont obligatoires.');
      return;
    }

    const prixNum = Number(prix);
    const promoNum = prixPromo ? Number(prixPromo) : null;

    if (Number.isNaN(prixNum) || prixNum < 0) {
      setError('Le prix doit être un nombre positif.');
      return;
    }

    if (promoNum !== null && promoNum >= prixNum) {
      setError('Le prix promotionnel doit être inférieur au prix de vente.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      nom: nom.trim(),
      description: description.trim() || null,
      prix: prixNum,
      prix_promo: promoNum,
      category_id: categoryId || null,
      stock: Number(stock) || 0,
      images,
    };

    const result = product
      ? await updateProduct(product.id, payload)
      : await createProduct(payload);

    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push('/produits');
    router.refresh();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Retour et titre */}
      <div className="flex items-center gap-3">
        <Link
          href="/produits"
          className="p-2 rounded-xl border border-[#E4DAC4] text-[#2E2C24] bg-[#FBF8F2] hover:bg-[#F6F1E7]"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-display text-[#2E2C24]">
            {isEdit ? `Modifier « ${product!.nom} »` : 'Ajouter un nouveau produit'}
          </h1>
          <p className="text-xs text-[#726C5C]">
            {isEdit
              ? 'Vos changements seront visibles immédiatement sur la vitrine publique.'
              : "Renseignez les détails pour l'afficher instantanément sur votre vitrine WhatsApp."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations Générales */}
        <Card className="space-y-4">
          <h2 className="font-bold text-sm text-[#2E2C24] font-display border-b border-[#E4DAC4]/60 pb-2">
            1. Informations principales
          </h2>

          <Input
            label="Nom du produit *"
            placeholder="Ex: Robe de Soirée Satin Émeraude"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
          />

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#726C5C]">
              Catégorie
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-[#FBF8F2] border border-[#E4DAC4] rounded-xl px-3.5 py-2.5 text-sm text-[#2E2C24] focus:outline-none focus:border-[#6B7A3D]"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#726C5C]">
              Description (optionnel)
            </label>
            <textarea
              rows={3}
              placeholder="Ex: Matière 100% coton, disponible en plusieurs tailles (M, L, XL)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#FBF8F2] border border-[#E4DAC4] rounded-xl p-3 text-sm text-[#2E2C24] placeholder-[#9B9484] focus:outline-none focus:border-[#6B7A3D]"
            />
          </div>
        </Card>

        {/* Tarification & Stock */}
        <Card className="space-y-4">
          <h2 className="font-bold text-sm text-[#2E2C24] font-display border-b border-[#E4DAC4]/60 pb-2">
            2. Prix & Disponibilité
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={`Prix de vente (${profile.devise}) *`}
              type="number"
              placeholder="Ex: 25000"
              value={prix}
              onChange={(e) => setPrix(e.target.value)}
              required
            />

            <Input
              label={`Prix promotionnel (${profile.devise}) - Optionnel`}
              type="number"
              placeholder="Ex: 22000"
              value={prixPromo}
              onChange={(e) => setPrixPromo(e.target.value)}
              helperText="Affichera le prix barré sur votre catalogue."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Quantité en stock"
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              min="0"
            />
          </div>
        </Card>

        {/* Photos du produit */}
        <Card className="space-y-4">
          <h2 className="font-bold text-sm text-[#2E2C24] font-display border-b border-[#E4DAC4]/60 pb-2">
            3. Photos du produit
          </h2>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-xl overflow-hidden bg-[#F6F1E7] border border-[#E4DAC4] group"
              >
                <Image src={img} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-[#B4553C] text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="relative aspect-square rounded-xl border-2 border-dashed border-[#E4DAC4] bg-[#F6F1E7]/50 flex flex-col items-center justify-center p-2 text-center text-[#726C5C] hover:border-[#6B7A3D] hover:bg-[#EBF0DE]/40 transition-colors disabled:opacity-50"
            >
              <ImagePlus className="w-6 h-6 mb-1 text-[#6B7A3D]" />
              <span className="text-[10px]">
                {isUploading ? 'Envoi…' : 'Ajouter'}
              </span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            onChange={(e) => handleFilesSelected(e.target.files)}
            className="hidden"
          />

          <p className="text-[11px] text-[#726C5C]">
            Choisissez une photo depuis votre téléphone (JPG, PNG, WebP — 5 Mo max),
            ou collez un lien web ci-dessous.
          </p>

          {error ? (
            <p
              role="alert"
              className="text-xs text-[#B00020] bg-[#FCEBEC] border border-[#F5C6CB] rounded-xl px-3 py-2"
            >
              {error}
            </p>
          ) : null}

          <div className="flex gap-2">
            <Input
              placeholder="Ou collez un lien web d'image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleAddImageUrl}
              className="shrink-0"
            >
              Ajouter
            </Button>
          </div>
        </Card>

        {/* Boutons d'action */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href="/produits">
            <Button variant="ghost" size="md">
              Annuler
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="px-8"
          >
            <Check className="w-4 h-4 mr-2" />
            {isEdit ? 'Enregistrer les modifications' : 'Enregistrer le produit'}
          </Button>
        </div>
      </form>
    </div>
  );
};
