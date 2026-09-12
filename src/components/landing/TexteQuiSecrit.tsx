'use client';

import React, { useEffect, useRef, useState } from 'react';

interface TexteQuiSecritProps {
  /** Les termes défilent en boucle, dans l'ordre. */
  termes: string[];
  className?: string;
}

const VITESSE_FRAPPE = 90;
const VITESSE_EFFACE = 45;
const PAUSE_PLEIN = 1700;
const PAUSE_VIDE = 320;

/**
 * Un mot qui s'écrit, s'efface, et laisse la place au suivant.
 *
 * Le premier terme est rendu en entier côté serveur : la frappe ne commence
 * qu'une fois le composant monté et visible. On évite ainsi une différence
 * entre le HTML livré et le premier rendu du navigateur, et le champ n'est
 * jamais vide pour qui ne verrait la page qu'un instant.
 *
 * L'animation ne démarre pas si le système demande un mouvement réduit, et
 * s'arrête de consommer du temps machine tant que l'élément reste hors écran.
 */
export const TexteQuiSecrit: React.FC<TexteQuiSecritProps> = ({ termes, className }) => {
  const [affiche, setAffiche] = useState(termes[0] ?? '');
  const [anime, setAnime] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (termes.length < 2) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const obs = new IntersectionObserver(
      (entrees) => {
        if (entrees.some((e) => e.isIntersecting)) {
          setAnime(true);
          obs.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [termes]);

  useEffect(() => {
    if (!anime) return;

    let annule = false;
    let minuteur: ReturnType<typeof setTimeout>;

    let i = 0;
    let n = termes[0].length;
    let efface = true;

    const tic = () => {
      if (annule) return;

      if (efface) {
        n -= 1;
        if (n <= 0) {
          n = 0;
          efface = false;
          i = (i + 1) % termes.length;
        }
      } else {
        n += 1;
        if (n >= termes[i].length) {
          n = termes[i].length;
          efface = true;
        }
      }

      setAffiche(termes[i].slice(0, n));

      const suite = efface
        ? n === termes[i].length
          ? PAUSE_PLEIN
          : VITESSE_EFFACE
        : n === 0
          ? PAUSE_VIDE
          : VITESSE_FRAPPE;

      minuteur = setTimeout(tic, suite);
    };

    minuteur = setTimeout(tic, PAUSE_PLEIN);

    return () => {
      annule = true;
      clearTimeout(minuteur);
    };
  }, [anime, termes]);

  return (
    <span ref={ref} className={className}>
      {affiche}
      {anime ? <span className="kat-curseur">|</span> : null}
    </span>
  );
};
