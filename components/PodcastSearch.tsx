"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { PodcastEpisode } from "@/lib/podcasts";

type PodcastSearchProps = {
  episodes: PodcastEpisode[];
};

export default function PodcastSearch({ episodes }: PodcastSearchProps) {
  const [query, setQuery] = useState("");

  const filteredEpisodes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return episodes;

    return episodes.filter((episode) =>
      episode.title.toLowerCase().includes(normalizedQuery)
    );
  }, [episodes, query]);

  return (
    <>
      <div className="mb-10">
        <p className="uppercase tracking-[0.2em] text-red-300/70 text-xs font-semibold mb-4">
          Episodios
        </p>

        <div className="max-w-2xl">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por UCAM, Unicaja, Jairis, Copa del 96..."
            className="w-full rounded-2xl border border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] px-5 py-4 text-white placeholder:text-white/40 outline-none shadow-[0_10px_40px_rgba(122,12,12,0.18)] transition-all duration-300 focus:border-red-700/60 focus:ring-2 focus:ring-red-900/40"
          />
        </div>
      </div>

      {filteredEpisodes.length > 0 ? (
        <section className="grid gap-6">
          {filteredEpisodes.map((episode) => {
            const formattedDate = episode.pubDate
              ? new Intl.DateTimeFormat("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(new Date(episode.pubDate))
              : null;

            return (
              <article
                key={episode.slug}
                className="group overflow-hidden rounded-3xl border border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] shadow-[0_10px_40px_rgba(122,12,12,0.22)] transition-all duration-500 hover:-translate-y-1 hover:border-red-700/50 hover:shadow-[0_18px_60px_rgba(224,19,16,0.24)]"
              >
                <div className="grid gap-6 p-5 md:grid-cols-[180px_1fr] md:p-6">
                  <Link
                    href={`/podcasts/${episode.slug}`}
                    className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-black"
                  >
                    <Image
                      src="/og/podcast-cover.png"
                      alt="Cast To Cast Baloncesto Podcast"
                      fill
                      sizes="180px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-br from-[#7a0c0c]/30 via-transparent to-black/40" />
                  </Link>

                  <div className="min-w-0">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-full border border-white/10 bg-[#7a0c0c]/20 px-3 py-1 text-xs text-white/70">
                        Podcast
                      </span>

                      {formattedDate && (
                        <span className="inline-flex rounded-full border border-white/10 bg-[#7a0c0c]/20 px-3 py-1 text-xs text-white/70">
                          {formattedDate}
                        </span>
                      )}
                    </div>

                    <Link href={`/podcasts/${episode.slug}`} className="block">
                      <h2 className="text-xl md:text-2xl font-bold leading-tight text-white transition-colors duration-300 group-hover:text-orange-400">
                        {episode.title}
                      </h2>
                    </Link>

                    <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <Link
                        href={`/podcasts/${episode.slug}`}
                        className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-red-300 transition-colors duration-300 hover:text-orange-400"
                      >
                        Ver episodio
                        <span>→</span>
                      </Link>

                      <div className="w-full lg:max-w-md overflow-hidden">
                        <audio
                          controls
                          preload="none"
                          className="w-full max-w-full"
                        >
                          <source src={episode.audioUrl} />
                          Tu navegador no soporta el reproductor de audio.
                        </audio>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
          <p className="text-white/60">
            No se han encontrado podcasts con esa búsqueda.
          </p>
        </div>
      )}
    </>
  );
}