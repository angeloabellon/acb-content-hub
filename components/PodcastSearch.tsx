"use client";

import { useState } from "react";
import type { PodcastEpisode } from "@/lib/podcasts";

type PodcastSearchProps = {
  episodes: PodcastEpisode[];
};

export default function PodcastSearch({ episodes }: PodcastSearchProps) {
  const [query, setQuery] = useState("");

  const filteredEpisodes = episodes.filter((episode) =>
    episode.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div className="max-w-2xl mx-auto mb-12">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar podcasts por UCAM, Unicaja, Jairis, Copa del 96..."
          className="w-full rounded-2xl border border-red-900/40 bg-black/30 px-5 py-4 text-white placeholder:text-white/40 outline-none focus:border-orange-400 transition-colors"
        />
      </div>

      {filteredEpisodes.length > 0 ? (
        <section className="grid gap-4 md:gap-6">
          {filteredEpisodes.map((episode) => (
            <article
              key={episode.audioUrl}
              className="bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-red-900/40 shadow-2xl overflow-hidden"
            >
              <h2 className="text-lg md:text-2xl font-bold mb-3 leading-tight">
                {episode.title}
              </h2>

              {episode.pubDate && (
                <p className="text-xs md:text-sm text-red-100/70 mb-4">
                  {new Date(episode.pubDate).toLocaleDateString("es-ES")}
                </p>
              )}

              {episode.description && (
                <p className="text-red-100/90 text-sm md:text-base mb-5 line-clamp-3">
                  {episode.description}
                </p>
              )}

              <div className="w-full max-w-full overflow-hidden">
                <audio controls preload="none" className="w-full max-w-full">
                  <source src={episode.audioUrl} />
                  Tu navegador no soporta el reproductor de audio.
                </audio>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <p className="text-center text-white/60">
          No se han encontrado podcasts con esa búsqueda.
        </p>
      )}
    </>
  );
}