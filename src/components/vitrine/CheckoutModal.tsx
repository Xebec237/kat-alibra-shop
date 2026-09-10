'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { MessageCircle, CheckCircle2, Phone, User, MapPin, FileText, ArrowRight, ExternalLink } from 'lucide-react';
import { Profile, Catalog } from '@/lib/supabase/types';
import { useCart } from '@/lib/context/CartContext';
import { formatPrice } from '@/lib/utils/formatters';
import { generateWhatsAppLink, OrderDetails } from '@/lib/whatsapp/generateOrderMessage';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  catalog?: Catalog;
  currency?: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  profile,
  catalog,
  currency = 'FCFA',
}) => {
  const { items, totalAmount, clearCart } = useCart();
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ nom?: string; telephone?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<{
    reference: string;
    whatsAppLink: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: { nom?: string; telephone?: string } = {};
    if (!nom.trim() || nom.trim().length < 2) {
      newErrors.nom = 'Veuillez saisir votre nom complet';
    }
    if (!telephone.trim() || telephone.trim().length < 8) {
      newErrors.telephone = 'Veuillez saisir un numéro de téléphone valide';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      // 1. Génération de référence courte (ex: KAT-10482)
      const randomId = Math.floor(10000 + Math.random() * 90000);
      const reference = `KAT-${randomId}`;

      const orderDetails: OrderDetails = {
        reference,
        storeName: profile.nom_boutique,
        merchantPhone: profile.whatsapp_number,
        customerName: nom.trim(),
        customerPhone: telephone.trim(),
        deliveryAddress: adresse.trim() || undefined,
        notes: notes.trim() || undefined,
        items,
        totalAmount,
        currency,
      };

      // 2. Appel API route pour enregistrer la commande dans Supabase
      try {
        await fetch('/api/commandes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            store_id: profile.id,
            catalog_id: catalog?.id || null,
            reference,
            nom_client: nom.trim(),
            telephone_client: telephone.trim(),
            adresse_livraison: adresse.trim() || null,
            notes: notes.trim() || null,
            total: totalAmount,
            mode_paiement: 'a_la_livraison',
            statut: 'envoyee_whatsapp',
            items: items.map((i) => ({
              product_id: i.product_id ?? null,
              nom_produit: i.nom,
              taille: i.taille ?? null,
              couleur: i.couleur ?? null,
              quantite: i.quantite,
              prix_unitaire: i.prix_promo && i.prix_promo > 0 ? i.prix_promo : i.prix,
              total_ligne: (i.prix_promo && i.prix_promo > 0 ? i.prix_promo : i.prix) * i.quantite,
            })),
          }),
        });
      } catch (err) {
        console.warn('Sauvegarde serveur locale:', err);
      }

      // 3. Construction du lien WhatsApp
      const whatsAppLink = generateWhatsAppLink(orderDetails);

      // 4. Déclenchement de confettis festifs
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#6B7A3D', '#3F7D4F', '#B98A2E', '#F6F1E7'],
        });
      } catch (e) {
        // Ignorer si non supporté
      }

      setCompletedOrder({ reference, whatsAppLink });
      clearCart();

      // 5. Redirection automatique vers WhatsApp
      setTimeout(() => {
        window.open(whatsAppLink, '_blank');
      }, 500);
    } catch (error) {
      console.error('Erreur commande:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCompletedOrder(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={completedOrder ? 'Commande Enregistrée !' : 'Finaliser la commande'}
      description={
        completedOrder
          ? 'Votre commande a été préparée avec succès pour WhatsApp.'
          : 'Renseignez vos coordonnées pour envoyer votre commande au marchand.'
      }
    >
      {completedOrder ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#E7F3E9] text-[#3F7D4F] border border-[#C6E6CB] mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-[#726C5C] font-semibold">
              Référence Commande
            </p>
            <p className="text-2xl font-bold font-display text-[#2E2C24]">
              {completedOrder.reference}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-[#726C5C] bg-[#F6F1E7] p-3 rounded-xl border border-[#E4DAC4]">
            WhatsApp s&apos;ouvre automatiquement pour transmettre votre panier directement à{' '}
            <strong>{profile.nom_boutique}</strong>. Si rien ne se passe, cliquez sur le bouton ci-dessous :
          </p>

          <div className="pt-2 space-y-2">
            <a
              href={completedOrder.whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-[#25D366] text-white font-bold text-sm hover:bg-[#20bd5a] shadow-sm transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Ouvrir dans WhatsApp</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <Button variant="ghost" size="md" onClick={handleClose} className="w-full">
              Fermer et retourner au catalogue
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Récapitulatif condensé */}
          <div className="bg-[#F6F1E7] p-3 rounded-xl border border-[#E4DAC4] flex items-center justify-between text-xs">
            <span className="text-[#726C5C]">
              Total ({items.length} {items.length > 1 ? 'articles distincts' : 'article'}) :
            </span>
            <span className="font-bold text-sm text-[#2E2C24]">
              {formatPrice(totalAmount, currency)}
            </span>
          </div>

          {/* Champs client */}
          <Input
            label="Votre Nom complet *"
            placeholder="Ex: Mireille Kamga"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            error={errors.nom}
            leftIcon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label="Numéro WhatsApp / Téléphone *"
            placeholder="Ex: 690 00 00 00"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            error={errors.telephone}
            helperText="Le commerçant vous contactera sur ce numéro pour la livraison."
            leftIcon={<Phone className="w-4 h-4" />}
            required
          />

          <Input
            label="Ville & Quartier de livraison (optionnel)"
            placeholder="Ex: Douala, Akwa (face glacier moderne)"
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            leftIcon={<MapPin className="w-4 h-4" />}
          />

          <Input
            label="Instructions particulières (optionnel)"
            placeholder="Ex: Livraison après 16h, appeler à l'arrivée..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            leftIcon={<FileText className="w-4 h-4" />}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="whatsapp"
              size="lg"
              isLoading={isSubmitting}
              className="w-full h-12"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              <span>Envoyer la commande sur WhatsApp</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <p className="text-center text-[11px] text-[#726C5C] mt-2">
              🔒 Aucun paiement en ligne requis immédiatement. Vous finalisez les détails avec le marchand sur WhatsApp.
            </p>
          </div>
        </form>
      )}
    </Modal>
  );
};
