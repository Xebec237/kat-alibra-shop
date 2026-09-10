import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/queries/merchant';
import { getProducts } from '@/lib/queries/dashboard';
import { ProductsClient } from '@/components/dashboard/ProductsClient';

export default async function ProductsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login?redirect=/produits');

  const products = await getProducts(profile.id);

  return <ProductsClient initialProducts={products} profile={profile} />;
}
