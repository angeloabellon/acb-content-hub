import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EpisodeChapters } from "@/components/episodes/EpisodeChapters";
import { EpisodeTranscript } from "@/components/episodes/EpisodeTranscript";
import { getRenderableChaptersByEpisodeId } from "@/lib/chapters";
import { getEpisodeBySlug, getEpisodes } from "@/lib/episodes";
import { createMetadata } from "@/lib/seo";
import { getRenderableTranscriptByEpisodeId } from "@/lib/transcripts";
import type { EpisodePlatform } from "@/types/episode";

type EpisodePageProps = {
  params: Promise<{ slug: string }>;
};

const platformLabels: Record<EpisodePlatform, string> = {
  youtube: "Ver en YouTube",
  ivoox: "Escuchar en iVoox",
  applePodcasts: "Apple Podcasts",
  spotify: "Escuchar en Spotify",
};

export function generateStaticParams() {
  return getEpisodes().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: EpisodePageProps): Promise<Metadata> {
  const { slug } = await params;
  const episode = getEpisodeBySlug(slug);

  if (!episode) {
    return { title: "Episodio no encontrado" };
  }

  return createMetadata({
    title: `${episode.title} | Episodio`,
    description: episode.description,
    path: `/episodios/${episode.slug}`,
    image: episode.thumbnail,
    type: "article",
  });
}

export default async function EpisodePage({ params }: EpisodePageProps) {
  const { slug } = await params;
  const episode = getEpisodeBySlug(slug);

  if (!episode) {
    notFound();
  }

  const platformEntries = Object.entries(episode.platforms) as [
    EpisodePlatform,
    string,
  ][];
  const transcript = getRenderableTranscriptByEpisodeId(episode.id);
  const chapters = getRenderableChaptersByEpisodeId(episode.id);

  return (
    <main className="max-w-6xl mx-auto px-6 py-12 md:py-16">
      <Link
        href="/episodios"
        className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition-colors hover:text-orange-300"
      >
        ← Volver a Episodios
      </Link>

      <article className="mt-8 overflow-hidden rounded-3xl border border-red-900/40 bg-gradient-to-br from-[#7a0c0c]/80 via-[#3a0808]/90 to-black shadow-2xl">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-72 lg:min-h-full">
            <Image
              src={episode.thumbnail}
              alt={`Miniatura de ${episode.title}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/30" />
          </div>

          <div className="p-6 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-300">
              {episode.kind === "special" ? "Especial" : "Episodio"} · {episode.id}
            </p>
            <h1 className="mt-5 text-3xl font-extrabold leading-tight md:text-5xl">
              {episode.title}
            </h1>
            <time dateTime={episode.date} className="mt-6 block text-sm text-white/60">
              {new Intl.DateTimeFormat("es-ES", {
                dateStyle: "long",
              }).format(new Date(`${episode.date}T12:00:00`))}
            </time>
            <p className="mt-6 text-base leading-relaxed text-white/80 md:text-lg">
              {episode.description}
            </p>

            <div className="mt-8">
              <h2 className="text-sm font-bold uppercase tracking-widest text-white/55">
                Participan
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2 p-0">
                {episode.participants.map((participant) => (
                  <li
                    key={participant.name}
                    className="mb-0 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm text-white/85"
                  >
                    {participant.name}
                    {participant.role ? ` · ${participant.role}` : ""}
                  </li>
                ))}
              </ul>
            </div>

            {platformEntries.length > 0 && (
              <div className="mt-8">
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/55">
                  Disponible en
                </h2>
                <div className="mt-3 flex flex-wrap gap-3">
                  {platformEntries.map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-black transition-colors hover:bg-orange-400 hover:text-white"
                    >
                      {platformLabels[platform]} →
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>

      {transcript ? <EpisodeTranscript transcript={transcript} /> : null}

      <EpisodeChapters chapters={chapters} youtubeUrl={episode.platforms.youtube} />
    </main>
  );
}
