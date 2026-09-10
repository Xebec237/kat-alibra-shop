import { notFound, redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/queries/merchant';
import { getCategories, getProductById } from '@/lib/queries/dashboard';
import { ProductForm } from '@/components/dashboard/ProductForm';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?redirect=/produits/${id}/modifier`);

  const [categories, product] = await Promise.all([
    getCategories(profile.id),
    getProductById(profile.id, id),
  ]);

  // Produit inexistant, ou appartenant à une autre boutique.
  if (!product) notFound();

  return (
    <ProductForm categories={categories} profile={profile} product={product} />
  );
}
