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


/** Lettres capitales à empattements, prises dans le bloc Unicode des
 *  alphabets mathématiques. WhatsApp n'offre que le gras, l'italique et le
 *  chasse-fixe ; c'est le seul moyen d'obtenir une autre police. */
const CAPITALE_CHIC = 0x1d400;

/**
 * Rend un texte en capitales à empattements.
 *
 * Les accents sont retirés avant conversion : le bloc mathématique ne contient
 * ni É ni Ç, et une lettre accentuée laissée telle quelle retomberait dans la
 * police du système au milieu du mot — « MAISON ÉLÉGANCE » deviendrait un
 * panachage disgracieux. En typographie française, la capitale non accentuée
 * reste d'usage courant.
 */
function capitalesChic(texte: string): string {
  const sansAccent = texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

  let sortie = '';
  for (const lettre of sansAccent) {
    const code = lettre.codePointAt(0) ?? 0;
    sortie +=
      code >= 65 && code <= 90
        ? String.fromCodePoint(CAPITALE_CHIC + code - 65)
        : lettre;
  }
  return sortie;
}

/** Filet de séparation court. Douze traits ne se replient sur aucun écran,
 *  là où les trente-deux tirets d'autrefois cassaient en deux lignes. */
const FILET = '────────────';

/**
 * Construit le message de commande envoyé au marchand sur WhatsApp.
 *
 * Aucune adresse d'image n'y figure. WhatsApp ne transporte que du texte dans
 * un lien de conversation : une adresse de photo n'y apparaît pas comme une
 * image mais comme un lien à ouvrir, ce qui alourdit le message sans rien
 * montrer. Tant qu'on ne passe pas par l'API WhatsApp Business, un message de
 * commande est un message texte, et il vaut mieux qu'il soit beau.
 */
export function buildWhatsAppOrderText(order: OrderDetails): string {
  const devise = order.currency || 'FCFA';

  const lignes: string[] = [
    capitalesChic(order.storeName),
    `_Nouvelle commande_  ·  ${order.reference}`,
    FILET,
  ];

  for (const article of order.items) {
    const prix =
      article.prix_promo && article.prix_promo > 0 ? article.prix_promo : article.prix;

    // Taille et couleur en italique, à la suite du nom : une ligne par
    // variante doublerait la hauteur de la liste sur un écran de téléphone.
    const variante = [article.taille, article.couleur].filter(Boolean).join(', ');

    lignes.push(
      `${article.quantite}×  ${article.nom}${variante ? `  _${variante}_` : ''}` +
        `  —  ${formatPrice(prix * article.quantite, devise)}`
    );
  }

  lignes.push(
    FILET,
    `${capitalesChic('Total')}  ·  *${formatPrice(order.totalAmount, devise)}*`,
    '',
    `*Client*  ${order.customerName}`,
    `*Tel*  ${order.customerPhone}`
  );

  if (order.deliveryAddress?.trim()) {
    lignes.push(`*Livraison*  ${order.deliveryAddress.trim()}`);
  }

  if (order.notes?.trim()) {
    lignes.push(`*Note*  _${order.notes.trim()}_`);
  }

  return lignes.join('\n');
}

/**
 * Génère le lien https://wa.me/… avec le message encodé.
 */
export function generateWhatsAppLink(order: OrderDetails): string {
  const numero = cleanWhatsAppNumber(order.merchantPhone);
  return `https://wa.me/${numero}?text=${encodeURIComponent(buildWhatsAppOrderText(order))}`;
}
