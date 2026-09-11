-- ==============================================================================
-- KAT — Nommer et révoquer les administrateurs depuis l'interface
-- ==============================================================================
--
-- Le marqueur est_admin ne se posait qu'en SQL. Cette fonction permet de le
-- confier depuis le tableau d'administration, avec les mêmes garanties : le
-- contrôle vit dans la base, un appel forgé ne passe pas.
--
-- Le corps est délimité par $fn$ plutôt que par $$ : un éditeur qui découpe le
-- script sur les points-virgules peut se tromper sur un délimiteur anonyme et
-- signaler une erreur de syntaxe sur DECLARE. Un marqueur nommé lève l'ambiguïté.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.admin_definir_role(
    p_profile_id UUID,
    p_admin BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
    v_mon_profil UUID;
    v_nb_admins INT;
BEGIN
    SELECT p.id INTO v_mon_profil
      FROM public.profiles p
     WHERE p.user_id = auth.uid() AND p.est_admin = true;

    IF v_mon_profil IS NULL THEN
        RAISE EXCEPTION 'Acces reserve aux administrateurs';
    END IF;

    -- Se retirer soi-meme le role est presque toujours une erreur de clic, et
    -- la consequence est immediate : perte de l'acces au tableau. Un autre
    -- administrateur peut le faire a sa place.
    IF p_profile_id = v_mon_profil THEN
        RAISE EXCEPTION 'Vous ne pouvez pas modifier votre propre role';
    END IF;

    IF p_admin = false THEN
        SELECT count(*) INTO v_nb_admins
          FROM public.profiles
         WHERE est_admin = true;

        -- Retirer le dernier administrateur fermerait la porte a tout le monde,
        -- y compris a celui qui execute la requete.
        IF v_nb_admins <= 1 THEN
            RAISE EXCEPTION 'Impossible de retirer le dernier administrateur';
        END IF;
    END IF;

    UPDATE public.profiles
       SET est_admin = p_admin
     WHERE id = p_profile_id;
END;
$fn$;

REVOKE ALL ON FUNCTION public.admin_definir_role(UUID, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_definir_role(UUID, BOOLEAN) TO authenticated;
