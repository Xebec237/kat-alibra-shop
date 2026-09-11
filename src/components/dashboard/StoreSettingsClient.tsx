'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { PALETTE, getTeinte } from '@/lib/theme/palette';
import { uploadLookbookMedia, uploadStoreLogo } from '@/lib/supabase/storage';
import { Store, Phone, Check, Globe, MapPin, DollarSign, Image as ImageIcon } from 'lucide-react';
import { Profile } from '@/lib/supabase/types';
import { updateProfile } from '@/lib/actions/profile';
import { cleanWhatsAppNumber } from '@/lib/utils/formatters';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface StoreSettingsClientProps {
  profile: Profile;
}

export const StoreSettingsClient: React.FC<StoreSettingsClientProps> = ({ profile }) => {
  const [nomBoutique, setNomBoutique] = useState(profile.nom_boutique);
  const [slug, setSlug] = useState(profile.slug);
  const [whatsappNumber, setWhatsappNumber] = useState(profile.whatsapp_number);
  const [description, setDescription] = useState(profile.description || '');
  const [ville, setVille] = useState(profile.ville || 'Douala');
  const [adresse, setAdresse] = useState(profile.adresse || '');
  const [devise, setDevise] = useState(profile.devise || 'FCFA');
  const [logoUrl, setLogoUrl] = useState(profile.logo_url);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [couleur, setCouleur] = useState(profile.couleur_theme || 'olive');
  const [mediaUrl, setMediaUrl] = useState(profile.lookbook_media_url);
  const [mediaType, setMediaType] = useState(profile.lookbook_media_type);
  const [isUploading, setIsUploading] = useState(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const [isSaved, setIsSaved] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const cleanedPhone = cleanWhatsAppNumber(whatsappNumber);
    setWhatsappNumber(cleanedPhone);

    const result = await updateProfile({
      nom_boutique: nomBoutique,
      slug,
      whatsapp_number: cleanedPhone,
      description,
      ville,
      adresse,
      devise,
      logo_url: logoUrl,
      couleur_theme: couleur,
      lookbook_media_url: mediaUrl,
      lookbook_media_type: mediaType,
    });

    setIsSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#2E2C24]">
          Paramètres de la Boutique
        </h1>
        <p className="text-xs sm:text-sm text-[#726C5C] mt-1">
          Personnalisez votre vitrine publique et configurez le numéro WhatsApp récepteur des commandes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identité de la boutique */}
        <Card className="space-y-4">
          <h2 className="font-bold text-sm text-[#2E2C24] font-display border-b border-[#E4DAC4]/60 pb-2">
            1. Identité & Visibilité
          </h2>

          {/* Photo de profil */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-[#E4DAC4] bg-[#F6F1E7] shrink-0">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Logo de la boutique"
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                // Mêmes initiales que la vitrine : le marchand voit tout de
                // suite ce que ses clients ont sous les yeux sans logo.
                <div className="w-full h-full flex items-center justify-center bg-[#EBF0DE] text-[#54602F] font-bold text-xl font-display">
                  {(nomBoutique || 'KA').substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0 space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#726C5C]">
                Photo de la boutique
              </p>
              <p className="text-[11px] text-[#9B9484] leading-relaxed">
                Affichée en tête de votre vitrine et dans les résultats de
                recherche. Carrée de préférence — 2 Mo maximum.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={isUploadingLogo}
                  className="px-3.5 py-1.5 rounded-full bg-[#6B7A3D] text-white text-xs font-bold hover:bg-[#54602F] transition-colors disabled:opacity-50"
                >
                  {isUploadingLogo
                    ? 'Envoi…'
                    : logoUrl
                      ? 'Changer la photo'
                      : 'Ajouter une photo'}
                </button>

                {logoUrl ? (
                  <button
                    type="button"
                    onClick={() => setLogoUrl(null)}
                    className="px-3.5 py-1.5 rounded-full bg-[#FBF8F2] border border-[#E4DAC4] text-[#726C5C] text-xs font-bold hover:text-[#B4553C] hover:border-[#F5C6CB] transition-colors"
                  >
                    Retirer
                  </button>
                ) : null}
              </div>
            </div>

            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                setIsUploadingLogo(true);
                setError(null);

                const res = await uploadStoreLogo(file, profile.id);
                setIsUploadingLogo(false);
                if (logoInputRef.current) logoInputRef.current.value = '';

                if (!res.ok) {
                  setError(res.error);
                  return;
                }

                setLogoUrl(res.url);
              }}
            />
          </div>

          <Input
            label="Nom de la boutique *"
            value={nomBoutique}
            onChange={(e) => {
              setNomBoutique(e.target.value);
              // Auto-génère un slug si besoin
              setSlug(
                e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/(^-|-$)+/g, '')
              );
            }}
            required
            leftIcon={<Store className="w-4 h-4" />}
          />

          <Input
            label="Identifiant unique (Lien public) *"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            helperText={`Votre vitrine sera accessible sur : /c/${slug}`}
            leftIcon={<Globe className="w-4 h-4" />}
            required
          />

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#726C5C]">
              Description & Slogan
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre boutique, vos produits et votre localisation..."
              className="w-full bg-[#FBF8F2] border border-[#E4DAC4] rounded-xl p-3 text-sm text-[#2E2C24] placeholder-[#9B9484] focus:outline-none focus:border-[#6B7A3D]"
            />
          </div>
        </Card>

        {/* Intégration WhatsApp (Clé du produit) */}
        <Card className="space-y-4">
          <h2 className="font-bold text-sm text-[#2E2C24] font-display border-b border-[#E4DAC4]/60 pb-2 flex items-center gap-2">
            <span>2. Numéro WhatsApp pour recevoir les commandes</span>
            <span className="text-[11px] bg-[#E8F8EE] text-[#1E7E34] px-2 py-0.5 rounded-full border border-[#BDEBD0]">
              Indispensable
            </span>
          </h2>

          <Input
            label="Numéro WhatsApp International (sans + ni espaces) *"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            helperText="Exemple pour le Cameroun : 237690123456 (237 suivi de vos 9 chiffres)"
            leftIcon={<Phone className="w-4 h-4" />}
            required
          />

          <div className="p-3 bg-[#F6F1E7] rounded-xl border border-[#E4DAC4] text-xs text-[#726C5C] space-y-1">
            <p className="font-semibold text-[#2E2C24]">💡 Comment ça marche ?</p>
            <p>
              Chaque fois qu&apos;un client clique sur « Commander » sur votre catalogue, un message pré-rempli contenant la référence, ses articles et son adresse est envoyé directement sur ce numéro WhatsApp.
            </p>
          </div>
        </Card>

        {/* Localisation et Devise */}
        <Card className="space-y-4">
          <h2 className="font-bold text-sm text-[#2E2C24] font-display border-b border-[#E4DAC4]/60 pb-2">
            3. Localisation & Devise
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Ville"
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              placeholder="Ex: Douala, Yaoundé, Bafoussam..."
              leftIcon={<MapPin className="w-4 h-4" />}
            />

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#726C5C]">
                Devise d&apos;affichage
              </label>
              <select
                value={devise}
                onChange={(e) => setDevise(e.target.value)}
                className="w-full bg-[#FBF8F2] border border-[#E4DAC4] rounded-xl px-3.5 py-2.5 text-sm text-[#2E2C24] focus:outline-none focus:border-[#6B7A3D]"
              >
                <option value="FCFA">FCFA (Franc CFA)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>

          <Input
            label="Adresse physique ou quartier (optionnel)"
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            placeholder="Ex: Akwa, Rue Prince Bell"
          />
        </Card>

        {/* Apparence de la vitrine */}
        <Card className="space-y-5">
          <h2 className="font-bold text-sm text-[#2E2C24] font-display border-b border-[#E4DAC4]/60 pb-2">
            4. Apparence de votre vitrine
          </h2>

          {/* Nuancier */}
          <div className="space-y-2.5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#726C5C]">
                Couleur de votre boutique
              </p>
              <p className="text-[11px] text-[#9B9484] mt-0.5">
                Elle habille les boutons, les prix et les éléments sélectionnés
                de votre catalogue.
              </p>
            </div>

            {/* Barre continue : chaque segment montre le fond de page que la
                teinte donnera, surmonté d'une pastille de la couleur d'accent.
                Le marchand choisit donc une ambiance complète, pas juste une
                couleur de bouton. */}
            <div className="rounded-2xl overflow-hidden border border-[#E4DAC4] flex">
              {PALETTE.map((t) => {
                const choisie = t.id === couleur;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setCouleur(t.id)}
                    title={t.nom}
                    aria-label={`Couleur ${t.nom}`}
                    aria-pressed={choisie}
                    className="relative flex-1 h-16 flex items-center justify-center transition-all hover:z-10"
                    style={{ backgroundColor: t.fond }}
                  >
                    <span
                      className={`rounded-full flex items-center justify-center transition-all ${
                        choisie ? 'w-8 h-8 ring-2 ring-offset-2' : 'w-5 h-5'
                      }`}
                      style={{
                        backgroundColor: t.principal,
                        ...(choisie
                          ? ({
                              '--tw-ring-color': t.fonce,
                              '--tw-ring-offset-color': t.fond,
                            } as React.CSSProperties)
                          : {}),
                      }}
                    >
                      {choisie ? <Check className="w-4 h-4 text-white" /> : null}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Aperçu de l'ambiance complète : voir le rendu évite d'avoir à
                enregistrer puis ouvrir la vitrine pour juger. */}
            <div
              className="rounded-2xl p-4 border space-y-3"
              style={{
                backgroundColor: getTeinte(couleur).fond,
                borderColor: getTeinte(couleur).bordureSurface,
              }}
            >
              <p className="text-[11px] font-semibold text-[#726C5C]">
                Aperçu de votre vitrine en {getTeinte(couleur).nom.toLowerCase()}
              </p>

              <div
                className="rounded-xl p-3 border flex items-center justify-between gap-3"
                style={{
                  backgroundColor: getTeinte(couleur).surface,
                  borderColor: getTeinte(couleur).bordureSurface,
                }}
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#2E2C24] truncate">
                    {nomBoutique || 'Votre boutique'}
                  </p>
                  <p
                    className="text-sm font-extrabold font-display"
                    style={{ color: getTeinte(couleur).principal }}
                  >
                    10 000 {devise}
                  </p>
                </div>
                <span
                  className="shrink-0 px-4 py-2 rounded-full text-white text-xs font-bold"
                  style={{ backgroundColor: getTeinte(couleur).principal }}
                >
                  Commander
                </span>
              </div>
            </div>
          </div>

          {/* Média du lookbook */}
          <div className="space-y-2.5 pt-1 border-t border-[#E4DAC4]/60">
            <div className="pt-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#726C5C]">
                Visuel de votre lookbook
              </p>
              <p className="text-[11px] text-[#9B9484] mt-0.5">
                Une photo ou une vidéo de 5 secondes maximum, affichée en bannière
                sur votre vitrine. Sans visuel, la bannière garde son habillage
                par défaut.
              </p>
            </div>

            {mediaUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-[#E4DAC4] bg-[#F6F1E7] aspect-[16/7]">
                {mediaType === 'video' ? (
                  <video
                    src={mediaUrl}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <Image src={mediaUrl} alt="" fill sizes="600px" className="object-cover" />
                )}

                <button
                  type="button"
                  onClick={() => {
                    setMediaUrl(null);
                    setMediaType(null);
                  }}
                  className="absolute top-2 right-2 px-3 py-1.5 rounded-full bg-[#2E2C24]/80 text-white text-[11px] font-bold hover:bg-[#2E2C24] transition-colors"
                >
                  Retirer
                </button>

                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-[#2E2C24]/80 text-white text-[10px] font-semibold">
                  {mediaType === 'video' ? 'Vidéo' : 'Photo'}
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => mediaInputRef.current?.click()}
                disabled={isUploading}
                className="w-full rounded-2xl border-2 border-dashed border-[#E4DAC4] bg-[#F6F1E7]/50 py-8 flex flex-col items-center justify-center gap-1.5 text-[#726C5C] hover:border-[#6B7A3D] hover:bg-[#EBF0DE]/40 transition-colors disabled:opacity-50"
              >
                <ImageIcon className="w-6 h-6 text-[#6B7A3D]" />
                <span className="text-xs font-semibold">
                  {isUploading ? 'Envoi en cours…' : 'Choisir une photo ou une vidéo'}
                </span>
                <span className="text-[10px] text-[#9B9484]">
                  JPG, PNG, WebP · MP4, WebM, MOV — 5 s maximum
                </span>
              </button>
            )}

            <input
              ref={mediaInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                setIsUploading(true);
                setError(null);

                const res = await uploadLookbookMedia(file, profile.id);
                setIsUploading(false);
                if (mediaInputRef.current) mediaInputRef.current.value = '';

                if (!res.ok) {
                  setError(res.error);
                  return;
                }

                setMediaUrl(res.url);
                setMediaType(res.type);
              }}
            />

            {mediaUrl ? (
              <p className="text-[11px] text-[#B98A2E] bg-[#FBF3DC] border border-[#EFE0B8] rounded-xl px-3 py-2">
                N&apos;oubliez pas d&apos;enregistrer en bas de page pour appliquer
                ce visuel à votre vitrine.
              </p>
            ) : null}
          </div>
        </Card>

        {error ? (
          <p
            role="alert"
            className="text-xs text-[#B00020] bg-[#FCEBEC] border border-[#F5C6CB] rounded-xl px-3 py-2"
          >
            {error}
          </p>
        ) : null}

        {/* Bouton de sauvegarde */}
        <div className="flex items-center justify-between pt-2">
          {isSaved ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3F7D4F] bg-[#E7F3E9] px-3 py-1.5 rounded-full">
              <Check className="w-4 h-4" /> Paramètres enregistrés avec succès !
            </span>
          ) : <span />}

          <Button type="submit" variant="primary" size="lg" className="px-8" isLoading={isSaving}>
            <Check className="w-4 h-4 mr-2" />
            Enregistrer les modifications
          </Button>
        </div>
      </form>
    </div>
  );
};
