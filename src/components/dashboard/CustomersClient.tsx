'use client';

import React, { useState } from 'react';
import { Search, MessageCircle, Phone, MapPin, Users, ShoppingBag } from 'lucide-react';
import { Customer, Profile } from '@/lib/supabase/types';
import { formatPrice, formatDisplayPhone, cleanWhatsAppNumber } from '@/lib/utils/formatters';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface CustomersClientProps {
  customers: Customer[];
  profile: Profile;
}

export const CustomersClient: React.FC<CustomersClientProps> = ({ customers, profile }) => {
  const [search, setSearch] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.nom.toLowerCase().includes(search.toLowerCase()) ||
      c.telephone.includes(search)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#2E2C24]">
          Répertoire Clients
        </h1>
        <p className="text-xs sm:text-sm text-[#726C5C] mt-1">
          Retrouvez l&apos;historique de vos acheteurs WhatsApp et relancez-les facilement.
        </p>
      </div>

      {/* Recherche */}
      <div className="bg-[#FBF8F2] border border-[#E4DAC4] rounded-2xl p-3 flex items-center gap-3">
        <Search className="w-4 h-4 text-[#726C5C] ml-1" />
        <input
          type="text"
          placeholder="Rechercher par nom ou numéro..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs sm:text-sm text-[#2E2C24] placeholder-[#9B9484] focus:outline-none"
        />
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[#FBF8F2] border border-[#E4DAC4] rounded-2xl space-y-3">
          <Users className="w-12 h-12 text-[#726C5C] mx-auto opacity-40" />
          <p className="font-semibold text-[#2E2C24]">
            {search ? 'Aucun client ne correspond' : 'Aucun client pour le moment'}
          </p>
          <p className="text-xs text-[#726C5C]">
            {search
              ? 'Essayez un autre nom ou numéro.'
              : 'Vos acheteurs apparaîtront ici dès la première commande passée depuis votre catalogue.'}
          </p>
        </div>
      ) : (
      <div className="bg-[#FBF8F2] border border-[#E4DAC4] rounded-2xl overflow-hidden divide-y divide-[#E4DAC4]">
        {filtered.map((customer) => {
          const waLink = `https://wa.me/${cleanWhatsAppNumber(customer.telephone)}?text=${encodeURIComponent(
            `Bonjour ${customer.nom}, c'est ${profile.nom_boutique} ! Nous venons de recevoir de nouveaux articles susceptibles de vous plaire.`
          )}`;

          return (
            <div
              key={customer.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#F6F1E7]/40 transition-colors"
            >
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-[#2E2C24]">
                  {customer.nom}
                </h3>
                <div className="flex items-center gap-2 text-xs text-[#726C5C]">
                  <span>{formatDisplayPhone(customer.telephone)}</span>
                  <span>•</span>
                  <span>{customer.adresse}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-[#54602F] pt-1">
                  <span>{customer.commandes_count} commandes</span>
                  <span>•</span>
                  <span className="font-bold">Total: {formatPrice(customer.total_depense, profile.devise)}</span>
                </div>
              </div>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#E8F8EE] text-[#1E7E34] border border-[#BDEBD0] text-xs font-semibold hover:bg-[#d5f3df]"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span>Message WhatsApp</span>
              </a>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
