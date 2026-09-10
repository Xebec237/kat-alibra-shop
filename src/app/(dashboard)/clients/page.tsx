import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/queries/merchant';
import { getCustomers } from '@/lib/queries/dashboard';
import { CustomersClient } from '@/components/dashboard/CustomersClient';

export default async function CustomersPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login?redirect=/clients');

  const customers = await getCustomers(profile.id);

  return <CustomersClient customers={customers} profile={profile} />;
}
