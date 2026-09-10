import { formatPrice, cleanWhatsAppNumber } from '../utils/formatters';

export interface CartItem {
  /** Clé composite du panier : `<product_id>_<taille>_<couleur>`. */
  id: string;
  /** UUID réel du produit, requis pour rattacher la ligne de commande en base. */
  product_id?: string;
  nom: string;
  prix: number;
  prix_promo?: number | null;
  quantite: number;
  image?: string;
  taille?: string;
  couleur?: string;
}

export interface OrderDetails {
  reference: string;
  storeName: string;
  merchantPhone: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  notes?: string;
  items: CartItem[];
  totalAmount: number;
  currency?: string;
}

/**
 * Construit le texte de commande lisible et structuré pour WhatsApp
 */
export function buildWhatsAppOrderText(order: OrderDetails): string {
  const currency = order.currency || 'FCFA';

  const lines: string[] = [
    `🛍️ *NOUVELLE COMMANDE — ${order.reference}*`,
    `--------------------------------`,
    `👤 *Client :* ${order.customerName}`,
    `📞 *Téléphone :* ${order.customerPhone}`,
  ];

  if (order.deliveryAddress && order.deliveryAddress.trim()) {
    lines.push(`📍 *Livraison :* ${order.deliveryAddress.trim()}`);
  }

  lines.push(`--------------------------------`);
  lines.push(`📦 *Articles commandés :*`);

  // Liste des articles
  order.items.forEach((item) => {
    const effectivePrice = item.prix_promo && item.prix_promo > 0 ? item.prix_promo : item.prix;
    const lineTotal = effectivePrice * item.quantite;
    
    let variantDetails = '';
    if (item.taille || item.couleur) {
      const details = [
        item.taille ? `Taille: ${item.taille}` : null,
        item.couleur ? `Couleur: ${item.couleur}` : null,
      ].filter(Boolean).join(', ');
      variantDetails = ` [${details}]`;
    }

    lines.push(`• *${item.quantite}x* ${item.nom}${variantDetails} (${formatPrice(effectivePrice, currency)}) = ${formatPrice(lineTotal, currency)}`);
  });

  lines.push(`--------------------------------`);
  lines.push(`💰 *TOTAL À PAYER : ${formatPrice(order.totalAmount, currency)}*`);

  if (order.notes && order.notes.trim()) {
    lines.push(`📝 *Note du client :* ${order.notes.trim()}`);
  }

  lines.push(`--------------------------------`);
  lines.push(`✨ *Commande passée via KAT*`);

  return lines.join('\n');
}

/**
 * Génère le lien direct https://wa.me/... avec le texte encodé
 */
export function generateWhatsAppLink(order: OrderDetails): string {
  const phone = cleanWhatsAppNumber(order.merchantPhone);
  const rawText = buildWhatsAppOrderText(order);
  const encodedText = encodeURIComponent(rawText);

  return `https://wa.me/${phone}?text=${encodedText}`;
}
