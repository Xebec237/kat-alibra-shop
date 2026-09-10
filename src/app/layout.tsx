import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#6B7A3D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "KAT — Créez votre catalogue produits & vendez sur WhatsApp",
  description: "La solution la plus simple pour les commerçants africains de créer un catalogue en ligne partageable et recevoir des commandes structurées sur WhatsApp.",
  // Pas d'`icons` explicite : Next.js détecte `src/app/icon.svg` (le K de KAT).
  // Forcer /favicon.ico afficherait le logo Next.js livré par create-next-app.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${manrope.variable}`}>
      <body className="antialiased bg-[#F6F1E7] text-[#2E2C24] min-h-screen selection:bg-[#EBF0DE] selection:text-[#54602F]">
        {children}
      </body>
    </html>
  );
}
