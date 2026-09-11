import { redirect } from 'next/navigation';
import { getCurrentProfile, getCurrentEmail } from '@/lib/queries/merchant';
import { StoreSettingsClient } from '@/components/dashboard/StoreSettingsClient';

export default async function StoreSettingsPage() {
  const [profile, email] = await Promise.all([
    getCurrentProfile(),
    getCurrentEmail(),
  ]);

  if (!profile) redirect('/login?redirect=/parametres/boutique');

  return <StoreSettingsClient profile={profile} email={email} />;
}
