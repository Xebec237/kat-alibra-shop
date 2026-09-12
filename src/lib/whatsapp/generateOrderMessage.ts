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
 * Construit le message de commande envoyé au marchand sur WhatsApp.
 *
 * Le message est volontairement dépouillé. WhatsApp n'affiche ni tableaux ni
 * filets de séparation : les lignes de tirets de l'ancienne version se
 * repliaient au milieu sur un écran de téléphone et noyaient l'information.
 * Ne restent que le gras, qui lui est rendu, et les sauts de ligne.
 *
 * La photo est une adresse seule en dernière ligne. WhatsApp ne sait pas
 * joindre un fichier à un lien de conversation — c'est une limite de son
 * protocole, pas un oubli — mais il fabrique un aperçu du premier lien qu'il
 * rencontre, et l'article apparaît alors en image au-dessus du texte.
 */
export function buildWhatsAppOrderText(order: OrderDetails): string {
  const devise = order.currency || 'FCFA';
  const lignes: string[] = [`*Commande ${order.reference}*`, ''];

  for (const article of order.items) {
    const prix =
      article.prix_promo && article.prix_promo > 0 ? article.prix_promo : article.prix;

    // Taille et couleur tiennent entre parenthèses, à la suite du nom : sur un
    // écran étroit, une ligne par variante triplerait la longueur de la liste.
    const variante = [article.taille, article.couleur].filter(Boolean).join(', ');

    lignes.push(
      `${article.quantite}x ${article.nom}${variante ? ` (${variante})` : ''} — ` +
        formatPrice(prix * article.quantite, devise)
    );
  }

  lignes.push('', `*Total ${formatPrice(order.totalAmount, devise)}*`, '');
  lignes.push(`*Client* ${order.customerName}`);
  lignes.push(`*Tel* ${order.customerPhone}`);

  if (order.deliveryAddress?.trim()) {
    lignes.push(`*Livraison* ${order.deliveryAddress.trim()}`);
  }

  if (order.notes?.trim()) {
    lignes.push(`*Note* ${order.notes.trim()}`);
  }

  // Une seule photo, celle du premier article qui en a une : WhatsApp
  // n'affiche l'aperçu que du premier lien, les suivants ne seraient que des
  // adresses illisibles allongeant le message.
  const photo = order.items.find((a) => a.image?.startsWith('https://'))?.image;
  if (photo) lignes.push('', photo);

  return lignes.join('\n');
}

/**
 * Génère le lien https://wa.me/… avec le message encodé.
 */
export function generateWhatsAppLink(order: OrderDetails): string {
  const numero = cleanWhatsAppNumber(order.merchantPhone);
  return `https://wa.me/${numero}?text=${encodeURIComponent(buildWhatsAppOrderText(order))}`;
}
