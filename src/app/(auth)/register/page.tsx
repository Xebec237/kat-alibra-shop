import React from 'react';
import { AuthCodeForm } from '@/components/auth/AuthCodeForm';

export default function RegisterPage() {
  return <AuthCodeForm mode="register" redirectTo="/dashboard" />;
}
