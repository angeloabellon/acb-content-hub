"use client";

import { useState } from "react";
import type { Route } from "next";
import VideoCard from "./VideoCard";
import type { YouTubeVideo } from "@/lib/youtube";

type VideoSearchProps = {
  videos: YouTubeVideo[];
};

export default function VideoSearch({ videos }: VideoSearchProps) {
  const [query, setQuery] = useState("");

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div className="max-w-2xl mx-auto mb-12">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar vídeos por UCAM, Unicaja, Jairis, Copa del 96..."
          className="w-full rounded-2xl border border-red-900/40 bg-black/30 px-5 py-4 text-white placeholder:text-white/40 outline-none focus:border-orange-400 transition-colors"
        />
      </div>

      {filteredVideos.length > 0 ? (
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVideos.map((video) => (
            <VideoCard
              key={video.id}
              title={video.title}
              thumbnail={video.thumbnail}
              url={`/videos/${video.slug}` as Route}
            />
          ))}
        </section>
      ) : (
        <p className="text-center text-white/60">
          No se han encontrado vídeos con esa búsqueda.
        </p>
      )}
    </>
  );
}