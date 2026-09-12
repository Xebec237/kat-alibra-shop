import React from 'react';
import { MarqueKat } from '@/components/brand/LogoKat';
import Link from 'next/link';
import Image from 'next/image';
import {
  MessageCircle,
  Search,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Share2,
  Camera,
  Store,
  Star,
  ShieldCheck,
} from 'lucide-react';
import { VITRINE_DEMO } from '@/lib/landing/vitrine-demo';
import { formatPrice } from '@/lib/utils/formatters';
import { PhoneMockup } from '@/components/landing/PhoneMockup';

const CATEGORIES = [
  { nom: 'Sacs', emoji: '👜' },
  { nom: 'Robes', emoji: '👗' },
  { nom: 'Chaussures', emoji: '👠' },
  { nom: 'Montres', emoji: '⌚' },
  { nom: 'Beauté', emoji: '💄' },
  { nom: 'Enfants', emoji: '🎒' },
];

const ETAPES = [
  {
    icone: Store,
    titre: 'Créez votre boutique',
    texte:
      "Votre nom, votre numéro WhatsApp, votre adresse email. Aucun mot de passe à retenir : vous vous connectez par un lien reçu par mail.",
  },
  {
    icone: Camera,
    titre: 'Photographiez vos articles',
    texte:
      "Une photo prise au téléphone, un prix, et l'article est en ligne. Vos clients le voient immédiatement.",
  },
  {
    icone: Share2,
    titre: 'Partagez votre lien',
    texte:
      "Un seul lien à envoyer dans vos statuts et vos groupes. Les commandes arrivent structurées sur votre WhatsApp.",
  },
];

/**
 * La page d'accueil ne consulte plus la base : la vitrine qu'elle présente est
 * une démonstration figée. Elle est donc rendue une fois pour toutes au
 * déploiement, et s'affiche même si Supabase est injoignable.
 */
export default function HomePage() {
  const showcase = VITRINE_DEMO;
  const vedette = showcase.produits[0];

  return (
    <div className="min-h-screen bg-[#F6F1E7] text-[#2E2C24]">
      {/* ---------------------------------------------------------------- */}
      {/* Navigation                                                        */}
      {/* ---------------------------------------------------------------- */}
      <header className="border-b border-[#E4DAC4] bg-[#F6F1E7]/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-[#6B7A3D] text-[#F7F2E2] flex items-center justify-center shadow-xs shrink-0">
              <MarqueKat className="w-6 h-6" />
            </span>
            <span className="font-bold font-display text-xl tracking-tight">KAT</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/recherche"
              className="text-xs sm:text-sm font-semibold text-[#726C5C] hover:text-[#2E2C24] transition-colors hidden sm:block"
            >
              Voir les boutiques
            </Link>
            <Link
              href="/recherche"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#726C5C] hover:text-[#2E2C24] transition-colors px-2"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Rechercher</span>
            </Link>
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-[#726C5C] hover:text-[#2E2C24] transition-colors px-2"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#6B7A3D] text-white px-4 py-2 text-xs sm:text-sm font-bold hover:bg-[#54602F] transition-colors shadow-xs"
            >
              Ouvrir ma boutique
            </Link>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16 sm:pt-16 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        <div className="space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF0DE] border border-[#DDE6C9] text-xs font-semibold text-[#54602F]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pensé pour les commerçants d&apos;Afrique francophone</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold font-display tracking-tight leading-[1.08]">
            Votre boutique en ligne.
            <br />
            <span className="text-[#6B7A3D]">Vos commandes sur WhatsApp.</span>
          </h1>

          <p className="text-sm sm:text-base text-[#726C5C] leading-relaxed max-w-lg mx-auto lg:mx-0">
            Créez un catalogue que vos clients parcourent comme une vraie
            application, et recevez leurs commandes déjà rédigées — articles,
            tailles, adresse, total. Fini les captures d&apos;écran et les
            «&nbsp;c&apos;est combien&nbsp;?&nbsp;» à répétition.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-1">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6B7A3D] text-white px-7 h-13 py-3.5 text-sm font-bold hover:bg-[#54602F] transition-colors shadow-sm"
            >
              <span>Ouvrir ma boutique gratuitement</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/recherche"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FBF8F2] border border-[#E4DAC4] px-7 py-3.5 text-sm font-bold text-[#2E2C24] hover:bg-[#EBF0DE] hover:border-[#DDE6C9] transition-colors"
            >
              <span>Parcourir les boutiques</span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 justify-center lg:justify-start pt-2 text-xs text-[#726C5C]">
            {['Sans commission', 'Sans mot de passe', 'Prêt en 5 minutes'].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#6B7A3D]" />
                {t}
              </span>
            ))}
          </div>

          {/* Entrée acheteur : tout le monde n'arrive pas ici pour ouvrir une
              boutique, beaucoup viennent chercher un article. */}
          <div className="pt-4 border-t border-[#E4DAC4] space-y-2">
            <p className="text-xs font-semibold text-[#726C5C]">
              Vous cherchez plutôt à acheter ?
            </p>
            <form
              action="/recherche"
              method="get"
              className="relative flex items-center max-w-md mx-auto lg:mx-0"
            >
              <Search className="absolute left-3.5 w-4 h-4 text-[#726C5C] pointer-events-none" />
              <input
                type="search"
                name="q"
                placeholder="Un article, une boutique…"
                aria-label="Rechercher un article ou une boutique"
                className="w-full bg-[#FBF8F2] border border-[#E4DAC4] rounded-full pl-10 pr-24 py-2.5 text-sm placeholder-[#9B9484] focus:outline-none focus:border-[#6B7A3D] focus:bg-white transition-colors"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-4 py-1.5 rounded-full bg-[#2E2C24] text-white text-xs font-bold hover:bg-[#3D3A30] transition-colors"
              >
                Chercher
              </button>
            </form>
          </div>
        </div>

        {/* Aperçu de vitrine — boutique de démonstration */}
        <div className="relative">
          <PhoneMockup
            nomBoutique={showcase.nomBoutique}
            ville={showcase.ville}
            produits={showcase.produits}
          />
          <p className="text-center text-[11px] text-[#9B9484] mt-6">
            Exemple de vitrine —{' '}
            <span className="font-semibold text-[#726C5C]">{showcase.nomBoutique}</span>
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Catégories                                                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-y border-[#E4DAC4] bg-[#FBF8F2]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-[#9B9484] mb-6">
            Quoi que vous vendiez
          </p>
          <div className="flex items-start justify-between gap-2 sm:gap-4">
            {CATEGORIES.map((c) => (
              <div key={c.nom} className="flex flex-col items-center gap-2 flex-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#F6F1E7] border border-[#E4DAC4] flex items-center justify-center text-xl sm:text-2xl">
                  {c.emoji}
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-[#726C5C] text-center">
                  {c.nom}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Ce que voit le client                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
            Ce que votre client voit
          </h2>
          <p className="text-sm text-[#726C5C] max-w-xl mx-auto">
            Une fiche article soignée, qui donne envie d&apos;acheter et répond
            aux questions avant qu&apos;elles ne soient posées.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center max-w-3xl mx-auto">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-[#FBF8F2] border border-[#E4DAC4] shadow-sm">
            <Image
              src={vedette.images[0]}
              alt={vedette.nom}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold font-display leading-tight">
              {vedette.nom}
            </h3>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#B98A2E] text-[#B98A2E]" />
                ))}
              </div>
              <span className="text-xs text-[#726C5C]">Avis clients</span>
            </div>

            <p className="text-2xl font-extrabold font-display text-[#6B7A3D]">
              {formatPrice(vedette.prix_promo ?? vedette.prix, 'FCFA')}
            </p>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#726C5C]">
                Tailles
              </p>
              <div className="flex gap-2">
                {['S', 'M', 'L', 'XL'].map((t, i) => (
                  <span
                    key={t}
                    className={`w-9 h-9 rounded-xl border text-xs font-bold flex items-center justify-center ${
                      i === 1
                        ? 'bg-[#6B7A3D] text-white border-[#6B7A3D]'
                        : 'bg-[#FBF8F2] text-[#2E2C24] border-[#E4DAC4]'
                    }`}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#726C5C]">
                Couleurs
              </p>
              <div className="flex gap-2">
                {['#6B7A3D', '#B4553C', '#2E2C24', '#E4DAC4'].map((c, i) => (
                  <span
                    key={c}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-full border-2 ${
                      i === 0 ? 'border-[#2E2C24]' : 'border-[#E4DAC4]'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <span className="flex-1 rounded-full bg-[#FBF8F2] border border-[#E4DAC4] py-3 text-xs font-bold text-center text-[#2E2C24]">
                Ajouter au panier
              </span>
              <span className="flex-1 rounded-full bg-[#25D366] py-3 text-xs font-bold text-center text-white inline-flex items-center justify-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5" />
                Commander
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Comment ça marche                                                 */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-t border-[#E4DAC4] bg-[#FBF8F2]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
              Trois étapes, et vous vendez
            </h2>
            <p className="text-sm text-[#726C5C]">
              Pas de site à construire, pas de technicien à payer.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {ETAPES.map((e, i) => {
              const Icone = e.icone;
              return (
                <div
                  key={e.titre}
                  className="relative rounded-3xl bg-[#F6F1E7] border border-[#E4DAC4] p-6 space-y-3"
                >
                  <span className="absolute top-5 right-5 text-3xl font-extrabold font-display text-[#E4DAC4]">
                    {i + 1}
                  </span>
                  <div className="w-11 h-11 rounded-2xl bg-[#EBF0DE] text-[#54602F] flex items-center justify-center">
                    <Icone className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold font-display text-base">{e.titre}</h3>
                  <p className="text-xs text-[#726C5C] leading-relaxed">{e.texte}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Appel à l'action final                                            */}
      {/* ---------------------------------------------------------------- */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="relative rounded-[2rem] bg-gradient-to-br from-[#2E2C24] via-[#3D3A30] to-[#54602F] px-6 sm:px-12 py-12 sm:py-16 text-center overflow-hidden">
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/5" />
          <div className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-white/5" />

          <div className="relative z-10 space-y-5">
            <h2 className="text-2xl sm:text-4xl font-extrabold font-display text-white leading-tight">
              Votre première vente vous attend
            </h2>
            <p className="text-sm text-[#EBF0DE] max-w-md mx-auto leading-relaxed">
              Ouvrez votre boutique en cinq minutes et partagez votre lien dès
              aujourd&apos;hui. C&apos;est gratuit, et vous gardez cent pour cent
              de vos ventes.
            </p>

            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-[#2E2C24] px-8 py-3.5 text-sm font-bold hover:bg-[#EBF0DE] transition-colors shadow-sm"
            >
              <span>Ouvrir ma boutique</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="text-[11px] text-[#EBF0DE]/70 inline-flex items-center gap-1.5 justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
              Sans carte bancaire, sans engagement
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Pied de page                                                      */}
      {/* ---------------------------------------------------------------- */}
      <footer className="border-t border-[#E4DAC4] bg-[#FBF8F2]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#6B7A3D] text-[#F7F2E2] flex items-center justify-center shrink-0">
              <MarqueKat className="w-5 h-5" />
            </span>
            <span className="text-xs text-[#726C5C]">
              KAT — Vendez proprement sur WhatsApp
            </span>
          </div>

          <div className="flex items-center gap-5 text-xs text-[#726C5C]">
            <Link href="/register" className="hover:text-[#2E2C24] transition-colors">
              Créer une boutique
            </Link>
            <Link href="/login" className="hover:text-[#2E2C24] transition-colors">
              Connexion
            </Link>
            <Link href="/recherche" className="hover:text-[#2E2C24] transition-colors">
              Boutiques
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
