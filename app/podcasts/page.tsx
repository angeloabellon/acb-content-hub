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
<section className="text-center mb-14">
  <p className="uppercase tracking-[0.2em] text-red-300/70 text-xs font-semibold mb-4">
    Podcast Cast To Cast
  </p>

  <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
    Podcasts
  </h1>

  <p className="text-white/70 max-w-2xl mx-auto text-lg leading-relaxed">
    Escucha los episodios de Cast To Cast directamente desde nuestra web:
    tertulias, análisis y actualidad del baloncesto con el punto de vista del
    aficionado.
  </p>

  {latestEpisode && (
    <div className="mt-10 max-w-3xl mx-auto rounded-3xl border border-red-900/40 bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 p-6 md:p-8 shadow-2xl">
      <p className="uppercase tracking-[0.18em] text-red-100/70 text-[11px] font-semibold mb-3">
        Último episodio
      </p>

      <h2 className="text-xl md:text-2xl font-bold leading-snug mb-5">
        {latestEpisode.title}
      </h2>

      <a
        href="#episodios"
        className="inline-flex rounded-xl bg-black/30 px-5 py-3 text-sm font-semibold text-white border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:text-orange-400"
      >
        Ver episodios
      </a>
    </div>
  )}
</section>

      <section id="episodios">
        <PodcastSearch episodes={episodes} />
      </section>
    </main>
  );
}