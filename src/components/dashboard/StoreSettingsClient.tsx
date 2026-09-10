'use client';

import React, { useState } from 'react';
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
