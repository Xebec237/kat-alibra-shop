import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import {
  mockProducts,
  mockCategories,
  mockOrders,
  mockCatalog,
} from '@/lib/mockData';
import type {
  Product,
  Category,
  Order,
  Catalog,
  Customer,
} from '@/lib/supabase/types';

/**
 * Lectures de l'espace marchand.
 *
 * Toutes ces fonctions s'exécutent côté serveur et s'appuient sur RLS : les
 * policies filtrent déjà par `store_id`, mais on filtre aussi explicitement
 * pour que l'intention reste lisible et que rien ne dépende d'une seule barrière.
 *
 * Sans projet Supabase branché, elles renvoient les données de démonstration.
 */

export async function getProducts(storeId: string): Promise<Product[]> {
  if (!isSupabaseConfigured) return mockProducts;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as Product[];
}

/** Un produit précis de la boutique. `null` s'il appartient à quelqu'un d'autre. */
export async function getProductById(
  storeId: string,
  productId: string
): Promise<Product | null> {
  if (!isSupabaseConfigured) {
    return mockProducts.find((p) => p.id === productId) ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('store_id', storeId)
    .maybeSingle();

  if (error || !data) return null;
  return data as Product;
}

export async function getCategories(storeId: string): Promise<Category[]> {
  if (!isSupabaseConfigured) return mockCategories;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', storeId)
    .order('ordre', { ascending: true });

  if (error || !data) return [];
  return data as Category[];
}

/** Commande enrichie du nombre de lignes, affiché dans les listes. */
export type OrderWithCount = Order & { items_count: number };

export async function getOrders(storeId: string): Promise<OrderWithCount[]> {
  if (!isSupabaseConfigured) return mockOrders;

  const supabase = await createClient();
  // `order_items(count)` agrège côté Postgres : une seule requête au lieu d'un
  // appel par commande.
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(count)')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return (data as (Order & { order_items?: { count: number }[] })[]).map(
    ({ order_items, ...order }) => ({
      ...order,
      items_count: order_items?.[0]?.count ?? 0,
    })
  );
}

export async function getCatalogs(storeId: string): Promise<Catalog[]> {
  if (!isSupabaseConfigured) return [mockCatalog];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('catalogs')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as Catalog[];
}

export async function getCustomers(storeId: string): Promise<Customer[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as Customer[];
}

/** Nombre de produits par catégorie, pour l'écran Catégories. */
export function countProductsByCategory(products: Product[]) {
  return products.reduce<Record<string, number>>((acc, product) => {
    if (!product.category_id) return acc;
    acc[product.category_id] = (acc[product.category_id] || 0) + 1;
    return acc;
  }, {});
}
