import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { incrementCatalogViews } from '@/lib/actions/catalogs';
import { VitrineClient } from '@/components/vitrine/VitrineClient';
import {
  mockProfile,
  mockCatalog,
  mockCategories,
  mockProducts,
} from '@/lib/mockData';

interface VitrinePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: VitrinePageProps): Promise<Metadata> {
  const { slug } = await params;

  let profile = demoProfileForSlug(slug);
  const catalog = mockCatalog;

  // Sans identifiants Supabase réels, on reste en mode démo : inutile de partir
  // sur le réseau vers un hôte inexistant.
  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data: storeData } = await supabase
        .from('profiles')
        .select('*')
        .eq('slug', slug)
        .single();

      if (storeData) {
        profile = storeData;
      }
    } catch {
      // Utilisation des données par défaut
    }
  }

  const title = `${profile.nom_boutique} — Catalogue en ligne sur KAT`;
  const description =
    catalog.description ||
    profile.description ||
    `Découvrez les articles de ${profile.nom_boutique} et commandez directement sur WhatsApp.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: profile.logo_url ? [{ url: profile.logo_url }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: profile.logo_url ? [profile.logo_url] : [],
    },
  };
}

/**
 * Profil de démonstration personnalisé avec le slug demandé, utilisé quand
 * aucune boutique réelle n'est trouvée (ou que Supabase n'est pas configuré).
 */
function demoProfileForSlug(slug: string) {
  if (slug === 'douala-chic' || slug === 'demo') return mockProfile;

  return {
    ...mockProfile,
    slug,
    nom_boutique: slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' '),
  };
}

export default async function VitrinePage({ params }: VitrinePageProps) {
  const { slug } = await params;

  let profile = demoProfileForSlug(slug);
  let catalog = mockCatalog;
  let categories = mockCategories;
  let products = mockProducts;

  // Mode démo : aucun projet Supabase configuré, on sert directement mockData
  // au lieu d'attendre l'échec réseau d'un hôte qui n'existe pas.
  if (!isSupabaseConfigured) {
    return (
      <VitrineClient
        profile={profile}
        catalog={catalog}
        categories={categories}
        products={products}
      />
    );
  }

  try {
    const supabase = await createClient();

    // 1. Récupération du profil marchand par son slug
    const { data: storeData, error: storeError } = await supabase
      .from('profiles')
      .select('*')
      .eq('slug', slug)
      .single();

    if (storeData && !storeError) {
      profile = storeData;

      // 2. Récupération des catégories
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .eq('store_id', profile.id)
        .order('ordre', { ascending: true });

      if (catData && catData.length > 0) {
        categories = catData;
      }

      // 3. Récupération des produits actifs
      const { data: prodData } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', profile.id)
        .eq('actif', true)
        .order('created_at', { ascending: false });

      if (prodData && prodData.length > 0) {
        products = prodData;
      }

      // 4. Récupération du catalogue
      const { data: catalogData } = await supabase
        .from('catalogs')
        .select('*')
        .eq('store_id', profile.id)
        .eq('actif', true)
        .single();

      if (catalogData) {
        catalog = catalogData;
        // Compteur de vues du catalogue, alimenté à chaque affichage public.
        await incrementCatalogViews(catalogData.id);
      }
    }
  } catch (error) {
    console.warn('Mode démo actif pour vitrine:', error);
  }

  return (
    <VitrineClient
      profile={profile}
      catalog={catalog}
      categories={categories}
      products={products}
    />
  );
}
