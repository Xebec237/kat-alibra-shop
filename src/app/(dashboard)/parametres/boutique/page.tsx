import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/queries/merchant';
import { StoreSettingsClient } from '@/components/dashboard/StoreSettingsClient';

export default async function StoreSettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login?redirect=/parametres/boutique');

  return <StoreSettingsClient profile={profile} />;
}
