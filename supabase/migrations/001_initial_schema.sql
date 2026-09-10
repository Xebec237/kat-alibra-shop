-- ==============================================================================
-- KAT — Migration Initiale Supabase (PostgreSQL + RLS + Triggers + Storage)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SEQUENCES
CREATE SEQUENCE IF NOT EXISTS order_reference_seq START 1001;

-- 3. TABLES

-- Profiles (Boutiques Marchands liées à auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    nom_boutique TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    whatsapp_number TEXT NOT NULL, -- Format international sans '+' ni espaces (ex: '237690000000')
    description TEXT,
    devise TEXT DEFAULT 'FCFA' NOT NULL,
    plan TEXT DEFAULT 'free' NOT NULL, -- 'free', 'pro', 'business'
    adresse TEXT,
    ville TEXT DEFAULT 'Douala',
    pays TEXT DEFAULT 'Cameroun',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Catégories par boutique
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    nom TEXT NOT NULL,
    ordre INTEGER DEFAULT 0 NOT NULL,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Produits
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    nom TEXT NOT NULL,
    description TEXT,
    prix NUMERIC(12, 2) NOT NULL CHECK (prix >= 0),
    prix_promo NUMERIC(12, 2) CHECK (prix_promo IS NULL OR prix_promo < prix),
    images TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    stock INTEGER DEFAULT 10 NOT NULL CHECK (stock >= 0),
    en_stock BOOLEAN DEFAULT true NOT NULL,
    actif BOOLEAN DEFAULT true NOT NULL,
    -- Variantes et métadonnées vitrine (utilisées par ProductCard / ProductDetailsModal)
    sizes TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    colors JSONB DEFAULT '[]'::JSONB NOT NULL, -- [{ "name": "Rouge", "hex": "#B00020" }]
    rating NUMERIC(2, 1) CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5)),
    reviews_count INTEGER DEFAULT 0 NOT NULL CHECK (reviews_count >= 0),
    discount_percent INTEGER CHECK (discount_percent IS NULL OR (discount_percent >= 0 AND discount_percent <= 100)),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Catalogues (liens publics partageables)
CREATE TABLE IF NOT EXISTS public.catalogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    titre TEXT NOT NULL,
    slug_public TEXT UNIQUE NOT NULL,
    description TEXT,
    produits_ids UUID[] DEFAULT '{}'::UUID[] NOT NULL,
    template TEXT DEFAULT 'standard' NOT NULL,
    actif BOOLEAN DEFAULT true NOT NULL,
    vues INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Clients
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    nom TEXT NOT NULL,
    telephone TEXT NOT NULL,
    adresse TEXT,
    ville TEXT,
    commandes_count INTEGER DEFAULT 0 NOT NULL,
    total_depense NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(store_id, telephone)
);

-- Commandes
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    catalog_id UUID REFERENCES public.catalogs(id) ON DELETE SET NULL,
    reference TEXT NOT NULL UNIQUE,
    statut TEXT DEFAULT 'envoyee_whatsapp' NOT NULL CHECK (statut IN ('brouillon', 'envoyee_whatsapp', 'confirmee', 'payee', 'livree', 'annulee')),
    total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
    mode_paiement TEXT DEFAULT 'a_la_livraison' NOT NULL, -- 'a_la_livraison', 'mobile_money', 'carte'
    nom_client TEXT NOT NULL,
    telephone_client TEXT NOT NULL,
    adresse_livraison TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Lignes de commande (Order Items)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    nom_produit TEXT NOT NULL,
    -- Variante choisie au panier : sans ces colonnes l'info serait perdue à la commande
    taille TEXT,
    couleur TEXT,
    quantite INTEGER DEFAULT 1 NOT NULL CHECK (quantite > 0),
    prix_unitaire NUMERIC(12, 2) NOT NULL CHECK (prix_unitaire >= 0),
    total_ligne NUMERIC(12, 2) NOT NULL CHECK (total_ligne >= 0),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Paiements (Transactions)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    provider TEXT NOT NULL, -- 'cinetpay', 'notchpay', 'pawapay', 'cash'
    statut TEXT DEFAULT 'en_attente' NOT NULL CHECK (statut IN ('en_attente', 'succes', 'echoue', 'rembourse')),
    reference_externe TEXT,
    montant NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. FONCTIONS ET TRIGGERS

-- Auto-génération de la référence de commande (ex: 'KAT-01001')
CREATE OR REPLACE FUNCTION public.generate_order_reference()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.reference IS NULL OR NEW.reference = '' THEN
        NEW.reference := 'KAT-' || LPAD(nextval('order_reference_seq')::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_generate_order_reference ON public.orders;
CREATE TRIGGER tr_generate_order_reference
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.generate_order_reference();

-- Mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS tr_products_updated_at ON public.products;
CREATE TRIGGER tr_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS tr_catalogs_updated_at ON public.catalogs;
CREATE TRIGGER tr_catalogs_updated_at BEFORE UPDATE ON public.catalogs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS tr_customers_updated_at ON public.customers;
CREATE TRIGGER tr_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS tr_orders_updated_at ON public.orders;
CREATE TRIGGER tr_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Création automatique de profil lors de l'inscription auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    store_name TEXT;
    store_slug TEXT;
    phone TEXT;
BEGIN
    store_name := COALESCE(NEW.raw_user_meta_data->>'nom_boutique', 'Ma Boutique');
    phone := COALESCE(NEW.raw_user_meta_data->>'whatsapp_number', '237600000000');
    store_slug := LOWER(REGEXP_REPLACE(store_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING(NEW.id::TEXT, 1, 6);

    INSERT INTO public.profiles (user_id, nom_boutique, slug, whatsapp_number)
    VALUES (NEW.id, store_name, store_slug, phone)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. ROW LEVEL SECURITY (RLS)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Politiques Profiles
DROP POLICY IF EXISTS "Les marchands gèrent leur profil" ON public.profiles;
CREATE POLICY "Les marchands gèrent leur profil" ON public.profiles
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Lecture publique des profils pour vitrine" ON public.profiles;
CREATE POLICY "Lecture publique des profils pour vitrine" ON public.profiles
    FOR SELECT USING (true);

-- Politiques Categories
DROP POLICY IF EXISTS "Les marchands gèrent leurs catégories" ON public.categories;
CREATE POLICY "Les marchands gèrent leurs catégories" ON public.categories
    FOR ALL USING (store_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
    WITH CHECK (store_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Lecture publique des catégories" ON public.categories;
CREATE POLICY "Lecture publique des catégories" ON public.categories
    FOR SELECT USING (true);

-- Politiques Products
DROP POLICY IF EXISTS "Les marchands gèrent leurs produits" ON public.products;
CREATE POLICY "Les marchands gèrent leurs produits" ON public.products
    FOR ALL USING (store_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
    WITH CHECK (store_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Lecture publique des produits actifs" ON public.products;
CREATE POLICY "Lecture publique des produits actifs" ON public.products
    FOR SELECT USING (actif = true);

-- Politiques Catalogs
DROP POLICY IF EXISTS "Les marchands gèrent leurs catalogues" ON public.catalogs;
CREATE POLICY "Les marchands gèrent leurs catalogues" ON public.catalogs
    FOR ALL USING (store_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
    WITH CHECK (store_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Lecture publique des catalogues actifs" ON public.catalogs;
CREATE POLICY "Lecture publique des catalogues actifs" ON public.catalogs
    FOR SELECT USING (actif = true);

-- Politiques Customers
DROP POLICY IF EXISTS "Les marchands voient leurs clients" ON public.customers;
CREATE POLICY "Les marchands voient leurs clients" ON public.customers
    FOR ALL USING (store_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
    WITH CHECK (store_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Insertion publique de clients lors d'une commande" ON public.customers;
CREATE POLICY "Insertion publique de clients lors d'une commande" ON public.customers
    FOR INSERT WITH CHECK (true);

-- Politiques Orders
DROP POLICY IF EXISTS "Les marchands gèrent leurs commandes" ON public.orders;
CREATE POLICY "Les marchands gèrent leurs commandes" ON public.orders
    FOR ALL USING (store_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
    WITH CHECK (store_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Création publique de commande" ON public.orders;
CREATE POLICY "Création publique de commande" ON public.orders
    FOR INSERT WITH CHECK (true);

-- NOTE SÉCURITÉ : pas de policy SELECT publique sur orders.
-- Un `FOR SELECT USING (true)` permettrait à n'importe qui disposant de la clé
-- anon (publique par nature) de lire nom, téléphone et adresse de livraison de
-- TOUS les clients de TOUTES les boutiques. Le suivi de commande côté client
-- devra passer par une route serveur utilisant la clé service_role.

-- Politiques Order Items
DROP POLICY IF EXISTS "Les marchands voient les lignes de commande" ON public.order_items;
CREATE POLICY "Les marchands voient les lignes de commande" ON public.order_items
    FOR ALL USING (order_id IN (SELECT id FROM public.orders WHERE store_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));

DROP POLICY IF EXISTS "Création publique de lignes de commande" ON public.order_items;
CREATE POLICY "Création publique de lignes de commande" ON public.order_items
    FOR INSERT WITH CHECK (true);

-- Politiques Payments
DROP POLICY IF EXISTS "Les marchands voient les paiements de leurs commandes" ON public.payments;
CREATE POLICY "Les marchands voient les paiements de leurs commandes" ON public.payments
    FOR ALL USING (order_id IN (SELECT id FROM public.orders WHERE store_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));

-- 6. CONFIGURATION STORAGE (BUCKET POUR IMAGES DE PRODUITS)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Accès public en lecture aux images" ON storage.objects;
CREATE POLICY "Accès public en lecture aux images" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Upload d'images par marchands authentifiés" ON storage.objects;
CREATE POLICY "Upload d'images par marchands authentifiés" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Suppression d'images par marchands authentifiés" ON storage.objects;
CREATE POLICY "Suppression d'images par marchands authentifiés" ON storage.objects
    FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
