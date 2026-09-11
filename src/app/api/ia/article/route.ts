import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { getCurrentProfile } from '@/lib/queries/merchant';

/**
 * Rédaction assistée d'une fiche article.
 *
 * Le marchand saisit quelques mots — « cartable rebecca bonbon » — et Claude
 * cherche le produit sur le web pour en retrouver l'appellation commerciale
 * exacte et rédiger un descriptif de vente.
 *
 * Réservée aux marchands connectés : chaque appel consomme du budget API, une
 * route ouverte serait consommée par n'importe qui.
 */

export const maxDuration = 60;

/**
 * Modèle utilisé, surchargeable sans toucher au code.
 *
 * Haiku 4.5 par défaut : c'est le moins cher du catalogue (1 $ / 5 $ le million
 * de jetons contre 5 $ / 25 $ pour Opus 5) et la tâche — retrouver un nom de
 * produit et rédiger trois phrases — ne demande pas davantage.
 */
const MODELE = process.env.KAT_IA_MODEL || 'claude-haiku-4-5';

/**
 * Deux recherches suffisent pour un article courant, et c'est le poste le plus
 * lourd de la facture : les pages rapportées sont réinjectées dans le modèle,
 * et chaque recherche est facturée 0,01 $.
 */
const RECHERCHES_MAX = 2;

interface Suggestion {
  nom: string;
  description: string;
  sources: string[];
}

const SYSTEM = `Tu rédiges des fiches produit pour de petits commerçants d'Afrique francophone qui vendent sur WhatsApp.

Méthode :
1. Cherche le produit sur le web pour identifier son appellation commerciale exacte (marque, modèle, gamme).
2. Rédige une description de vente en français.

Contraintes sur le nom :
- L'appellation commerciale réelle si tu la trouves, sinon un nom descriptif clair.
- Jamais de prix, jamais de nom de boutique concurrente.

Contraintes sur la description :
- 2 à 4 phrases, 40 à 80 mots.
- Décris ce qui est vérifiable : matière, format, compartiments, fermetures, coloris, usage.
- N'invente aucune caractéristique que tes recherches ne confirment pas. Dans le doute, reste général plutôt que d'affirmer.
- Pas de prix, pas de promesse de livraison, pas de superlatif creux ("incroyable", "le meilleur").
- Vouvoiement, ton commerçant, pas de jargon marketing.

Réponds UNIQUEMENT par un objet JSON, sans texte autour et sans bloc de code :
{"nom": "...", "description": "..."}`;

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "L'assistant n'est pas configuré. Ajoutez la variable ANTHROPIC_API_KEY dans Vercel.",
      },
      { status: 503 }
    );
  }

  // Une clé API se consomme : on n'ouvre pas la porte aux visiteurs anonymes.
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: 'Session expirée.' }, { status: 401 });
  }

  let indice = '';
  let categorie = '';
  try {
    const body = await request.json();
    indice = String(body.indice ?? '').trim();
    categorie = String(body.categorie ?? '').trim();
  } catch {
    return NextResponse.json({ error: 'Requête illisible.' }, { status: 400 });
  }

  if (indice.length < 3) {
    return NextResponse.json(
      { error: 'Donnez au moins trois lettres décrivant l’article.' },
      { status: 400 }
    );
  }

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: MODELE,
      // La réponse tient en un objet JSON de trois lignes : plafonner bas évite
      // de payer une sortie bavarde, facturée cinq fois le prix de l'entrée.
      max_tokens: 1500,
      system: SYSTEM,
      // Recherche web côté Anthropic : sans elle le modèle ne pourrait que
      // paraphraser l'indice, alors que le but est de retrouver le vrai produit.
      //
      // Variante de base `_20250305` et non `_20260209` : le filtrage dynamique
      // de la seconde n'existe que sur les modèles Opus et Sonnet récents, pas
      // sur Haiku.
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
          max_uses: RECHERCHES_MAX,
        },
      ],
      messages: [
        {
          role: 'user',
          content: `Article à décrire : « ${indice} »${
            categorie ? `\nCatégorie de la boutique : ${categorie}` : ''
          }\nBoutique : ${profile.nom_boutique}${
            profile.ville ? ` (${profile.ville})` : ''
          }`,
        },
      ],
    });

    // Un refus renvoie un 200 avec stop_reason « refusal » : sans ce contrôle on
    // lirait un contenu vide en croyant à une réponse valide.
    if (response.stop_reason === 'refusal') {
      return NextResponse.json(
        { error: "L'assistant n'a pas pu traiter cette demande." },
        { status: 422 }
      );
    }

    const texte = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    const suggestion = extraireJson(texte);
    if (!suggestion) {
      return NextResponse.json(
        { error: "Réponse inattendue de l'assistant. Réessayez." },
        { status: 502 }
      );
    }

    // Les sources consultées, pour que le marchand puisse vérifier lui-même.
    const sources: string[] = [];
    for (const block of response.content) {
      if (block.type === 'web_search_tool_result' && Array.isArray(block.content)) {
        for (const r of block.content) {
          if ('url' in r && typeof r.url === 'string') sources.push(r.url);
        }
      }
    }

    return NextResponse.json({
      ...suggestion,
      sources: [...new Set(sources)].slice(0, 4),
    } satisfies Suggestion);
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: 'Assistant momentanément saturé. Réessayez dans un instant.' },
        { status: 429 }
      );
    }
    if (e instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "Clé ANTHROPIC_API_KEY invalide." },
        { status: 503 }
      );
    }

    console.error('Assistant article :', e);
    return NextResponse.json(
      { error: "L'assistant est indisponible pour le moment." },
      { status: 502 }
    );
  }
}

/**
 * Extrait l'objet JSON de la réponse.
 *
 * On demande du JSON nu, mais un modèle peut l'entourer d'un bloc de code ou
 * d'une phrase d'introduction : on récupère donc la première accolade équilibrée
 * plutôt que de faire échouer toute la requête sur un caractère en trop.
 */
function extraireJson(texte: string): { nom: string; description: string } | null {
  const debut = texte.indexOf('{');
  const fin = texte.lastIndexOf('}');
  if (debut === -1 || fin <= debut) return null;

  try {
    const brut = JSON.parse(texte.slice(debut, fin + 1));
    const nom = String(brut.nom ?? '').trim();
    const description = String(brut.description ?? '').trim();
    if (!nom || !description) return null;
    return { nom, description };
  } catch {
    return null;
  }
}
