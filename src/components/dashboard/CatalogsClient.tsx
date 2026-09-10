'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Copy, Check, ExternalLink, MessageCircle, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Catalog, Product, Profile } from '@/lib/supabase/types';
import { updateCatalog } from '@/lib/actions/catalogs';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

interface CatalogsClientProps {
  profile: Profile;
  catalog: Catalog | null;
  products: Product[];
}

export const CatalogsClient: React.FC<CatalogsClientProps> = ({
  profile,
  catalog,
  products,
}) => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/c/${profile.slug}`
    : `http://localhost:3000/c/${profile.slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsAppShareLink = `https://wa.me/?text=${encodeURIComponent(
    `✨ Découvrez le catalogue de ${profile.nom_boutique} !\n\n` +
      `${products.length} articles disponibles, commande directe sur WhatsApp :\n${publicUrl}`
  )}`;

  const [isEditing, setIsEditing] = useState(false);
  const [titre, setTitre] = useState(catalog?.titre ?? 'Catalogue principal');
  const [description, setDescription] = useState(catalog?.description ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveCatalog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catalog) return;

    setIsSaving(true);
    setError(null);

    const result = await updateCatalog(catalog.id, { titre, description });
    setIsSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setIsEditing(false);
    router.refresh();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#2E2C24]">
          Mes Catalogues en Ligne
        </h1>
        <p className="text-xs sm:text-sm text-[#726C5C] mt-1">
          Créez plusieurs collections thématiques (saisons, promos, arrivages) et partagez-les en un clic.
        </p>
      </div>

      {/* Catalogue Principal */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF0DE] text-[#54602F] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-[#2E2C24]">
                  {(catalog?.titre || 'Catalogue principal')}
                </h2>
                <Badge variant="success" size="sm">Actif</Badge>
              </div>
              <p className="text-xs text-[#726C5C] mt-0.5">
                {products.length} articles • {(catalog?.vues ?? 0)} vues
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} className="text-xs">
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-[#3F7D4F]" /> Copié !
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copier le lien
                </>
              )}
            </Button>

            <a
              href={whatsAppShareLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-[#E8F8EE] text-[#1E7E34] border border-[#BDEBD0] hover:bg-[#d5f3df]"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
              <span>Partager sur WhatsApp</span>
            </a>

            <a
              href={`/c/${profile.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl bg-[#6B7A3D] text-white hover:bg-[#54602F]"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Voir la vitrine</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
            </a>
          </div>
        </div>

        <div className="bg-[#F6F1E7] p-3 rounded-xl border border-[#E4DAC4] text-xs space-y-1">
          <p className="text-[#726C5C]">
            <strong>Lien public :</strong> <span className="text-[#2E2C24] break-all">{publicUrl}</span>
          </p>
          <p className="text-[#726C5C]">
            <strong>Description :</strong>{' '}
            {catalog?.description || 'Aucune description pour le moment.'}
          </p>
        </div>

        {error ? (
          <p
            role="alert"
            className="text-xs text-[#B00020] bg-[#FCEBEC] border border-[#F5C6CB] rounded-xl px-3 py-2"
          >
            {error}
          </p>
        ) : null}

        {catalog ? (
          isEditing ? (
            <form
              onSubmit={handleSaveCatalog}
              className="space-y-3 pt-3 border-t border-[#E4DAC4]/60"
            >
              <Input
                label="Titre du catalogue"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                required
              />

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#726C5C]">
                  Description affichée sur la vitrine
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Nouvelle collection rentrée scolaire, livraison sur Douala."
                  className="w-full bg-[#FBF8F2] border border-[#E4DAC4] rounded-xl p-3 text-sm text-[#2E2C24] placeholder-[#9B9484] focus:outline-none focus:border-[#6B7A3D]"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                  <Check className="w-3.5 h-3.5 mr-1" /> Enregistrer
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setTitre(catalog.titre);
                    setDescription(catalog.description ?? '');
                    setError(null);
                  }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-xs"
            >
              Modifier le titre et la description
            </Button>
          )
        ) : null}
      </Card>
    </div>
  );
};
