'use client';

import React, { useState, useTransition } from 'react';
import { ShieldCheck, ShieldOff } from 'lucide-react';
import { definirRoleAdmin } from '@/lib/actions/admin';

interface BoutonRoleAdminProps {
  profileId: string;
  nomBoutique: string;
  estAdmin: boolean;
  /** Le rôle de l'administrateur connecté n'est pas modifiable par lui-même. */
  estMoi: boolean;
}

export const BoutonRoleAdmin: React.FC<BoutonRoleAdminProps> = ({
  profileId,
  nomBoutique,
  estAdmin,
  estMoi,
}) => {
  const [enCours, startTransition] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);

  if (estMoi) {
    return (
      <span className="text-[11px] text-[#9B9484] italic">
        Votre propre compte
      </span>
    );
  }

  const basculer = () => {
    // Confirmation explicite : donner le rôle ouvre l'accès aux coordonnées de
    // tous les marchands de la plateforme.
    const question = estAdmin
      ? `Retirer les droits d'administrateur à « ${nomBoutique} » ?`
      : `Donner les droits d'administrateur à « ${nomBoutique} » ?\n\nCette boutique pourra voir les emails et numéros de tous les marchands inscrits.`;

    if (!confirm(question)) return;

    setErreur(null);
    startTransition(async () => {
      const res = await definirRoleAdmin(profileId, !estAdmin);
      if (!res.ok) setErreur(res.error);
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={basculer}
        disabled={enCours}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors disabled:opacity-50 ${
          estAdmin
            ? 'bg-[#FBECE8] text-[#B4553C] border border-[#F5C6CB] hover:bg-[#F8DDD6]'
            : 'bg-[#2E2C24] text-white hover:bg-[#3D3A30]'
        }`}
      >
        {estAdmin ? (
          <>
            <ShieldOff className="w-3.5 h-3.5" />
            {enCours ? 'Retrait…' : 'Retirer admin'}
          </>
        ) : (
          <>
            <ShieldCheck className="w-3.5 h-3.5" />
            {enCours ? 'Attribution…' : 'Nommer admin'}
          </>
        )}
      </button>

      {erreur ? (
        <span className="text-[10px] text-[#B00020] text-right max-w-[200px]">
          {erreur}
        </span>
      ) : null}
    </div>
  );
};
