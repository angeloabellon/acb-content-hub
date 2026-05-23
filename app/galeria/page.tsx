import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { galleryCollections } from "@/data/gallery";
import GalleryFilters from "@/components/GalleryFilters";

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
      <section className="text-center mb-14">
        <p className="uppercase tracking-[0.2em] text-red-300/70 text-xs font-semibold mb-4">
          Fotografía deportiva
        </p>

        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
          Galería
        </h1>

        <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
          Imágenes de partidos, protagonistas y ambiente del baloncesto desde la
          mirada de Cast To Cast. Fotografía deportiva gentileza de nuestro
          amigo y colaborador Antonio Martínez.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <a
            href="https://x.com/anmasa73"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 px-6 py-3 rounded-xl border border-red-900/40 shadow-xl text-white font-semibold transition-all duration-300 hover:-translate-y-1 hover:text-orange-400 hover:shadow-2xl"
          >
            🐦 Ver perfil en X / Twitter
          </a>

          <a
            href="https://instagram.com/anmasa73sports"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 px-6 py-3 rounded-xl border border-red-900/40 shadow-xl text-white font-semibold transition-all duration-300 hover:-translate-y-1 hover:text-orange-400 hover:shadow-2xl"
          >
            📸 Ver perfil en Instagram
          </a>
        </div>
      </section>

<GalleryFilters collections={galleryCollections} />
    </main>
  );
}