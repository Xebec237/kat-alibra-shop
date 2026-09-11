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
  /** Fond de page de la vitrine. */
  fond: string;
  /** Fond des cartes et de l'en-tête, posé sur `fond`. */
  surface: string;
  /** Bordure des cartes, assortie à `surface`. */
  bordureSurface: string;
}

/**
 * Nuancier de la vitrine.
 *
 * Chaque teinte embarque ses déclinaisons plutôt qu'une seule couleur : les
 * dériver à la volée depuis un hexadécimal donnerait des contrastes
 * imprévisibles, et du blanc sur pastel devient vite illisible.
 *
 * `fond`, `surface` et `bordureSurface` habillent toute la page, pas seulement
 * les accents — choisir une teinte change l'ambiance de la boutique entière.
 * Ces trois-là restent très désaturés : un fond franc fatigue l'œil sur une
 * page de catalogue qu'on parcourt longuement, et écrase les photos d'articles.
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
    fond: '#F6F1E7',
    surface: '#FBF8F2',
    bordureSurface: '#E4DAC4',
  },
  {
    id: 'terracotta',
    nom: 'Terre cuite',
    principal: '#B4553C',
    fonce: '#95452F',
    clair: '#FBECE8',
    bordure: '#F3D5CB',
    texteSurClair: '#8C3F2B',
    fond: '#FAF1ED',
    surface: '#FDF8F6',
    bordureSurface: '#EDD8CE',
  },
  {
    id: 'corail',
    nom: 'Corail',
    principal: '#C25A5A',
    fonce: '#A24747',
    clair: '#FBEDED',
    bordure: '#F2D3D3',
    texteSurClair: '#984242',
    fond: '#FBF0F0',
    surface: '#FEF8F8',
    bordureSurface: '#F0D8D8',
  },
  {
    id: 'ocre',
    nom: 'Ocre',
    principal: '#B98A2E',
    fonce: '#976F24',
    clair: '#FBF3DC',
    bordure: '#EFE0B8',
    texteSurClair: '#8A6620',
    fond: '#FAF5E8',
    surface: '#FDFBF3',
    bordureSurface: '#EBE0C2',
  },
  {
    id: 'sable',
    nom: 'Sable',
    principal: '#A08150',
    fonce: '#846A41',
    clair: '#F7F1E6',
    bordure: '#E8DCC6',
    texteSurClair: '#7A6340',
    fond: '#F8F4EC',
    surface: '#FCFAF5',
    bordureSurface: '#E7DECD',
  },
  {
    id: 'foret',
    nom: 'Forêt',
    principal: '#3F7D4F',
    fonce: '#31633E',
    clair: '#E7F3E9',
    bordure: '#C9E3CE',
    texteSurClair: '#2E5C3A',
    fond: '#EFF6F1',
    surface: '#F7FCF9',
    bordureSurface: '#D3E5D8',
  },
  {
    id: 'menthe',
    nom: 'Menthe',
    principal: '#2E8B74',
    fonce: '#24705D',
    clair: '#E6F4F0',
    bordure: '#C5E4DB',
    texteSurClair: '#246B5A',
    fond: '#EDF6F3',
    surface: '#F6FCFA',
    bordureSurface: '#D2E7E0',
  },
  {
    id: 'lagon',
    nom: 'Lagon',
    principal: '#2F7D8C',
    fonce: '#25646F',
    clair: '#E4F2F5',
    bordure: '#C2E0E6',
    texteSurClair: '#245D68',
    fond: '#EDF5F7',
    surface: '#F6FBFC',
    bordureSurface: '#CFE3E8',
  },
  {
    id: 'indigo',
    nom: 'Indigo',
    principal: '#4A5B9E',
    fonce: '#3B4980',
    clair: '#E9ECF7',
    bordure: '#CDD4EC',
    texteSurClair: '#3A4779',
    fond: '#F0F2F9',
    surface: '#F8F9FD',
    bordureSurface: '#D7DCEE',
  },
  {
    id: 'lavande',
    nom: 'Lavande',
    principal: '#7B6BA8',
    fonce: '#63558A',
    clair: '#F0EDF7',
    bordure: '#DBD3EC',
    texteSurClair: '#5E5183',
    fond: '#F3F1F9',
    surface: '#FAF9FD',
    bordureSurface: '#DFD9EE',
  },
  {
    id: 'prune',
    nom: 'Prune',
    principal: '#7D4A6B',
    fonce: '#653B56',
    clair: '#F4E9F1',
    bordure: '#E3CCDC',
    texteSurClair: '#5F3852',
    fond: '#F7F0F5',
    surface: '#FCF7FA',
    bordureSurface: '#E7D4E0',
  },
  {
    id: 'rose',
    nom: 'Rose poudré',
    principal: '#B85C7A',
    fonce: '#984A63',
    clair: '#FBEAF0',
    bordure: '#F0CEDA',
    texteSurClair: '#8E4459',
    fond: '#FBF0F4',
    surface: '#FEF8FA',
    bordureSurface: '#F2D8E1',
  },
  {
    id: 'ardoise',
    nom: 'Ardoise',
    principal: '#5A6068',
    fonce: '#474C53',
    clair: '#EDEEF0',
    bordure: '#D8DADD',
    texteSurClair: '#464B52',
    fond: '#F1F2F4',
    surface: '#F9FAFB',
    bordureSurface: '#DEE0E3',
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
    '--kat-fond': t.fond,
    '--kat-surface': t.surface,
    '--kat-bordure': t.bordureSurface,
  } as React.CSSProperties;
}
