import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import ShareButton from "@/components/ShareButton";
import { siteConfig } from "@/config/site";
import {
  getPodcastEpisodeBySlug,
  getPodcastStaticParams,
} from "@/lib/podcasts";

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
      title: `Podcast no encontrado | ${siteConfig.name}`,
    };
  }

  const description =
    episode.description?.slice(0, 160) ??
    "Episodio del podcast de Cast To Cast Baloncesto.";

  const pageUrl = `${siteConfig.url}/podcasts/${episode.slug}`;
  const imageUrl = `${siteConfig.url}/og/podcast-cover.png`;

  return {
    metadataBase: new URL(siteConfig.url),
    title: `${episode.title} | Podcast | ${siteConfig.name}`,
    description,

    alternates: {
      canonical: `/podcasts/${episode.slug}`,
    },

    openGraph: {
      title: `${episode.title} | ${siteConfig.name}`,
      description,
      url: pageUrl,
      siteName: siteConfig.name,
      type: "article",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: "Podcasts de Cast To Cast Baloncesto",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: `${episode.title} | ${siteConfig.name}`,
      description,
      images: [imageUrl],
    },
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

  const pageUrl = `${siteConfig.url}/podcasts/${episode.slug}`;

  const formattedDate = episode.pubDate
    ? new Intl.DateTimeFormat("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(episode.pubDate))
    : null;

  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <div className="mb-10">
        <Link
          href="/podcasts"
          className="inline-flex items-center gap-2 text-sm md:text-base text-white/70 hover:text-orange-400 transition-colors"
        >
          ← Volver a Podcasts
        </Link>
      </div>

      <article className="overflow-hidden rounded-3xl border border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] shadow-[0_10px_40px_rgba(122,12,12,0.22)]">
        <div className="grid gap-8 p-6 md:grid-cols-[220px_1fr] md:p-8">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
            <Image
              src="/og/podcast-cover.png"
              alt="Cast To Cast Baloncesto Podcast"
              fill
              priority
              sizes="220px"
              className="object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-br from-[#7a0c0c]/30 via-transparent to-black/40" />
          </div>

          <div className="min-w-0">
            <p className="uppercase tracking-[0.2em] text-red-300/70 text-xs font-semibold mb-4">
              Podcast Cast To Cast
            </p>

            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-white mb-6">
              {episode.title}
            </h1>

            <div className="mb-8 flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full border border-white/10 bg-[#7a0c0c]/20 px-3 py-1 text-xs text-white/70">
                Podcast
              </span>

              {formattedDate && (
                <span className="inline-flex rounded-full border border-white/10 bg-[#7a0c0c]/20 px-3 py-1 text-xs text-white/70">
                  {formattedDate}
                </span>
              )}
            </div>

            <div className="rounded-2xl border border-red-900/40 bg-black/40 p-4 backdrop-blur">
              <audio controls preload="none" className="w-full">
                <source src={episode.audioUrl} />
                Tu navegador no soporta audio HTML5.
              </audio>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <ShareButton
                title={episode.title}
                url={pageUrl}
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
            </div>
          </div>
        </div>
      </article>

      <section className="mt-12 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <p className="uppercase tracking-[0.2em] text-red-300/70 text-xs font-semibold mb-4">
          Sobre este episodio
        </p>

        <p className="text-gray-300 leading-relaxed">
          Escucha este episodio de Cast To Cast Baloncesto, con tertulia,
          análisis y actualidad del baloncesto desde el punto de vista del
          aficionado.
        </p>
      </section>
    </main>
  );
}