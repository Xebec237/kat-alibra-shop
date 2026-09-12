'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Signale qu'un élément est entré dans la fenêtre, une fois pour toutes.
 *
 * Le repli est délibérément permissif : sans IntersectionObserver, on affiche
 * immédiatement plutôt que de risquer un bloc de texte qui ne se révèle
 * jamais. Une animation manquée ne se voit pas ; un titre invisible, si.
 */
function useVisible<T extends HTMLElement>(demarreTouSuite = false) {
  const ref = useRef<T>(null);
  const [vu, setVu] = useState(false);

  useEffect(() => {
    if (demarreTouSuite) {
      setVu(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVu(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entrees) => {
        if (entrees.some((e) => e.isIntersecting)) {
          setVu(true);
          obs.disconnect();
        }
      },
      // Le bas de fenêtre est rogné de 8 % : l'élément s'anime quand il est
      // franchement entré, pas au moment où il effleure le bord.
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [demarreTouSuite]);

  return { ref, vu };
}

/* ------------------------------------------------------------------ */

interface MotsAnimesProps {
  texte: string;
  /**
   * Décalage de départ, en nombre de mots. Permet d'enchaîner plusieurs
   * fragments d'un même titre comme s'ils n'en formaient qu'un.
   */
  decalage?: number;
  /** Démarre dès le montage, sans attendre le défilement. */
  immediat?: boolean;
  className?: string;
}

/** Intervalle entre deux mots, en millisecondes. */
const PAS = 55;

/**
 * Un texte dont les mots se reconstituent un à un.
 *
 * Chaque mot reste un nœud de texte normal : la phrase est intégralement
 * présente dans le HTML, sélectionnable et lisible par un moteur de recherche.
 * Seule sa mise en scène est différée.
 */
export const MotsAnimes: React.FC<MotsAnimesProps> = ({
  texte,
  decalage = 0,
  immediat = false,
  className,
}) => {
  const { ref, vu } = useVisible<HTMLSpanElement>(immediat);
  const mots = texte.split(' ');

  return (
    <span ref={ref} className={className} data-anime={vu ? 'vu' : 'attente'}>
      {mots.map((mot, i) => (
        <React.Fragment key={`${mot}-${i}`}>
          <span
            className="kat-mot"
            style={{ transitionDelay: `${(decalage + i) * PAS}ms` }}
          >
            {mot}
          </span>
          {i < mots.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
    </span>
  );
};

/* ------------------------------------------------------------------ */

interface ApparitionProps {
  children: React.ReactNode;
  /** Retard avant le départ, en millisecondes. */
  delai?: number;
  className?: string;
}

/**
 * Fait monter et apparaître un bloc quand le lecteur l'atteint.
 *
 * `className` est appliqué à l'élément lui-même plutôt qu'à une enveloppe :
 * un div de plus autour d'un enfant de grille en fausserait la mise en page.
 */
export const Apparition: React.FC<ApparitionProps> = ({
  children,
  delai = 0,
  className,
}) => {
  const { ref, vu } = useVisible<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`kat-apparition${className ? ` ${className}` : ''}`}
      data-anime={vu ? 'vu' : 'attente'}
      style={delai ? { transitionDelay: `${delai}ms` } : undefined}
    >
      {children}
    </div>
  );
};
