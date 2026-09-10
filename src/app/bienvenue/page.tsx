import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, ExternalLink, LayoutDashboard, CheckCircle2 } from 'lucide-react';
import { getCurrentProfile } from '@/lib/queries/merchant';
import { getProducts } from '@/lib/queries/dashboard';
import { Card } from '@/components/ui/Card';

/**
 * Page d'arrivée après un clic sur le lien de connexion.
 *
 * Le marchand vient de valider son identité depuis sa boîte mail, souvent sur
 * un autre appareil que celui d'où il a demandé le lien. On lui confirme donc
 * explicitement qui il est avant de l'envoyer dans son espace.
 */
export default async function BienvenuePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login');

  const products = await getProducts(profile.id);
  const isNouvelle = products.length === 0;

  return (
    <div className="min-h-screen bg-[#F6F1E7] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#E7F3E9] text-[#3F7D4F] mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold font-display text-[#2E2C24]">
            Vous êtes connecté
          </h1>
          <p className="text-sm text-[#726C5C]">
            Bienvenue, <span className="font-semibold text-[#2E2C24]">{profile.nom_boutique}</span>.
          </p>
        </div>

        <Card className="p-6 space-y-4">
          <p className="text-xs text-[#726C5C] leading-relaxed">
            {isNouvelle
              ? "Votre boutique est créée. Il ne reste qu'à y ajouter vos premiers articles pour que vos clients puissent commander."
              : `Votre catalogue compte ${products.length} ${products.length > 1 ? 'articles' : 'article'}. Vos clients peuvent commander dès maintenant sur WhatsApp.`}
          </p>

          <Link
            href="/dashboard"
            className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-[#6B7A3D] text-white font-semibold text-sm hover:bg-[#54602F] transition-colors shadow-xs"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Accéder à mon catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href={`/c/${profile.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#726C5C] hover:text-[#6B7A3D] transition-colors py-1"
          >
            <span>Voir ma vitrine telle que la voient mes clients</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </Card>

        <p className="text-center text-[11px] text-[#9B9484]">
          Lien de connexion à usage unique — il ne fonctionnera plus une seconde fois.
        </p>
      </div>
    </div>
  );
}
