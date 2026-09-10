import React from 'react';
import { cn } from '@/lib/utils/cn';
import { OrderStatus } from '@/lib/supabase/types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'whatsapp';
  status?: OrderStatus;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant,
  status,
  size = 'md',
  children,
  ...props
}) => {
  // Mapping automatique si un statut de commande est fourni
  let effectiveVariant = variant || 'neutral';
  let label = children;

  if (status) {
    switch (status) {
      case 'envoyee_whatsapp':
        effectiveVariant = 'whatsapp';
        label = label || 'Envoyée WhatsApp';
        break;
      case 'confirmee':
        effectiveVariant = 'primary';
        label = label || 'Confirmée';
        break;
      case 'payee':
        effectiveVariant = 'success';
        label = label || 'Payée';
        break;
      case 'livree':
        effectiveVariant = 'success';
        label = label || 'Livrée';
        break;
      case 'brouillon':
        effectiveVariant = 'warning';
        label = label || 'Brouillon';
        break;
      case 'annulee':
        effectiveVariant = 'error';
        label = label || 'Annulée';
        break;
    }
  }

  const variants = {
    primary: "bg-[#EBF0DE] text-[#54602F] border border-[#DDE6C9]",
    success: "bg-[#E7F3E9] text-[#3F7D4F] border border-[#C6E6CB]",
    warning: "bg-[#FBF3DC] text-[#B98A2E] border border-[#F3E2B6]",
    error: "bg-[#FBECE8] text-[#B4553C] border border-[#F4D2C9]",
    neutral: "bg-[#F6F1E7] text-[#726C5C] border border-[#E4DAC4]",
    whatsapp: "bg-[#E8F8EE] text-[#1E7E34] border border-[#BDEBD0]",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs font-medium",
    md: "px-2.5 py-1 text-xs font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full tracking-wide transition-colors",
        variants[effectiveVariant],
        sizes[size],
        className
      )}
      {...props}
    >
      {label}
    </span>
  );
};
