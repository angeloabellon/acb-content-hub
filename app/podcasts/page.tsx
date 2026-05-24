import type { Metadata } from "next";

import PodcastSearch from "@/components/PodcastSearch";
import { siteConfig } from "@/config/site";
import { getPodcastEpisodes } from "@/lib/podcasts";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),

  title: `Podcasts | ${siteConfig.name}`,
  description:
    "Escucha los últimos episodios del podcast de Cast To Cast Baloncesto: tertulias, análisis y actualidad sobre baloncesto.",

  alternates: {
    canonical: "/podcasts",
  },

  openGraph: {
    title: `Podcasts | ${siteConfig.name}`,
    description:
      "Tertulias, análisis y actualidad del baloncesto en formato podcast.",
    url: `${siteConfig.url}/podcasts`,
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: "/og/podcast-cover.png",
        width: 1200,
        height: 630,
        alt: "Podcasts de Cast To Cast Baloncesto",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `Podcasts | ${siteConfig.name}`,
    description: "Escucha los últimos episodios de Cast To Cast Baloncesto.",
    images: ["/og/podcast-cover.png"],
  },
};

export default async function PodcastsPage() {
  const episodes = await getPodcastEpisodes();
  const latestEpisode = episodes[0];

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      {/* HERO EDITORIAL */}
      <section className="relative overflow-hidden rounded-3xl border border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] px-5 py-12 sm:px-8 sm:py-16 md:px-14 md:py-24 mb-20 shadow-[0_10px_40px_rgba(122,12,12,0.22)]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#7a0c0c]/35 via-transparent to-[#e01310]/15 pointer-events-none" />

        <div className="relative z-10 text-center">
          <div>
            <p className="uppercase tracking-[0.2em] text-red-300/70 text-xs font-semibold mb-5">
              Podcast Cast To Cast
            </p>

            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Baloncesto para escuchar
              <span className="block text-red-500">
                desde la voz del aficionado
              </span>
            </h1>

            <p className="text-lg text-white/70 max-w-3xl leading-relaxed">
              Tertulias, análisis, actualidad y episodios especiales sobre UCAM
              Murcia, Hozono Global Jairis, Unicaja Málaga y el baloncesto FEB.
            </p>
          </div>


        </div>
      </section>
      {/* ÚLTIMO EPISODIO */}
{latestEpisode && (
  <section className="mb-24">
    <div className="relative overflow-hidden rounded-3xl border border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] shadow-[0_10px_40px_rgba(122,12,12,0.22)]">
      <div className="absolute inset-0 bg-gradient-to-r from-[#7a0c0c]/25 via-transparent to-[#e01310]/10" />

      <div className="relative z-10 p-8 md:p-10">
        <p className="uppercase tracking-[0.18em] text-red-300/70 text-xs font-semibold mb-4">
          Último episodio
        </p>

        <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-6 max-w-4xl">
          {latestEpisode.title}
        </h2>

        <p className="text-white/65 leading-relaxed max-w-3xl mb-8">
          Escucha el episodio más reciente publicado en Cast To Cast
          Baloncesto y accede a tertulias, análisis y contenido especial sobre
          el baloncesto nacional.
        </p>

        <a
          href="#episodios"
          className="inline-flex rounded-xl bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 px-5 py-3 text-sm font-semibold text-white border border-red-900/40 transition-all duration-300 hover:-translate-y-1 hover:text-orange-300"
        >
          Escuchar episodio →
        </a>
      </div>
    </div>
  </section>
)}

      <section id="episodios">
        <PodcastSearch episodes={episodes} />
      </section>
    </main>
  );
}