import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/queries/merchant';
import { getProducts, getOrders, getCatalogs } from '@/lib/queries/dashboard';
import { DashboardClient } from '@/components/dashboard/DashboardClient';

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login?redirect=/dashboard');

  // Les trois lectures sont indépendantes : en parallèle plutôt qu'en cascade.
  const [products, orders, catalogs] = await Promise.all([
    getProducts(profile.id),
    getOrders(profile.id),
    getCatalogs(profile.id),
  ]);

  return (
    <DashboardClient
      profile={profile}
      products={products}
      orders={orders}
      catalogs={catalogs}
    />
  );
}
