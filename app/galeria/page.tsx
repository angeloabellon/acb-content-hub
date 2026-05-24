import type { Metadata } from "next";

import GalleryFilters from "@/components/GalleryFilters";
import { siteConfig } from "@/config/site";
import { galleryCollections } from "@/data/gallery";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),

  title: `Galería | ${siteConfig.name}`,
  description:
    "Galerías fotográficas de Cast To Cast Baloncesto: partidos, afición, protagonistas y contenido visual del baloncesto.",

  alternates: {
    canonical: "/galeria",
  },

  openGraph: {
    title: `Galería | ${siteConfig.name}`,
    description:
      "Fotografías de partidos, afición y protagonistas del baloncesto en Cast To Cast.",
    url: `${siteConfig.url}/galeria`,
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: "/og/galeria-cover.jpg",
        width: 1200,
        height: 630,
        alt: "Galería Cast To Cast Baloncesto",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `Galería | ${siteConfig.name}`,
    description:
      "Fotografías de partidos, afición y protagonistas del baloncesto en Cast To Cast.",
    images: ["/og/galeria-cover.jpg"],
  },
};

export default function GaleriaPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      {/* HERO EDITORIAL */}
      <section className="relative overflow-hidden rounded-3xl border border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] px-5 py-12 sm:px-8 sm:py-16 md:px-14 md:py-24 mb-20 shadow-[0_10px_40px_rgba(122,12,12,0.22)]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#7a0c0c]/35 via-transparent to-[#e01310]/15 pointer-events-none" />

        <div className="relative z-10 text-center">
          <p className="uppercase tracking-[0.2em] text-red-300/70 text-xs font-semibold mb-5">
            Fotografía deportiva
          </p>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            El baloncesto también
            <span className="block text-red-500">
              se cuenta con imágenes
            </span>
          </h1>

          <p className="text-lg text-white/70 max-w-3xl mx-auto leading-relaxed">
            Galerías de partidos, protagonistas y ambiente desde la mirada de
            Cast To Cast. Fotografía deportiva gentileza de nuestro amigo y
            colaborador Antonio Martínez.
          </p>


        </div>
      </section>

      <GalleryFilters collections={galleryCollections} />
    </main>
  );
}