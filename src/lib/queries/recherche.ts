import { createPublicServerClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import type { Product } from '@/lib/supabase/types';

export interface BoutiqueTrouvee {
  nom_boutique: string;
  slug: string;
  ville: string | null;
  logo_url: string | null;
  description: string | null;
  nb_articles: number;
}

export interface ArticleTrouve extends Product {
  boutique: {
    nom_boutique: string;
    slug: string;
    ville: string | null;
    whatsapp_number: string;
  };
  /** Prix réellement payé : la promo si elle existe, le prix sinon. */
  prix_effectif: number;
}

export interface Resultats {
  boutiques: BoutiqueTrouvee[];
  articles: ArticleTrouve[];
  /** Nombre de boutiques distinctes proposant un article correspondant. */
  nbBoutiquesVendeuses: number;
}

const VIDE: Resultats = { boutiques: [], articles: [], nbBoutiquesVendeuses: 0 };

/**
 * `%` et `_` sont des jokers en SQL LIKE : une recherche « 100% coton » les
 * interpréterait au lieu de les chercher. On les neutralise avant la requête.
 */
function echapper(terme: string): string {
  return terme.replace(/[%_\\]/g, (c) => `\\${c}`);
}

/**
 * Recherche publique sur toute la plateforme.
 *
 * Lecture anonyme : `profiles` est ouvert et `products` ne l'est que pour les
 * articles actifs, ce qui est exactement le périmètre voulu — un article masqué
 * par son marchand ne doit apparaître nulle part.
 *
 * Les articles sont triés par prix croissant : l'intérêt d'une place de marché
 * est de comparer, autant présenter d'emblée l'offre la moins chère.
 */
export async function rechercher(terme: string): Promise<Resultats> {
  const q = terme.trim();
  if (!isSupabaseConfigured || q.length < 2) return VIDE;

  try {
    const supabase = createPublicServerClient();
    if (!supabase) return VIDE;

    const motif = `%${echapper(q)}%`;

    const [boutiquesRes, articlesRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('nom_boutique, slug, ville, logo_url, description')
        .ilike('nom_boutique', motif)
        .limit(12),
      supabase
        .from('products')
        .select(
          'id, store_id, category_id, nom, description, prix, prix_promo, images, stock, en_stock, actif, sizes, colors, rating, reviews_count, discount_percent, created_at, updated_at, profiles!inner(nom_boutique, slug, ville, whatsapp_number)'
        )
        .eq('actif', true)
        .or(`nom.ilike.${motif},description.ilike.${motif}`)
        .limit(60),
    ]);

    type Ligne = Product & {
      profiles: {
        nom_boutique: string;
        slug: string;
        ville: string | null;
        whatsapp_number: string;
      };
    };

    const articles: ArticleTrouve[] = ((articlesRes.data as Ligne[] | null) ?? [])
      .map(({ profiles, ...p }) => ({
        ...p,
        boutique: profiles,
        prix_effectif: p.prix_promo && p.prix_promo > 0 ? p.prix_promo : p.prix,
      }))
      .sort((a, b) => a.prix_effectif - b.prix_effectif);

    // Compte des articles par boutique, pour situer chaque enseigne trouvée.
    const slugsTrouves = ((boutiquesRes.data as BoutiqueTrouvee[] | null) ?? []).map(
      (b) => b.slug
    );

    const comptes: Record<string, number> = {};
    if (slugsTrouves.length > 0) {
      const { data: leursArticles } = await supabase
        .from('products')
        .select('store_id, profiles!inner(slug)')
        .eq('actif', true);

      ((leursArticles as { profiles: { slug: string } }[] | null) ?? []).forEach((l) => {
        const s = l.profiles?.slug;
        if (s) comptes[s] = (comptes[s] || 0) + 1;
      });
    }

    const boutiques: BoutiqueTrouvee[] = (
      (boutiquesRes.data as Omit<BoutiqueTrouvee, 'nb_articles'>[] | null) ?? []
    ).map((b) => ({ ...b, nb_articles: comptes[b.slug] ?? 0 }));

    return {
      boutiques,
      articles,
      nbBoutiquesVendeuses: new Set(articles.map((a) => a.boutique.slug)).size,
    };
  } catch {
    return VIDE;
  }
}
