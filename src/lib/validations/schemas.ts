import { z } from 'zod';

export const orderItemSchema = z.object({
  id: z.string(),
  nom: z.string().min(1, 'Le nom du produit est requis'),
  prix: z.number().positive(),
  prix_promo: z.number().nullable().optional(),
  quantite: z.number().int().positive('La quantité doit être supérieure à 0'),
  image: z.string().optional(),
});

export const checkoutFormSchema = z.object({
  nom: z.string().min(2, 'Veuillez saisir votre nom complet (au moins 2 caractères)'),
  telephone: z.string().min(8, 'Veuillez renseigner un numéro de téléphone valide'),
  adresse: z.string().optional(),
  notes: z.string().max(300, 'Note trop longue (max 300 caractères)').optional(),
  modePaiement: z.enum(['a_la_livraison', 'mobile_money', 'carte']).default('a_la_livraison'),
});

export const productFormSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  description: z.string().optional(),
  prix: z.coerce.number().positive('Le prix doit être supérieur à 0'),
  prix_promo: z.coerce.number().positive().nullable().optional(),
  category_id: z.string().optional().nullable(),
  stock: z.coerce.number().int().min(0, 'Le stock ne peut être négatif').default(10),
  en_stock: z.boolean().default(true),
  actif: z.boolean().default(true),
  images: z.array(z.string()).default([]),
});

export const storeSettingsSchema = z.object({
  nom_boutique: z.string().min(2, 'Le nom de la boutique est requis'),
  slug: z.string().min(2, 'Le slug est requis').regex(/^[a-z0-9-]+$/, 'Lettres minuscules, chiffres et tirets uniquement'),
  whatsapp_number: z.string().min(8, 'Numéro WhatsApp obligatoire'),
  description: z.string().optional(),
  ville: z.string().default('Douala'),
  devise: z.string().default('FCFA'),
});
