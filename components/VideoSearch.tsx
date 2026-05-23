"use client";

import { useState } from "react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import type { YouTubeVideo } from "@/lib/youtube";

type VideoSearchProps = {
  videos: YouTubeVideo[];
};

export default function VideoSearch({
  videos,
}: VideoSearchProps) {
  const [query, setQuery] = useState("");

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      {/* BUSCADOR */}
      <div className="max-w-2xl mx-auto mb-14">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar vídeos por UCAM, Unicaja, Jairis, Copa del 96..."
          className="w-full rounded-2xl border border-red-900/40 bg-black/30 px-5 py-4 text-white placeholder:text-white/40 outline-none transition-colors focus:border-orange-400"
        />
      </div>

      {/* GRID DE VÍDEOS */}
      {filteredVideos.length > 0 ? (
        <section className="grid sm:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredVideos.map((video) => (
            <Link
              key={video.id}
              href={`/videos/${video.slug}` as Route}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition-all duration-300 hover:-translate-y-2 hover:border-orange-400/40 hover:bg-white/10 hover:shadow-2xl"
            >
              {/* THUMBNAIL */}
              <div className="relative aspect-video overflow-hidden bg-black">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1400px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />

                {/* PLAY */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <span className="text-2xl text-white ml-1">
                      ▶
                    </span>
                  </div>
                </div>
              </div>

              {/* INFO */}
              <div className="p-5 md:p-6">
                <p className="uppercase whitespace-nowrap tracking-[0.14em] text-red-300/70 text-[9px] font-semibold mb-3">
  Cast To Cast
</p>
                <h3 className="text-lg md:text-xl font-bold leading-tight text-white transition-colors duration-300 group-hover:text-orange-300 line-clamp-3">
                  {video.title}
                </h3>
              </div>
            </Link>
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