import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getPodcastEpisodeBySlug,
  getPodcastStaticParams,
} from "@/lib/podcasts";

import { siteConfig } from "@/config/site";
import ShareButton from "@/components/ShareButton";

type PodcastPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return await getPodcastStaticParams();
}

export async function generateMetadata({
  params,
}: PodcastPageProps): Promise<Metadata> {
  const { slug } = await params;

  const episode = await getPodcastEpisodeBySlug(slug);

  if (!episode) {
    return {
      title: "Podcast no encontrado | Cast To Cast Baloncesto",
    };
  }

  return {
    metadataBase: new URL(siteConfig.url),

    title: `${episode.title} | Podcast | ${siteConfig.name}`,

    description: episode.description.slice(0, 160),

    alternates: {
      canonical: `/podcasts/${episode.slug}`,
    },

    openGraph: {
      title: `${episode.title} | ${siteConfig.name}`,

      description: episode.description.slice(0, 160),

      url: `${siteConfig.url}/podcasts/${episode.slug}`,

      siteName: siteConfig.name,

      type: "article",

images: [
  {
    url: `${siteConfig.url}/og/podcast-cover.png`,
    width: 1200,
    height: 630,
    alt: "Podcasts de Cast To Cast Baloncesto",
  },
],
    },

    twitter: {
  card: "summary_large_image",
  images: [`${siteConfig.url}/og/podcast-cover.png`],
}
  };
}

export default async function PodcastEpisodePage({
  params,
}: PodcastPageProps) {
  const { slug } = await params;

  const episode = await getPodcastEpisodeBySlug(slug);

  if (!episode) {
    notFound();
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-10">
        <Link
          href="/podcasts"
          className="inline-flex items-center gap-2 text-sm md:text-base text-white/70 hover:text-orange-400 transition-colors"
        >
          ← Volver a Podcasts
        </Link>
      </div>

      <section className="mb-12">
        <p className="uppercase tracking-[0.18em] text-red-300/80 text-sm font-semibold mb-5">
          Podcast Cast To Cast
        </p>

        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-8">
          {episode.title}
        </h1>

        <p className="text-white/60 text-sm mb-8">
          {episode.pubDate}
        </p>

        <div className="bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 rounded-3xl border border-red-900/40 shadow-2xl p-6 md:p-8">
          <audio
            controls
            className="w-full"
            src={episode.audioUrl}
          >
            Tu navegador no soporta audio HTML5.
          </audio>
        </div>
      </section>

<section className="mt-12 flex flex-col sm:flex-row gap-4">
  <ShareButton
    title={episode.title}
    url={`${siteConfig.url}/podcasts/${episode.slug}`}
    text="Compartir episodio"
  />

  <a
    href={episode.link}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-all hover:border-orange-400/30 hover:text-orange-300"
  >
    Escuchar en iVoox →
  </a>
</section>
    </main>
  );
}