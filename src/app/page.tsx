import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MessageCircle,
  ShoppingBag,
  Sparkles,
  Zap,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Share2,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F6F1E7] text-[#2E2C24]">
      {/* Navigation */}
      <header className="border-b border-[#E4DAC4] bg-[#FBF8F2]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#6B7A3D] text-white flex items-center justify-center font-bold font-display text-lg shadow-xs">
              K
            </div>
            <span className="font-bold font-display text-xl tracking-tight text-[#2E2C24]">
              KAT
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/c/douala-chic"
              className="text-xs sm:text-sm font-semibold text-[#726C5C] hover:text-[#2E2C24] hidden sm:block"
            >
              Voir la démo en direct
            </Link>
            <Link href="/dashboard">
              <Button variant="primary" size="sm" className="rounded-xl">
                Espace Marchand
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-12 pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF0DE] border border-[#DDE6C9] text-xs font-semibold text-[#54602F]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Créé pour les commerçants du Cameroun & d&apos;Afrique francophone</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-[#2E2C24] leading-[1.15] max-w-4xl mx-auto">
          Votre catalogue produits en ligne.{' '}
          <span className="text-[#6B7A3D] underline decoration-[#6B7A3D]/30">Prise de commande sur WhatsApp.</span>
        </h1>

        <p className="text-sm sm:text-lg text-[#726C5C] max-w-2xl mx-auto leading-relaxed">
          Fini d&apos;envoyer 50 photos en vrac dans vos statuts ou groupes. Créez votre vitrine en 5 minutes, partagez un lien unique et recevez des commandes structurées prêtes à livrer.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto h-12 text-sm font-bold shadow-md">
              <Zap className="w-4 h-4 mr-2" />
              Créer ma boutique en 5 min
            </Button>
          </Link>

          <Link href="/c/douala-chic" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 text-sm font-bold bg-[#FBF8F2]">
              <Smartphone className="w-4 h-4 mr-2 text-[#6B7A3D]" />
              Tester la vitrine client
            </Button>
          </Link>
        </div>

        {/* Garanties */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-4 text-xs font-medium text-[#726C5C]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#3F7D4F]" /> Gratuit pour démarrer
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#3F7D4F]" /> Mobile-first ultra-rapide (3G)
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#3F7D4F]" /> Zéro création de compte client
          </span>
        </div>
      </section>

      {/* Aperçu interactif du flux */}
      <section className="py-12 bg-[#FBF8F2] border-y border-[#E4DAC4] px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#2E2C24]">
              Comment fonctionne KAT ?
            </h2>
            <p className="text-xs sm:text-sm text-[#726C5C]">
              Un tunnel fluide en 3 étapes simples pour vous et vos clients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Étape 1 */}
            <Card className="p-6 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-[#EBF0DE] text-[#54602F] flex items-center justify-center font-bold font-display text-base">
                1
              </div>
              <h3 className="font-bold text-base text-[#2E2C24] font-display">
                Ajoutez vos produits
              </h3>
              <p className="text-xs text-[#726C5C] leading-relaxed">
                Renseignez le nom, vos prix en FCFA, vos stocks et vos photos depuis votre smartphone.
              </p>
            </Card>

            {/* Étape 2 */}
            <Card className="p-6 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-[#EBF0DE] text-[#54602F] flex items-center justify-center font-bold font-display text-base">
                2
              </div>
              <h3 className="font-bold text-base text-[#2E2C24] font-display">
                Partagez votre lien
              </h3>
              <p className="text-xs text-[#726C5C] leading-relaxed">
                Postez votre lien unique dans votre statut WhatsApp, bio Instagram ou groupes Facebook.
              </p>
            </Card>

            {/* Étape 3 */}
            <Card className="p-6 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-[#E8F8EE] text-[#1E7E34] border border-[#BDEBD0] flex items-center justify-center font-bold font-display text-base">
                3
              </div>
              <h3 className="font-bold text-base text-[#2E2C24] font-display">
                Recevez des commandes nettes
              </h3>
              <p className="text-xs text-[#726C5C] leading-relaxed">
                Le client remplit son panier et vous envoie la commande formatée (avec référence courte et total) sur WhatsApp.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Différenciation vs WhatsApp Business natif */}
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#2E2C24]">
            Pourquoi KAT fait la différence ?
          </h2>
          <p className="text-xs sm:text-sm text-[#726C5C]">
            Ce que WhatsApp Business fait mal, et que KAT perfectionne pour vous.
          </p>
        </div>

        <div className="bg-[#FBF8F2] border border-[#E4DAC4] rounded-2xl overflow-hidden divide-y divide-[#E4DAC4]">
          <div className="grid grid-cols-2 p-4 bg-[#EBF0DE]/60 text-xs font-bold font-display text-[#2E2C24]">
            <span>WhatsApp Business classique</span>
            <span className="text-[#54602F]">Avec votre boutique KAT</span>
          </div>

          <div className="grid grid-cols-2 p-4 text-xs">
            <span className="text-[#726C5C]">Un seul catalogue plat et figé</span>
            <span className="font-semibold text-[#2E2C24]">Plusieurs catalogues thématiques (saisons, promos, arrivages)</span>
          </div>

          <div className="grid grid-cols-2 p-4 text-xs">
            <span className="text-[#726C5C]">Pas de gestion des ruptures de stock</span>
            <span className="font-semibold text-[#2E2C24]">Stock en temps réel avec badge rupture & alertes</span>
          </div>

          <div className="grid grid-cols-2 p-4 text-xs">
            <span className="text-[#726C5C]">Messages désordonnés et perte de commandes</span>
            <span className="font-semibold text-[#2E2C24]">Numéro de référence unique (ex: KAT-01042) et suivi complet</span>
          </div>

          <div className="grid grid-cols-2 p-4 text-xs">
            <span className="text-[#726C5C]">Aucune visibilité sur les statistiques</span>
            <span className="font-semibold text-[#2E2C24]">Compteur de vues, articles les plus consultés & chiffre d&apos;affaires</span>
          </div>

          <div className="grid grid-cols-2 p-4 text-xs">
            <span className="text-[#726C5C]">Pas de Mobile Money intégré</span>
            <span className="font-semibold text-[#2E2C24]">Préparé pour MTN MoMo & Orange Money</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E4DAC4] bg-[#FBF8F2] py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#6B7A3D] text-white flex items-center justify-center font-bold text-xs">
              K
            </div>
            <span className="font-bold text-sm text-[#2E2C24]">KAT</span>
            <span className="text-xs text-[#726C5C]">© 2026 — Tous droits réservés</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#726C5C]">
            <Link href="/dashboard" className="hover:text-[#2E2C24]">Dashboard</Link>
            <Link href="/c/douala-chic" className="hover:text-[#2E2C24]">Catalogue Démo</Link>
            <Link href="/parametres/boutique" className="hover:text-[#2E2C24]">Paramètres</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
