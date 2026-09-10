/**
 * Formate un montant numérique en devise (ex: 15 000 FCFA)
 *
 * Le groupage est fait à la main plutôt qu'avec `Intl.NumberFormat("fr-FR")` :
 * Node produit une espace fine insécable (U+202F) là où beaucoup de navigateurs
 * produisent une espace insécable (U+00A0). Les deux rendus diffèrent alors
 * entre le serveur et le client, et React signale une erreur d'hydratation sur
 * chaque prix de la page.
 */
export function formatPrice(amount: number, currency: string = "FCFA"): string {
  const rounded = Math.round(Number(amount) || 0);
  const sign = rounded < 0 ? "-" : "";

  const grouped = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return `${sign}${grouped} ${currency}`;
}

/**
 * Nettoie et formate un numéro de téléphone pour WhatsApp (format international sans '+' ni espaces)
 * Ex: "+237 690 00 00 00" -> "237690000000"
 */
export function cleanWhatsAppNumber(phone: string): string {
  // Retire tous les caractères non numériques
  const cleaned = phone.replace(/\D/g, "");
  return cleaned;
}

/**
 * Formate un numéro WhatsApp brut pour un affichage lisible
 * Ex: "237690000000" -> "+237 6 90 00 00 00"
 */
export function formatDisplayPhone(phone: string): string {
  const cleaned = cleanWhatsAppNumber(phone);
  if (cleaned.startsWith("237") && cleaned.length === 12) {
    return `+237 ${cleaned.substring(3, 4)} ${cleaned.substring(4, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8, 10)} ${cleaned.substring(10, 12)}`;
  }
  return phone.startsWith("+") ? phone : `+${phone}`;
}
