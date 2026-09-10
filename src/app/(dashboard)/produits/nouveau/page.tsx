import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/queries/merchant';
import { getCategories } from '@/lib/queries/dashboard';
import { ProductForm } from '@/components/dashboard/ProductForm';

export default async function NewProductPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login?redirect=/produits/nouveau');

  const categories = await getCategories(profile.id);

  return <ProductForm categories={categories} profile={profile} />;
}
