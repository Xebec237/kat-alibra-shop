-- ==============================================================================
-- KAT — Personnalisation de la vitrine par le marchand
-- ==============================================================================
--
-- Deux réglages d'apparence, tous deux facultatifs : sans eux la vitrine garde
-- son habillage d'origine. C'est volontaire — un marchand qui ouvre sa boutique
-- doit pouvoir vendre immédiatement sans passer par une étape de décoration.
-- ==============================================================================

-- 1. COULEUR D'ACCENT
-- On stocke l'identifiant d'une teinte du nuancier, pas un code hexadécimal :
-- chaque teinte embarque ses déclinaisons foncée et claire, dont les contrastes
-- ont été vérifiés. Laisser saisir un hexadécimal libre produirait tôt ou tard
-- du texte blanc sur fond jaune pâle.
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS couleur_theme TEXT NOT NULL DEFAULT 'olive';

-- 2. MÉDIA DU LOOKBOOK
-- Image ou courte vidéo mise en avant sur la vitrine et en ouverture du
-- lookbook. NULL = habillage par défaut.
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS lookbook_media_url TEXT;

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS lookbook_media_type TEXT;

-- Le type doit rester lisible par l'application : elle choisit entre <img> et
-- <video> sur cette seule valeur.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'profiles_lookbook_media_type_check'
    ) THEN
        ALTER TABLE public.profiles
            ADD CONSTRAINT profiles_lookbook_media_type_check
            CHECK (lookbook_media_type IS NULL OR lookbook_media_type IN ('image', 'video'));
    END IF;
END $$;

-- Une URL sans type ne serait pas affichable, un type sans URL ne désignerait
-- rien : les deux colonnes vont ensemble ou pas du tout.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'profiles_lookbook_media_coherent'
    ) THEN
        ALTER TABLE public.profiles
            ADD CONSTRAINT profiles_lookbook_media_coherent
            CHECK (
                (lookbook_media_url IS NULL AND lookbook_media_type IS NULL)
                OR (lookbook_media_url IS NOT NULL AND lookbook_media_type IS NOT NULL)
            );
    END IF;
END $$;
