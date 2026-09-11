import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import {
  ShieldCheck,
  Store,
  MessageCircle,
  Mail,
  ExternalLink,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { getBoutiquesAdmin } from '@/lib/queries/admin';
import { getCurrentProfile } from '@/lib/queries/merchant';
import { formatPrice, formatDisplayPhone, cleanWhatsAppNumber } from '@/lib/utils/formatters';
import { BoutonRoleAdmin } from '@/components/dashboard/BoutonRoleAdmin';

/** Les données changent à chaque inscription : aucune mise en cache. */
export const dynamic = 'force-dynamic';

function dateCourte(iso: string | null): string {
  if (!iso) return 'jamais';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default async function AdminPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login?redirect=/admin');

  const boutiques = await getBoutiquesAdmin();

  // `null` = la fonction a refusé l'appel. On ne dit pas « accès refusé » à un
  // marchand ordinaire : il n'a pas à savoir que cette page existe.
  if (boutiques === null) redirect('/dashboard');

  const totalArticles = boutiques.reduce((s, b) => s + Number(b.nb_articles), 0);
  const totalCommandes = boutiques.reduce((s, b) => s + Number(b.nb_commandes), 0);
  const totalVentes = boutiques.reduce((s, b) => s + Number(b.total_ventes), 0);
  const actives = boutiques.filter((b) => Number(b.nb_articles) > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-[#2E2C24] text-white flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#2E2C24]">
            Administration
          </h1>
          <p className="text-xs sm:text-sm text-[#726C5C] mt-0.5">
            Les marchands inscrits sur KAT et leur activité.
          </p>
        </div>
      </div>

      {/* Chiffres de la plateforme */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Boutiques', valeur: String(boutiques.length) },
          { label: 'Avec des articles', valeur: `${actives}/${boutiques.length}` },
          { label: 'Articles au total', valeur: String(totalArticles) },
          { label: 'Commandes', valeur: String(totalCommandes) },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl bg-[#FBF8F2] border border-[#E4DAC4] p-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#726C5C]">
              {s.label}
            </p>
            <p className="text-2xl font-extrabold font-display text-[#2E2C24] mt-1">
              {s.valeur}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-[#EBF0DE] border border-[#DDE6C9] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#54602F]">
          Volume cumulé des commandes
        </p>
        <p className="text-2xl font-extrabold font-display text-[#54602F] mt-1">
          {formatPrice(totalVentes, profile.devise || 'FCFA')}
        </p>
        <p className="text-[11px] text-[#726C5C] mt-1">
          Commandes annulées exclues. Toutes devises confondues — à interpréter
          avec prudence si des boutiques n&apos;utilisent pas le FCFA.
        </p>
      </div>

      {/* Rappel de confidentialité */}
      <div className="rounded-2xl bg-[#FBF3DC] border border-[#EFE0B8] p-3.5 flex gap-2.5">
        <AlertTriangle className="w-4 h-4 text-[#B98A2E] shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#8A6620] leading-relaxed">
          Cette page contient les coordonnées personnelles des marchands. Elles
          servent à les accompagner, pas à les démarcher. Ne les exportez pas et
          ne les transmettez à personne.
        </p>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {boutiques.map((b) => (
          <div
            key={b.id}
            className="rounded-2xl bg-[#FBF8F2] border border-[#E4DAC4] p-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#EBF0DE] border border-[#E4DAC4] shrink-0">
                {b.logo_url ? (
                  <Image src={b.logo_url} alt="" fill sizes="48px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#54602F] font-bold text-sm font-display">
                    {b.nom_boutique.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-bold text-sm text-[#2E2C24] truncate">
                    {b.nom_boutique}
                  </h2>
                  {b.est_admin ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2E2C24] text-white">
                      Admin
                    </span>
                  ) : null}
                  {!b.email_confirme ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FBECE8] text-[#B4553C] border border-[#F5C6CB]">
                      Email non confirmé
                    </span>
                  ) : null}
                </div>

                <p className="text-[11px] text-[#726C5C] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-[#6B7A3D]" />
                  {b.ville || '—'}
                  <span className="text-[#E4DAC4]">·</span>
                  inscrit le {dateCourte(b.inscrit_le)}
                  <span className="text-[#E4DAC4]">·</span>
                  vu {dateCourte(b.derniere_connexion)}
                </p>
              </div>

              <Link
                href={`/c/${b.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 p-2 rounded-lg text-[#726C5C] hover:text-[#6B7A3D] hover:bg-[#EBF0DE] transition-colors"
                title="Voir la vitrine"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>

            {/* Coordonnées */}
            <div className="flex flex-wrap gap-2">
              {b.email ? (
                <a
                  href={`mailto:${b.email}`}
                  className="inline-flex items-center gap-1.5 text-[11px] bg-[#F6F1E7] border border-[#E4DAC4] rounded-full px-2.5 py-1 text-[#2E2C24] hover:border-[#6B7A3D] transition-colors max-w-full"
                >
                  <Mail className="w-3 h-3 text-[#726C5C] shrink-0" />
                  <span className="truncate">{b.email}</span>
                </a>
              ) : null}

              <a
                href={`https://wa.me/${cleanWhatsAppNumber(b.whatsapp_number)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] bg-[#E8F8EE] border border-[#BDEBD0] rounded-full px-2.5 py-1 text-[#1E7E34] hover:bg-[#d5f3df] transition-colors"
              >
                <MessageCircle className="w-3 h-3 text-[#25D366] shrink-0" />
                {formatDisplayPhone(b.whatsapp_number)}
              </a>

              <span className="inline-flex items-center gap-1.5 text-[11px] bg-[#F6F1E7] border border-[#E4DAC4] rounded-full px-2.5 py-1 text-[#726C5C]">
                <Store className="w-3 h-3 shrink-0" />
                /c/{b.slug}
              </span>
            </div>

            {/* Activité */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#E4DAC4]/60">
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-[#726C5C]">
              <span>
                <strong className="text-[#2E2C24]">{b.nb_articles}</strong>{' '}
                {Number(b.nb_articles) > 1 ? 'articles' : 'article'}
              </span>
              <span>
                <strong className="text-[#2E2C24]">{b.nb_commandes}</strong>{' '}
                {Number(b.nb_commandes) > 1 ? 'commandes' : 'commande'}
              </span>
                <span>
                  <strong className="text-[#6B7A3D]">
                    {formatPrice(Number(b.total_ventes), 'FCFA')}
                  </strong>{' '}
                  de ventes
                </span>
              </div>

              <BoutonRoleAdmin
                profileId={b.id}
                nomBoutique={b.nom_boutique}
                estAdmin={b.est_admin}
                estMoi={b.id === profile.id}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
