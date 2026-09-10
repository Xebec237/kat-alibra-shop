import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/queries/merchant';
import { getCatalogs, getProducts } from '@/lib/queries/dashboard';
import { CatalogsClient } from '@/components/dashboard/CatalogsClient';

export default async function CatalogsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login?redirect=/catalogues');

  const [catalogs, products] = await Promise.all([
    getCatalogs(profile.id),
    getProducts(profile.id),
  ]);

  return (
    <CatalogsClient
      profile={profile}
      catalog={catalogs[0] ?? null}
      products={products}
    />
  );
}
