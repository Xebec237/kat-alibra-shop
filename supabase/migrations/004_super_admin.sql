-- ==============================================================================
-- KAT — Tableau de bord super administrateur
-- ==============================================================================
--
-- Le tableau listera les marchands inscrits avec leur email et leur numéro
-- WhatsApp. Ces données sont personnelles : le contrôle d'accès est posé dans la
-- base, pas dans l'application. Un écran protégé côté Next.js se contourne en
-- appelant l'API directement ; une fonction qui vérifie elle-même l'appelant, non.
-- ==============================================================================

-- 1. MARQUEUR D'ADMINISTRATEUR
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS est_admin BOOLEAN NOT NULL DEFAULT false;

-- 2. LISTE DES BOUTIQUES
--
-- SECURITY DEFINER pour lire `auth.users`, inaccessible aux marchands, et pour
-- traverser les policies de `profiles`. La première instruction du corps vérifie
-- que l'appelant est administrateur — sans elle, n'importe quel marchand
-- connecté obtiendrait l'annuaire complet de la plateforme.
CREATE OR REPLACE FUNCTION public.admin_liste_boutiques()
RETURNS TABLE (
    id UUID,
    nom_boutique TEXT,
    slug TEXT,
    email TEXT,
    whatsapp_number TEXT,
    ville TEXT,
    logo_url TEXT,
    est_admin BOOLEAN,
    inscrit_le TIMESTAMPTZ,
    derniere_connexion TIMESTAMPTZ,
    email_confirme BOOLEAN,
    nb_articles BIGINT,
    nb_commandes BIGINT,
    total_ventes NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid() AND p.est_admin = true
    ) THEN
        RAISE EXCEPTION 'Accès réservé aux administrateurs';
    END IF;

    RETURN QUERY
    SELECT
        p.id,
        p.nom_boutique,
        p.slug,
        u.email::TEXT,
        p.whatsapp_number,
        p.ville,
        p.logo_url,
        p.est_admin,
        p.created_at,
        u.last_sign_in_at,
        (u.email_confirmed_at IS NOT NULL),
        (SELECT count(*) FROM public.products pr WHERE pr.store_id = p.id),
        (SELECT count(*) FROM public.orders o WHERE o.store_id = p.id),
        -- Seules les commandes abouties comptent : inclure les annulées
        -- gonflerait artificiellement le chiffre d'affaires de la plateforme.
        COALESCE((
            SELECT sum(o.total) FROM public.orders o
            WHERE o.store_id = p.id AND o.statut <> 'annulee'
        ), 0)
    FROM public.profiles p
    LEFT JOIN auth.users u ON u.id = p.user_id
    ORDER BY p.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_liste_boutiques() FROM PUBLIC;
-- Pas de droit pour `anon` : un visiteur non connecté n'a rien à faire ici, et
-- `auth.uid()` serait NULL de toute façon.
GRANT EXECUTE ON FUNCTION public.admin_liste_boutiques() TO authenticated;

-- 3. DÉSIGNATION DU PREMIER ADMINISTRATEUR
UPDATE public.profiles
   SET est_admin = true
 WHERE user_id = (
     SELECT id FROM auth.users WHERE email = 'sandrinefoko3@gmail.com'
 );
