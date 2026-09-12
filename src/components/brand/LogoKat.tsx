import React from 'react';

/**
 * Marque KAT — le panier.
 *
 * Tout le tracé est en `currentColor`, y compris les lettres. Les trois carrés
 * sont des trous (`fill-rule="evenodd"`), pas des aplats : le fond traverse le
 * panier et les lettres se détachent dessus. C'est ce qui permet au même dessin
 * de fonctionner en crème sur olive comme en olive sur crème, sans variante.
 */
export const MarqueKat: React.FC<{ className?: string }> = ({
  className = 'w-full h-full',
}) => (
  <svg
    viewBox="0 0 64 64"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    {/* Anse */}
    <path
      d="M20 24 Q32 8 44 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="4.5"
      strokeLinecap="round"
    />
    {/* Corps du panier, évidé de trois carrés */}
    <path
      fillRule="evenodd"
      fill="currentColor"
      d="M16 24 L48 24 L43 52 Q32 57.5 21 52 Z M21.5 29.5 h8 v8 h-8 Z M33 29.5 h8 v8 h-8 Z M27 40.5 h8 v8 h-8 Z"
    />
    {/* K, T, A tracés dans les évidements */}
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        transform="translate(21.5 29.5)"
        d="M2.1,1.3 L2.1,6.7 M2.1,4.2 L6.3,1.3 M2.1,4.2 L6.3,6.7"
      />
      <path transform="translate(33 29.5)" d="M1.3,1.6 L6.7,1.6 M4,1.6 L4,6.7" />
      <path
        transform="translate(27 40.5)"
        d="M1.3,6.7 L4,1.3 M4,1.3 L6.7,6.7 M2.35,4.6 L5.65,4.6"
      />
    </g>
  </svg>
);

interface LogoKatProps {
  /** Affiche le mot « KAT » à côté du panier. */
  avecTexte?: boolean;
  /** Taille du panier. */
  taille?: 'sm' | 'md' | 'lg';
  /** Pastille de fond derrière le panier. */
  pastille?: boolean;
  className?: string;
}

const TAILLES = {
  sm: { boite: 'w-8 h-8', marque: 'w-5 h-5', texte: 'text-base' },
  md: { boite: 'w-9 h-9', marque: 'w-6 h-6', texte: 'text-lg' },
  lg: { boite: 'w-10 h-10', marque: 'w-7 h-7', texte: 'text-2xl' },
};

/**
 * Logo complet, panier seul ou accompagné du mot.
 *
 * Sans pastille, le panier hérite de la couleur du texte parent — pratique sur
 * un fond déjà coloré, comme l'écran de connexion en cours.
 */
export const LogoKat: React.FC<LogoKatProps> = ({
  avecTexte = true,
  taille = 'md',
  pastille = true,
  className = '',
}) => {
  const t = TAILLES[taille];

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {pastille ? (
        <span
          className={`${t.boite} rounded-xl bg-[#6B7A3D] text-[#F7F2E2] flex items-center justify-center shadow-xs shrink-0`}
        >
          <MarqueKat className={t.marque} />
        </span>
      ) : (
        <span className={`${t.boite} flex items-center justify-center shrink-0`}>
          <MarqueKat className={t.marque} />
        </span>
      )}

      {avecTexte ? (
        <span className={`font-bold font-display tracking-tight ${t.texte}`}>
          KAT
        </span>
      ) : null}
    </span>
  );
};
