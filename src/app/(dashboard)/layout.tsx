import React from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { getCurrentProfile } from '@/lib/queries/merchant';
import { estAdmin } from '@/lib/queries/admin';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, admin] = await Promise.all([getCurrentProfile(), estAdmin()]);

  return (
    <div className="min-h-screen bg-[#F6F1E7] flex flex-col lg:flex-row">
      <Sidebar profile={profile ?? undefined} estAdmin={admin} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
