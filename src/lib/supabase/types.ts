export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Profile {
  id: string;
  user_id: string;
  nom_boutique: string;
  slug: string;
  logo_url: string | null;
  whatsapp_number: string;
  description: string | null;
  devise: string;
  plan: 'free' | 'pro' | 'business';
  adresse: string | null;
  ville: string | null;
  pays: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  store_id: string;
  nom: string;
  ordre: number;
  icon?: string;
  created_at: string;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  store_id: string;
  category_id: string | null;
  nom: string;
  description: string | null;
  prix: number;
  prix_promo: number | null;
  images: string[];
  stock: number;
  en_stock: boolean;
  actif: boolean;
  sizes?: string[];
  colors?: ProductColor[];
  rating?: number;
  reviews_count?: number;
  discount_percent?: number;
  created_at: string;
  updated_at: string;
}

export interface Catalog {
  id: string;
  store_id: string;
  titre: string;
  slug_public: string;
  description: string | null;
  produits_ids: string[];
  template: string;
  actif: boolean;
  vues: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  store_id: string;
  nom: string;
  telephone: string;
  adresse: string | null;
  ville: string | null;
  commandes_count: number;
  total_depense: number;
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | 'brouillon'
  | 'envoyee_whatsapp'
  | 'confirmee'
  | 'payee'
  | 'livree'
  | 'annulee';

export type PaymentMethod = 'a_la_livraison' | 'mobile_money' | 'carte';

export interface Order {
  id: string;
  store_id: string;
  customer_id: string | null;
  catalog_id: string | null;
  reference: string;
  statut: OrderStatus;
  total: number;
  mode_paiement: PaymentMethod;
  nom_client: string;
  telephone_client: string;
  adresse_livraison: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  nom_produit: string;
  taille?: string;
  couleur?: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  provider: 'cinetpay' | 'notchpay' | 'pawapay' | 'cash';
  statut: 'en_attente' | 'succes' | 'echoue' | 'rembourse';
  reference_externe: string | null;
  montant: number;
  created_at: string;
}
