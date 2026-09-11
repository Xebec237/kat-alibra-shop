'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  BookOpen,
  ShoppingBag,
  Users,
  Settings,
  ShieldCheck,
  ExternalLink,
  Store,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Profile } from '@/lib/supabase/types';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';

interface SidebarProps {
  profile?: Profile;
  /** Affiche l’entrée Administration. */
  estAdmin?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ profile, estAdmin = false }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    if (isSupabaseConfigured) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }

    router.push('/login');
    router.refresh();
  };

  const navigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Produits', href: '/produits', icon: Package },
    { name: 'Catégories', href: '/categories', icon: FolderTree },
    { name: 'Catalogues', href: '/catalogues', icon: BookOpen },
    { name: 'Commandes', href: '/commandes', icon: ShoppingBag },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Paramètres boutique', href: '/parametres/boutique', icon: Settings },
    // Réservée au super administrateur : masquée pour tous les autres.
    ...(estAdmin
      ? [{ name: 'Administration', href: '/admin', icon: ShieldCheck }]
      : []),
  ];

  const storeSlug = profile?.slug || 'douala-chic';

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-[#FBF8F2] border-b border-[#E4DAC4] sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#6B7A3D] text-white flex items-center justify-center font-bold font-display text-sm">
            K
          </div>
          {/* L'application s'appelle KAT ; le nom de la boutique a sa place en
              bas de la barre, à côté de son logo, pas dans l'identité du produit. */}
          <span className="font-bold font-display text-base text-[#2E2C24]">
            KAT
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl border border-[#E4DAC4] text-[#2E2C24] bg-[#F6F1E7]"
          aria-label="Menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop mobile */}
      {isOpen ? (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-[#2E2C24]/30 backdrop-blur-xs"
          onClick={() => setIsOpen(false)}
        />
      ) : null}

      {/* Sidebar Desktop / Drawer Mobile */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#FBF8F2] border-r border-[#E4DAC4] flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="p-5 border-b border-[#E4DAC4] flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#6B7A3D] text-white flex items-center justify-center font-bold font-display text-lg shadow-xs">
              K
            </div>
            <div>
              <span className="font-bold font-display text-lg tracking-tight text-[#2E2C24]">
                KAT
              </span>
              <span className="text-[10px] text-[#726C5C] block -mt-1 font-medium">
                Espace Marchand
              </span>
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-[#726C5C] hover:bg-[#E4DAC4]/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bouton boutique en ligne */}
        <div className="p-4 border-b border-[#E4DAC4]/60">
          <a
            href={`/c/${storeSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#EBF0DE] border border-[#DDE6C9] text-[#54602F] text-xs font-semibold hover:bg-[#DDE6C9] transition-colors"
          >
            <div className="flex items-center gap-2 truncate">
              <Store className="w-4 h-4 shrink-0" />
              <span className="truncate">Voir ma vitrine</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-1" />
          </a>
        </div>

        {/* Liens de navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-[#6B7A3D] text-white font-semibold shadow-xs"
                    : "text-[#726C5C] hover:text-[#2E2C24] hover:bg-[#F6F1E7]"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-[#726C5C]")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profil & Déconnexion en bas */}
        <div className="p-4 border-t border-[#E4DAC4] bg-[#FBF8F2] flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {/* Le logo tel qu'il apparaît sur la vitrine, avec repli sur les
                initiales — le marchand reconnaît sa boutique d'un coup d'œil. */}
            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-[#EBF0DE] border border-[#E4DAC4] shrink-0">
              {profile?.logo_url ? (
                <Image
                  src={profile.logo_url}
                  alt=""
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-xs text-[#54602F] font-display">
                  {profile?.nom_boutique
                    ? profile.nom_boutique.substring(0, 2).toUpperCase()
                    : 'KA'}
                </div>
              )}
            </div>

            <p className="text-xs font-bold text-[#2E2C24] truncate">
              {profile?.nom_boutique || 'Ma boutique'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="p-1.5 text-[#726C5C] hover:text-[#B4553C] rounded-lg transition-colors disabled:opacity-50"
            title="Se déconnecter"
            aria-label="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
