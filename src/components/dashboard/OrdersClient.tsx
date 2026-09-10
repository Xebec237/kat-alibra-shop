'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  MessageCircle,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { OrderStatus, Profile } from '@/lib/supabase/types';
import type { OrderWithCount } from '@/lib/queries/dashboard';
import { updateOrderStatus } from '@/lib/actions/orders';
import { formatPrice, formatDisplayPhone, cleanWhatsAppNumber } from '@/lib/utils/formatters';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';

interface OrdersClientProps {
  initialOrders: OrderWithCount[];
  profile: Profile;
}

const OrdersView: React.FC<OrdersClientProps> = ({
  initialOrders,
  profile,
}) => {
  // Le bouton « Gérer » du tableau de bord arrive avec ?ref=KAT-XXXXX :
  // on pré-remplit la recherche pour isoler directement cette commande.
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<OrderWithCount[]>(initialOrders);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [search, setSearch] = useState(searchParams.get('ref') ?? '');
  const [activeOrder, setActiveOrder] = useState<OrderWithCount | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setError(null);
    const previous = orders.find((o) => o.id === orderId)?.statut;

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, statut: newStatus } : o))
    );
    if (activeOrder && activeOrder.id === orderId) {
      setActiveOrder((prev) => (prev ? { ...prev, statut: newStatus } : null));
    }

    const result = await updateOrderStatus(orderId, newStatus);
    if (!result.ok && previous) {
      // L'écriture a échoué : on remet le statut réellement en base.
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, statut: previous } : o))
      );
      if (activeOrder && activeOrder.id === orderId) {
        setActiveOrder((prev) => (prev ? { ...prev, statut: previous } : null));
      }
      setError(result.error);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = selectedStatus === 'all' || o.statut === selectedStatus;
    const matchesSearch =
      o.reference.toLowerCase().includes(search.toLowerCase()) ||
      o.nom_client.toLowerCase().includes(search.toLowerCase()) ||
      o.telephone_client.includes(search);

    return matchesStatus && matchesSearch;
  });

  const statuses: { id: string; label: string }[] = [
    { id: 'all', label: 'Toutes les commandes' },
    { id: 'envoyee_whatsapp', label: 'Envoyée WhatsApp' },
    { id: 'confirmee', label: 'Confirmée' },
    { id: 'payee', label: 'Payée' },
    { id: 'livree', label: 'Livrée' },
    { id: 'annulee', label: 'Annulée' },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#2E2C24]">
            Suivi des Commandes
          </h1>
          <p className="text-xs sm:text-sm text-[#726C5C] mt-1">
            Faites évoluer le statut de vos commandes WhatsApp et gérez vos livraisons.
          </p>
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-xs text-[#B00020] bg-[#FCEBEC] border border-[#F5C6CB] rounded-xl px-3 py-2">
          {error}
        </p>
      ) : null}

      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 bg-[#FBF8F2] border border-[#E4DAC4] rounded-2xl p-2.5 flex items-center gap-2">
          <Search className="w-4 h-4 text-[#726C5C] ml-1" />
          <input
            type="text"
            placeholder="Rechercher par référence, nom client ou téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm text-[#2E2C24] placeholder-[#9B9484] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {statuses.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStatus(s.id)}
              className={`whitespace-nowrap px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                selectedStatus === s.id
                  ? 'bg-[#6B7A3D] text-white shadow-xs'
                  : 'bg-[#FBF8F2] text-[#726C5C] border border-[#E4DAC4] hover:bg-[#F6F1E7]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des commandes */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[#FBF8F2] border border-[#E4DAC4] rounded-2xl space-y-3">
          <p className="font-semibold text-[#2E2C24]">Aucune commande trouvée</p>
          <p className="text-xs text-[#726C5C]">
            Vos nouvelles commandes reçues via WhatsApp apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const customerWhatsAppLink = `https://wa.me/${cleanWhatsAppNumber(
              order.telephone_client
            )}?text=${encodeURIComponent(
              `Bonjour ${order.nom_client}, c'est ${profile.nom_boutique} concernant votre commande ${order.reference}.`
            )}`;

            return (
              <Card
                key={order.id}
                className="hover:border-[#6B7A3D]/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 sm:p-5"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-base text-[#2E2C24] font-display">
                      {order.reference}
                    </span>
                    <Badge status={order.statut} size="md" />
                    <span className="text-xs text-[#726C5C] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(order.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="text-xs text-[#726C5C] flex items-center gap-3 flex-wrap">
                    <span className="font-semibold text-[#2E2C24]">
                      {order.nom_client}
                    </span>
                    <span>•</span>
                    <span>{formatDisplayPhone(order.telephone_client)}</span>
                    {order.adresse_livraison ? (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#6B7A3D]" />
                          {order.adresse_livraison}
                        </span>
                      </>
                    ) : null}
                  </div>

                  {order.notes ? (
                    <p className="text-[11px] text-[#726C5C] bg-[#F6F1E7] px-2.5 py-1 rounded-lg border border-[#E4DAC4]/60 inline-block">
                      💬 Note : {order.notes}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-[#E4DAC4]/60">
                  <div className="text-left md:text-right">
                    <span className="text-[11px] text-[#726C5C] block">
                      Total ({order.items_count} art.)
                    </span>
                    <span className="font-bold text-base sm:text-lg text-[#2E2C24]">
                      {formatPrice(order.total, profile.devise)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={customerWhatsAppLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-[#E8F8EE] text-[#1E7E34] border border-[#BDEBD0] hover:bg-[#d5f3df] transition-colors"
                      title="Contacter le client sur WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    </a>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveOrder(order)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Détails
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modale de Détails & Statuts */}
      <Modal
        isOpen={Boolean(activeOrder)}
        onClose={() => setActiveOrder(null)}
        title={`Commande ${activeOrder?.reference}`}
        description={`Détails complets et avancement du statut de la commande.`}
      >
        {activeOrder ? (
          <div className="space-y-4">
            {/* Statut actuel et changement rapide */}
            <div className="bg-[#F6F1E7] p-3.5 rounded-xl border border-[#E4DAC4] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-[#726C5C] uppercase tracking-wider">
                  Statut de la commande :
                </span>
                <Badge status={activeOrder.statut} size="md" />
              </div>

              <div className="pt-2 border-t border-[#E4DAC4]/60">
                <label className="block text-xs font-semibold text-[#2E2C24] mb-1.5">
                  Faire avancer le statut :
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  <button
                    onClick={() => handleUpdateStatus(activeOrder.id, 'envoyee_whatsapp')}
                    className="p-1.5 text-xs rounded-lg border border-[#E4DAC4] bg-[#FBF8F2] hover:bg-[#EBF0DE]"
                  >
                    Envoyée WhatsApp
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(activeOrder.id, 'confirmee')}
                    className="p-1.5 text-xs rounded-lg border border-[#E4DAC4] bg-[#FBF8F2] hover:bg-[#EBF0DE]"
                  >
                    Confirmée
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(activeOrder.id, 'payee')}
                    className="p-1.5 text-xs rounded-lg border border-[#E4DAC4] bg-[#FBF8F2] hover:bg-[#E7F3E9]"
                  >
                    Payée
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(activeOrder.id, 'livree')}
                    className="p-1.5 text-xs rounded-lg border border-[#E4DAC4] bg-[#FBF8F2] hover:bg-[#E7F3E9]"
                  >
                    Livrée
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(activeOrder.id, 'annulee')}
                    className="p-1.5 text-xs rounded-lg border border-[#E4DAC4] bg-[#FBF8F2] hover:bg-[#FBECE8] text-[#B4553C]"
                  >
                    Annulée
                  </button>
                </div>
              </div>
            </div>

            {/* Coordonnées Client */}
            <div className="space-y-1.5 text-xs bg-[#FBF8F2] p-3 rounded-xl border border-[#E4DAC4]">
              <h4 className="font-bold text-[#2E2C24]">Coordonnées du client :</h4>
              <p>👤 <strong>Nom :</strong> {activeOrder.nom_client}</p>
              <p>📞 <strong>Téléphone :</strong> {formatDisplayPhone(activeOrder.telephone_client)}</p>
              {activeOrder.adresse_livraison ? (
                <p>📍 <strong>Adresse :</strong> {activeOrder.adresse_livraison}</p>
              ) : null}
              {activeOrder.notes ? (
                <p>📝 <strong>Note :</strong> {activeOrder.notes}</p>
              ) : null}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-2 border-t border-[#E4DAC4] font-bold">
              <span>Montant Total :</span>
              <span className="text-lg text-[#2E2C24]">
                {formatPrice(activeOrder.total, profile.devise)}
              </span>
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={() => setActiveOrder(null)}
              className="w-full"
            >
              Fermer
            </Button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

// `useSearchParams` impose une frontière Suspense.
export const OrdersClient: React.FC<OrdersClientProps> = (props) => (
  <Suspense fallback={null}>
    <OrdersView {...props} />
  </Suspense>
);
