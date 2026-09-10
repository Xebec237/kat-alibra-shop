import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/queries/merchant';
import {
  getCategories,
  getProducts,
  countProductsByCategory,
} from '@/lib/queries/dashboard';
import { CategoriesClient } from '@/components/dashboard/CategoriesClient';

export default async function CategoriesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login?redirect=/categories');

  const [categories, products] = await Promise.all([
    getCategories(profile.id),
    getProducts(profile.id),
  ]);

  return (
    <CategoriesClient
      initialCategories={categories}
      productCounts={countProductsByCategory(products)}
    />
  );
}
