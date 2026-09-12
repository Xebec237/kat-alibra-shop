import { mockProfile, mockProducts } from '@/lib/mockData';
import type { Product } from '@/lib/supabase/types';

export interface VitrineDemo {
  nomBoutique: string;
  ville: string | null;
  produits: Product[];
}

/**
 * La vitrine montrée sur la page d'accueil.
 *
 * C'est volontairement une boutique fictive, et non la dernière boutique
 * inscrite : la page d'accueil est la couverture de KAT, pas la devanture d'un
 * marchand en particulier. Mettre en avant un vrai catalogue reviendrait à
 * offrir gratuitement la première place à celui qui vient d'ajouter un article,
 * et à changer de visage chaque semaine.
 *
 * Aucun lien ne pointe vers `/c/douala-chic` : cette adresse n'existe pas en
 * base et le numéro WhatsApp du profil de démonstration n'appartient à
 * personne. Les boutons « voir une boutique » mènent donc à la recherche, où
 * l'on ne trouve que des vitrines réelles.
 */
export const VITRINE_DEMO: VitrineDemo = {
  nomBoutique: mockProfile.nom_boutique,
  ville: mockProfile.ville,
  produits: mockProducts.filter((p) => p.images.length > 0).slice(0, 4),
};
