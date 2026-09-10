-- ==============================================================================
-- KAT — Fonctions appelables par la vitrine publique
-- ==============================================================================
--
-- La vitrine est consultée par des visiteurs non authentifiés. Deux écritures
-- leur sont pourtant nécessaires : tenir le fichier client à jour et compter
-- les vues du catalogue. Les policies RLS l'interdisent à juste titre — laisser
-- `customers` en écriture libre exposerait le fichier client de toutes les
-- boutiques.
--
-- On passe donc par des fonctions SECURITY DEFINER au périmètre étroit : elles
-- s'exécutent avec les droits du propriétaire, ne font qu'une chose, et ne
-- renvoient jamais de données d'un autre marchand. C'est ce qui permet de se
-- passer entièrement de la clé service_role côté serveur applicatif.
-- ==============================================================================

-- 1. FICHE CLIENT
-- Crée le client ou incrémente son historique. Un même numéro qui recommande
-- ne produit pas de doublon (contrainte UNIQUE(store_id, telephone)).
CREATE OR REPLACE FUNCTION public.record_order_customer(
    p_store_id UUID,
    p_nom TEXT,
    p_telephone TEXT,
    p_adresse TEXT,
    p_total NUMERIC
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_customer_id UUID;
BEGIN
    IF p_store_id IS NULL OR p_telephone IS NULL OR btrim(p_telephone) = '' THEN
        RETURN NULL;
    END IF;

    -- La boutique doit exister : sans ce contrôle, un appelant pourrait semer
    -- des fiches clients rattachées à un store_id inventé.
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_store_id) THEN
        RETURN NULL;
    END IF;

    INSERT INTO public.customers AS c (
        store_id, nom, telephone, adresse, commandes_count, total_depense
    )
    VALUES (
        p_store_id,
        COALESCE(NULLIF(btrim(p_nom), ''), 'Client'),
        btrim(p_telephone),
        NULLIF(btrim(COALESCE(p_adresse, '')), ''),
        1,
        GREATEST(COALESCE(p_total, 0), 0)
    )
    ON CONFLICT (store_id, telephone) DO UPDATE
        SET nom             = EXCLUDED.nom,
            adresse         = COALESCE(EXCLUDED.adresse, c.adresse),
            commandes_count = c.commandes_count + 1,
            total_depense   = c.total_depense + EXCLUDED.total_depense,
            updated_at      = now()
    RETURNING c.id INTO v_customer_id;

    RETURN v_customer_id;
END;
$$;

REVOKE ALL ON FUNCTION public.record_order_customer(UUID, TEXT, TEXT, TEXT, NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_order_customer(UUID, TEXT, TEXT, TEXT, NUMERIC) TO anon, authenticated;

-- 2. COMPTEUR DE VUES
-- Incrémente et ne renvoie rien : aucune information ne fuit vers l'appelant.
CREATE OR REPLACE FUNCTION public.increment_catalog_views(p_catalog_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.catalogs
       SET vues = vues + 1
     WHERE id = p_catalog_id
       AND actif = true;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_catalog_views(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_catalog_views(UUID) TO anon, authenticated;
