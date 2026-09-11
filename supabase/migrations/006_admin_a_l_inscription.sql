-- ==============================================================================
-- KAT — Attribution automatique du rôle d'administrateur à l'inscription
-- ==============================================================================
--
-- Une seule adresse devient administratrice en s'inscrivant. Toutes les autres
-- créent une boutique ordinaire. Les administrateurs supplémentaires se nomment
-- ensuite depuis le tableau, un par un.
--
-- La liste vit dans une table plutôt qu'en dur dans la fonction : ajouter une
-- adresse devient une ligne à insérer, pas une migration à écrire.
-- ==============================================================================

-- 1. ADRESSES ADMINISTRATRICES
CREATE TABLE IF NOT EXISTS public.admin_emails (
    email TEXT PRIMARY KEY,
    ajoute_le TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Aucune policy en lecture : cette table ne doit jamais transiter vers un
-- navigateur. Seules les fonctions SECURITY DEFINER la consultent.
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

INSERT INTO public.admin_emails (email)
VALUES ('sandrinefoko3@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- 2. CRÉATION DE PROFIL, AVEC RÔLE ÉVENTUEL
-- Reprend la fonction d'origine en y ajoutant la seule nouveauté : le marqueur
-- est_admin, posé quand l'adresse figure dans la liste.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    store_name TEXT;
    store_slug TEXT;
    phone TEXT;
    v_admin BOOLEAN;
BEGIN
    store_name := COALESCE(NEW.raw_user_meta_data->>'nom_boutique', 'Ma Boutique');
    phone := COALESCE(NEW.raw_user_meta_data->>'whatsapp_number', '237600000000');
    store_slug := LOWER(REGEXP_REPLACE(store_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING(NEW.id::TEXT, 1, 6);

    -- Comparaison insensible à la casse : une adresse saisie en majuscules
    -- désigne le même compte, et refuser le rôle sur ce détail serait opaque.
    SELECT EXISTS (
        SELECT 1 FROM public.admin_emails a
        WHERE lower(a.email) = lower(NEW.email)
    ) INTO v_admin;

    INSERT INTO public.profiles (user_id, nom_boutique, slug, whatsapp_number, est_admin)
    VALUES (NEW.id, store_name, store_slug, phone, v_admin)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RATTRAPAGE
-- Si le compte existe déjà, il reçoit le rôle sans avoir à se réinscrire.
UPDATE public.profiles p
   SET est_admin = true
  FROM auth.users u
 WHERE p.user_id = u.id
   AND lower(u.email) IN (SELECT lower(email) FROM public.admin_emails);
