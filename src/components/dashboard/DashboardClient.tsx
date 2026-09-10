'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Eye,
  Share2,
  Copy,
  Check,
  Plus,
  ArrowRight,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { Profile, Product, Catalog } from '@/lib/supabase/types';
import type { OrderWithCount } from '@/lib/queries/dashboard';
import { formatPrice, formatDisplayPhone } from '@/lib/utils/formatters';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface DashboardClientProps {
  profile: Profile;
  products: Product[];
  orders: OrderWithCount[];
  catalogs: Catalog[];
}

export const DashboardClient: React.FC<DashboardClientProps> = ({
  profile,
  products,
  orders,
  catalogs,
}) => {
  const totalVues = catalogs.reduce((acc, c) => acc + (c.vues || 0), 0);
  const [copied, setCopied] = useState(false);

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/c/${profile.slug}`
    : `http://localhost:3000/c/${profile.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsAppShareText = encodeURIComponent(
    `✨ Découvrez notre catalogue complet en ligne chez *${profile.nom_boutique}* !\n\n` +
    `👉 Cliquez sur le lien pour voir nos articles et commander facilement :\n${publicUrl}`
  );

  const totalRevenue = orders.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="space-y-6">
      {/* En-tête de bienvenue */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#2E2C24]">
            Bonjour, {profile.nom_boutique} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#726C5C] mt-1">
            Voici les performances de votre catalogue et les dernières commandes WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/produits/nouveau">
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4 mr-1.5" />
              Ajouter un produit
            </Button>
          </Link>
        </div>
      </div>

      {/* Bannière de partage du catalogue WhatsApp */}
      <div className="bg-[#EBF0DE] border border-[#DDE6C9] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3F7D4F] animate-ping" />
            <h3 className="font-bold text-sm text-[#54602F] font-display">
              Votre vitrine est en ligne et prête à être partagée !
            </h3>
          </div>
          <p className="text-xs text-[#726C5C] break-all">
            Lien public : <strong className="text-[#2E2C24]">{publicUrl}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="flex-1 md:flex-initial text-xs bg-[#FBF8F2]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-[#3F7D4F]" /> Copié !
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" /> Copier le lien
              </>
            )}
          </Button>

          <a
            href={`https://wa.me/?text=${whatsAppShareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-initial inline-flex items-center justify-center text-xs font-semibold px-3 py-2 rounded-xl bg-[#25D366] text-white hover:bg-[#20bd5a] transition-all shadow-xs gap-1.5"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Statut / Groupe</span>
          </a>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <div className="flex items-center justify-between text-[#726C5C]">
            <span className="text-xs font-semibold uppercase tracking-wider">Chiffre d&apos;affaires</span>
            <TrendingUp className="w-4 h-4 text-[#6B7A3D]" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-display text-[#2E2C24] mt-2">
            {formatPrice(totalRevenue, profile.devise)}
          </p>
          <p className="text-[11px] text-[#3F7D4F] font-medium mt-1">
            3 commandes au total
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-[#726C5C]">
            <span className="text-xs font-semibold uppercase tracking-wider">Commandes</span>
            <ShoppingBag className="w-4 h-4 text-[#6B7A3D]" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-display text-[#2E2C24] mt-2">
            {orders.length}
          </p>
          <p className="text-[11px] text-[#726C5C] mt-1">
            1 nouvelle à traiter
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-[#726C5C]">
            <span className="text-xs font-semibold uppercase tracking-wider">Articles actifs</span>
            <Package className="w-4 h-4 text-[#6B7A3D]" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-display text-[#2E2C24] mt-2">
            {products.filter((p) => p.actif).length}
          </p>
          <p className="text-[11px] text-[#B98A2E] font-medium mt-1">
            1 en rupture de stock
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-[#726C5C]">
            <span className="text-xs font-semibold uppercase tracking-wider">Vues Catalogue</span>
            <Eye className="w-4 h-4 text-[#6B7A3D]" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-display text-[#2E2C24] mt-2">
            {totalVues}
          </p>
          <p className="text-[11px] text-[#3F7D4F] font-medium mt-1">
            +48 aujourd&apos;hui
          </p>
        </Card>
      </div>

      {/* Dernières commandes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-display text-[#2E2C24]">
            Dernières commandes reçues
          </h2>
          <Link
            href="/commandes"
            className="text-xs font-semibold text-[#6B7A3D] hover:text-[#54602F] flex items-center gap-1"
          >
            <span>Voir tout</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-[#FBF8F2] border border-[#E4DAC4] rounded-2xl overflow-hidden divide-y divide-[#E4DAC4]">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F6F1E7]/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#2E2C24] font-display">
                    {order.reference}
                  </span>
                  <Badge status={order.statut} size="sm" />
                </div>
                <p className="text-xs text-[#726C5C]">
                  <strong>{order.nom_client}</strong> • {formatDisplayPhone(order.telephone_client)}
                </p>
                {order.adresse_livraison ? (
                  <p className="text-[11px] text-[#726C5C]">
                    📍 {order.adresse_livraison}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E4DAC4]/60">
                <div className="text-left sm:text-right">
                  <span className="text-xs text-[#726C5C] block">
                    {order.items_count} {order.items_count > 1 ? 'articles' : 'article'}
                  </span>
                  <span className="font-bold text-sm sm:text-base text-[#2E2C24]">
                    {formatPrice(order.total, profile.devise)}
                  </span>
                </div>

                <Link href={`/commandes?ref=${order.reference}`}>
                  <Button variant="outline" size="sm" className="text-xs">
                    Gérer
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
