'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthCodeForm } from '@/components/auth/AuthCodeForm';

function LoginContent() {
  const searchParams = useSearchParams();
  return <AuthCodeForm mode="login" redirectTo={searchParams.get('redirect') || '/dashboard'} />;
}

// `useSearchParams` impose une frontière Suspense pour garder la page prérendue.
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
