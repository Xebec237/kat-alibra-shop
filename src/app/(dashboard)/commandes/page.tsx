import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/queries/merchant';
import { getOrders } from '@/lib/queries/dashboard';
import { OrdersClient } from '@/components/dashboard/OrdersClient';

export default async function OrdersPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login?redirect=/commandes');

  const orders = await getOrders(profile.id);

  return <OrdersClient initialOrders={orders} profile={profile} />;
}
