/**
 * Authentification par code à usage unique (OTP), par email ou par WhatsApp.
 *
 * Aucun mot de passe : le marchand saisit son identifiant, reçoit un code à six
 * chiffres et le retape. Le même parcours sert à la création de boutique et à
 * la connexion — seule change la permission de créer un compte.
 */

export type AuthChannel = 'email' | 'phone';

/** Indicatif par défaut quand le marchand saisit un numéro local. */
export const DEFAULT_COUNTRY_CODE = '237';

/**
 * Met un numéro WhatsApp au format E.164 attendu par Supabase (`+237690000000`).
 *
 * Les marchands saisissent indifféremment `6 90 00 00 00`, `690000000`,
 * `237690000000` ou `+237 690 00 00 00`. On ramène tout à la même forme, sans
 * quoi le code partirait vers un numéro invalide et l'échec serait muet.
 */
export function toE164(raw: string, countryCode: string = DEFAULT_COUNTRY_CODE): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';

  // Déjà préfixé de l'indicatif : on n'ajoute rien.
  if (digits.startsWith(countryCode)) return `+${digits}`;

  // Certains notent le 00 international à la place du +.
  if (digits.startsWith('00')) return `+${digits.slice(2)}`;

  return `+${countryCode}${digits}`;
}

/** Affichage lisible d'un identifiant, pour le message « code envoyé à … ». */
export function formatIdentifier(channel: AuthChannel, value: string): string {
  if (channel === 'email') return value.trim();

  const e164 = toE164(value);
  // +237690000000 -> +237 6 90 00 00 00
  const m = e164.match(/^\+(\d{1,3})(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/);
  return m ? `+${m[1]} ${m[2]} ${m[3]} ${m[4]} ${m[5]} ${m[6]}` : e164;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/**
 * Un numéro exploitable compte au moins 8 chiffres une fois l'indicatif retiré.
 * Volontairement permissif : les longueurs varient d'un pays à l'autre et un
 * refus trop strict bloquerait des marchands légitimes.
 */
export function isValidPhone(value: string): boolean {
  return value.replace(/\D/g, '').length >= 8;
}

/**
 * Longueur maximale acceptée dans le champ de saisie.
 *
 * Supabase ne délivre pas partout la même longueur : ce projet émet des codes
 * à huit chiffres là où la documentation en annonce six. On accepte donc une
 * plage plutôt qu'une valeur figée — un `length === 6` codé en dur rejetterait
 * tous les codes réellement envoyés.
 */
export const OTP_MAX_LENGTH = 10;
const OTP_MIN_LENGTH = 4;

export function isValidCode(value: string): boolean {
  const digits = value.trim();
  return (
    /^\d+$/.test(digits) &&
    digits.length >= OTP_MIN_LENGTH &&
    digits.length <= OTP_MAX_LENGTH
  );
}

/**
 * Traduit les erreurs Supabase, qui arrivent en anglais et parfois cryptiques.
 * Le cas « phone provider disabled » est explicite : la livraison WhatsApp
 * dépend d'un fournisseur à activer côté Supabase, pas du code de l'app.
 */
export function translateAuthError(message: string): string {
  const m = message.toLowerCase();

  if (m.includes('phone provider') || m.includes('phone_provider_disabled')) {
    return "L'envoi par WhatsApp n'est pas encore activé sur ce projet. Utilisez votre adresse email en attendant.";
  }
  if (m.includes('token has expired') || m.includes('expired')) {
    return 'Ce code a expiré. Demandez-en un nouveau.';
  }
  if (m.includes('invalid') && m.includes('token')) {
    return 'Code incorrect. Vérifiez les six chiffres reçus.';
  }
  if (m.includes('rate limit') || m.includes('too many')) {
    return 'Trop de tentatives. Patientez une minute avant de redemander un code.';
  }
  if (m.includes('signups not allowed') || m.includes('user not found')) {
    return "Aucune boutique n'est associée à cet identifiant. Créez-la d'abord.";
  }
  if (m.includes('already registered') || m.includes('already exists')) {
    return 'Une boutique existe déjà avec cet identifiant. Connectez-vous plutôt.';
  }
  return message;
}
