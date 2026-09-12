import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import {
  Search,
  Store,
  MapPin,
  MessageCircle,
  TrendingDown,
  PackageSearch,
} from 'lucide-react';
import { rechercher } from '@/lib/queries/recherche';
import { formatPrice, cleanWhatsAppNumber } from '@/lib/utils/formatters';
import { MarqueKat } from '@/components/brand/LogoKat';

export const metadata: Metadata = {
  title: 'Rechercher un article ou une boutique — KAT',
  description:
    "Trouvez l'article que vous cherchez chez les commerçants proches de vous, comparez les prix et commandez directement sur WhatsApp.",
};

interface RecherchePageProps {
  searchParams: Promise<{ q?: string }>;
}

const SUGGESTIONS = ['Sac', 'Cartable', 'Robe', 'Chaussures'];

export default async function RecherchePage({ searchParams }: RecherchePageProps) {
  const { q } = await searchParams;
  const terme = (q ?? '').trim();
  const aCherche = terme.length >= 2;

  const { boutiques, articles, nbBoutiquesVendeuses } = aCherche
    ? await rechercher(terme)
    : { boutiques: [], articles: [], nbBoutiquesVendeuses: 0 };

  // Repère du meilleur prix : les articles sont déjà triés par prix croissant.
  const meilleurPrix = articles.length > 0 ? articles[0].prix_effectif : null;
  const comparaisonUtile = nbBoutiquesVendeuses > 1;

  return (
    <div className="min-h-screen bg-[#F6F1E7] text-[#2E2C24] pb-16">
      {/* En-tête */}
      <header className="bg-[#FBF8F2] border-b border-[#E4DAC4] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 space-y-3.5">
          <div className="flex items-center gap-3">
            {/* Un seul retour vers l'accueil : le logo le signale aussi bien
                qu'une flèche, et signe la page au passage. */}
            <Link
              href="/"
              className="w-9 h-9 rounded-xl bg-[#6B7A3D] text-[#F7F2E2] flex items-center justify-center shadow-xs shrink-0 hover:bg-[#54602F] transition-colors"
              aria-label="Retour à l'accueil KAT"
            >
              <MarqueKat className="w-6 h-6" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold font-display leading-tight">
                Trouver un article
              </h1>
              <p className="text-[11px] text-[#726C5C]">
                Comparez les prix des commerçants et commandez sur WhatsApp
              </p>
            </div>
          </div>

          {/* Formulaire en GET : la recherche reste partageable par son lien et
              fonctionne même si le JavaScript n'a pas encore chargé. */}
          <form action="/recherche" method="get" className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-[#726C5C] pointer-events-none" />
            <input
              type="search"
              name="q"
              defaultValue={terme}
              placeholder="Un article, ou le nom d'une boutique…"
              aria-label="Rechercher"
              className="w-full bg-[#F6F1E7] border border-[#E4DAC4] rounded-full pl-10 pr-24 py-2.5 text-sm placeholder-[#9B9484] focus:outline-none focus:border-[#6B7A3D] focus:bg-white transition-colors"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-4 py-1.5 rounded-full bg-[#6B7A3D] text-white text-xs font-bold hover:bg-[#54602F] transition-colors"
            >
              Chercher
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* Écran d'accueil de la recherche */}
        {!aCherche ? (
          <div className="text-center py-12 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-[#EBF0DE] text-[#54602F] mx-auto flex items-center justify-center">
              <PackageSearch className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <p className="font-bold font-display text-lg">Que cherchez-vous ?</p>
              <p className="text-xs text-[#726C5C] max-w-sm mx-auto leading-relaxed">
                Tapez le nom d&apos;un article pour voir quelles boutiques le
                proposent et à quel prix. Vous pouvez aussi chercher une boutique
                par son nom.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center pt-2">
              {SUGGESTIONS.map((s) => (
                <Link
                  key={s}
                  href={`/recherche?q=${encodeURIComponent(s)}`}
                  className="px-3.5 py-1.5 rounded-full bg-[#FBF8F2] border border-[#E4DAC4] text-xs font-semibold text-[#726C5C] hover:border-[#6B7A3D] hover:text-[#2E2C24] transition-colors"
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {/* Boutiques correspondantes */}
        {boutiques.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#726C5C]">
              {boutiques.length > 1 ? 'Boutiques trouvées' : 'Boutique trouvée'}
            </h2>

            <div className="grid sm:grid-cols-2 gap-3">
              {boutiques.map((b) => (
                <Link
                  key={b.slug}
                  href={`/c/${b.slug}`}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FBF8F2] border border-[#E4DAC4] hover:border-[#6B7A3D] transition-colors"
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#EBF0DE] border border-[#E4DAC4] shrink-0">
                    {b.logo_url ? (
                      <Image
                        src={b.logo_url}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#54602F] font-bold text-sm font-display">
                        {b.nom_boutique.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm truncate">{b.nom_boutique}</p>
                    <p className="text-[11px] text-[#726C5C] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#6B7A3D]" />
                      {b.ville || 'Cameroun'}
                      <span className="text-[#E4DAC4]">·</span>
                      {b.nb_articles} {b.nb_articles > 1 ? 'articles' : 'article'}
                    </p>
                  </div>

                  <Store className="w-4 h-4 text-[#726C5C] shrink-0" />
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* Articles, du moins cher au plus cher */}
        {articles.length > 0 ? (
          <section className="space-y-3">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#726C5C]">
                {articles.length} {articles.length > 1 ? 'articles' : 'article'} pour
                «&nbsp;{terme}&nbsp;»
              </h2>
              {comparaisonUtile ? (
                <span className="text-[11px] text-[#54602F] bg-[#EBF0DE] border border-[#DDE6C9] rounded-full px-2.5 py-0.5 font-semibold">
                  {nbBoutiquesVendeuses} boutiques · triés du moins cher au plus cher
                </span>
              ) : null}
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {articles.map((a) => {
                const enPromo = a.prix_promo && a.prix_promo > 0;
                const estMeilleurPrix =
                  comparaisonUtile && a.prix_effectif === meilleurPrix;

                const lienWhatsApp = `https://wa.me/${cleanWhatsAppNumber(
                  a.boutique.whatsapp_number
                )}?text=${encodeURIComponent(
                  `Bonjour ${a.boutique.nom_boutique}, je suis intéressé(e) par « ${a.nom} » vu sur votre catalogue KAT.`
                )}`;

                return (
                  <article
                    key={a.id}
                    className="rounded-2xl bg-[#FBF8F2] border border-[#E4DAC4] overflow-hidden flex flex-col"
                  >
                    <Link href={`/c/${a.boutique.slug}`} className="block">
                      <div className="relative aspect-[4/3] bg-[#F6F1E7]">
                        {a.images && a.images.length > 0 ? (
                          <Image
                            src={a.images[0]}
                            alt={a.nom}
                            fill
                            sizes="(max-width: 640px) 100vw, 320px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-[#9B9484]">
                            Sans photo
                          </div>
                        )}

                        {estMeilleurPrix ? (
                          <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#3F7D4F] text-white text-[10px] font-bold shadow-xs">
                            <TrendingDown className="w-3 h-3" />
                            Meilleur prix
                          </span>
                        ) : null}

                        {!a.en_stock || a.stock <= 0 ? (
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#B4553C] text-white text-[10px] font-bold">
                            Rupture
                          </span>
                        ) : null}
                      </div>
                    </Link>

                    <div className="p-3.5 space-y-2.5 flex-1 flex flex-col">
                      <div className="space-y-1 flex-1">
                        <h3 className="font-bold text-sm leading-tight line-clamp-2">
                          {a.nom}
                        </h3>

                        <Link
                          href={`/c/${a.boutique.slug}`}
                          className="text-[11px] text-[#726C5C] hover:text-[#6B7A3D] inline-flex items-center gap-1 transition-colors"
                        >
                          <Store className="w-3 h-3" />
                          <span className="font-semibold">{a.boutique.nom_boutique}</span>
                          {a.boutique.ville ? (
                            <>
                              <span className="text-[#E4DAC4]">·</span>
                              <span>{a.boutique.ville}</span>
                            </>
                          ) : null}
                        </Link>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-extrabold font-display text-[#6B7A3D]">
                          {formatPrice(a.prix_effectif, 'FCFA')}
                        </span>
                        {enPromo ? (
                          <span className="text-[11px] text-[#9B9484] line-through">
                            {formatPrice(a.prix, 'FCFA')}
                          </span>
                        ) : null}
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/c/${a.boutique.slug}`}
                          className="flex-1 rounded-xl bg-[#F6F1E7] border border-[#E4DAC4] py-2 text-[11px] font-bold text-center hover:bg-[#EBF0DE] transition-colors"
                        >
                          Voir la boutique
                        </Link>
                        <a
                          href={lienWhatsApp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 rounded-xl bg-[#E8F8EE] border border-[#BDEBD0] text-[#1E7E34] py-2 text-[11px] font-bold text-center inline-flex items-center justify-center gap-1 hover:bg-[#d5f3df] transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                          Commander
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        {/* Aucun résultat */}
        {aCherche && articles.length === 0 && boutiques.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[#FBF8F2] border border-[#E4DAC4] rounded-2xl space-y-3">
            <PackageSearch className="w-12 h-12 text-[#726C5C] mx-auto opacity-40" />
            <p className="font-semibold">Rien trouvé pour «&nbsp;{terme}&nbsp;»</p>
            <p className="text-xs text-[#726C5C] max-w-sm mx-auto leading-relaxed">
              Essayez un mot plus court ou plus courant — «&nbsp;sac&nbsp;» plutôt
              que «&nbsp;sac à dos rouge&nbsp;».
            </p>
            <div className="flex flex-wrap gap-2 justify-center pt-2">
              {SUGGESTIONS.map((s) => (
                <Link
                  key={s}
                  href={`/recherche?q=${encodeURIComponent(s)}`}
                  className="px-3.5 py-1.5 rounded-full bg-[#F6F1E7] border border-[#E4DAC4] text-xs font-semibold text-[#726C5C] hover:border-[#6B7A3D] transition-colors"
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
