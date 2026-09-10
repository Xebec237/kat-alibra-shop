export interface Teinte {
  id: string;
  nom: string;
  /** Couleur d'accent : boutons, prix, éléments sélectionnés. */
  principal: string;
  /** Variante foncée, utilisée au survol. */
  fonce: string;
  /** Fond très clair pour les pastilles et zones mises en avant. */
  clair: string;
  /** Bordure assortie au fond clair. */
  bordure: string;
  /** Texte lisible posé sur le fond clair. */
  texteSurClair: string;
}

/**
 * Nuancier de la vitrine.
 *
 * Chaque teinte embarque ses quatre déclinaisons plutôt qu'une seule couleur :
 * les dériver à la volée depuis un hexadécimal donnerait des contrastes
 * imprévisibles, et le blanc sur fond pastel devient vite illisible. Les
 * `principal` sont donc tous assez soutenus pour porter du texte blanc, même
 * quand la famille est claire.
 */
export const PALETTE: Teinte[] = [
  {
    id: 'olive',
    nom: 'Olive',
    principal: '#6B7A3D',
    fonce: '#54602F',
    clair: '#EBF0DE',
    bordure: '#DDE6C9',
    texteSurClair: '#54602F',
  },
  {
    id: 'terracotta',
    nom: 'Terre cuite',
    principal: '#B4553C',
    fonce: '#95452F',
    clair: '#FBECE8',
    bordure: '#F3D5CB',
    texteSurClair: '#8C3F2B',
  },
  {
    id: 'ocre',
    nom: 'Ocre',
    principal: '#B98A2E',
    fonce: '#976F24',
    clair: '#FBF3DC',
    bordure: '#EFE0B8',
    texteSurClair: '#8A6620',
  },
  {
    id: 'foret',
    nom: 'Forêt',
    principal: '#3F7D4F',
    fonce: '#31633E',
    clair: '#E7F3E9',
    bordure: '#C9E3CE',
    texteSurClair: '#2E5C3A',
  },
  {
    id: 'lagon',
    nom: 'Lagon',
    principal: '#2F7D8C',
    fonce: '#25646F',
    clair: '#E4F2F5',
    bordure: '#C2E0E6',
    texteSurClair: '#245D68',
  },
  {
    id: 'indigo',
    nom: 'Indigo',
    principal: '#4A5B9E',
    fonce: '#3B4980',
    clair: '#E9ECF7',
    bordure: '#CDD4EC',
    texteSurClair: '#3A4779',
  },
  {
    id: 'prune',
    nom: 'Prune',
    principal: '#7D4A6B',
    fonce: '#653B56',
    clair: '#F4E9F1',
    bordure: '#E3CCDC',
    texteSurClair: '#5F3852',
  },
  {
    id: 'rose',
    nom: 'Rose poudré',
    principal: '#B85C7A',
    fonce: '#984A63',
    clair: '#FBEAF0',
    bordure: '#F0CEDA',
    texteSurClair: '#8E4459',
  },
  {
    id: 'ardoise',
    nom: 'Ardoise',
    principal: '#5A6068',
    fonce: '#474C53',
    clair: '#EDEEF0',
    bordure: '#D8DADD',
    texteSurClair: '#464B52',
  },
];

export const TEINTE_DEFAUT = PALETTE[0];

export function getTeinte(id?: string | null): Teinte {
  return PALETTE.find((t) => t.id === id) ?? TEINTE_DEFAUT;
}

/**
 * Variables CSS à poser sur le conteneur de la vitrine.
 *
 * Passer par des variables plutôt que par des classes conditionnelles permet à
 * Tailwind de garder des classes statiques (`bg-[var(--kat-accent)]`) : une
 * classe construite dynamiquement ne serait pas générée à la compilation.
 */
export function variablesTeinte(id?: string | null): React.CSSProperties {
  const t = getTeinte(id);
  return {
    '--kat-accent': t.principal,
    '--kat-accent-fonce': t.fonce,
    '--kat-accent-clair': t.clair,
    '--kat-accent-bordure': t.bordure,
    '--kat-accent-texte': t.texteSurClair,
  } as React.CSSProperties;
}
