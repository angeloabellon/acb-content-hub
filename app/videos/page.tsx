import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import VideoSearch from "@/components/VideoSearch";
import SectionHeader from "@/components/ui/SectionHeader";

import { createMetadata } from "@/lib/seo";
import { getLatestYouTubeVideos } from "@/lib/youtube";

export const metadata: Metadata = createMetadata({
  title: "Vídeos",
  description:
    "Tertulias, análisis y contenido especial sobre el baloncesto de la Región de Murcia y Málaga.",
  path: "/videos",
  image: "/og/videos-cover.jpg",
});

export default async function VideosPage() {
  const videos = await getLatestYouTubeVideos(12);
  const [featuredVideo, ...restVideos] = videos;

  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      {/* CABECERA */}
      <section className="text-center mb-20">
        <p className="uppercase tracking-[0.18em] text-red-300/80 text-sm font-semibold mb-5">
          Cast To Cast Baloncesto
        </p>

        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
          Vídeos
        </h1>

        <p className="text-white/70 max-w-3xl mx-auto text-lg leading-relaxed">
          Tertulias, análisis y contenido especial sobre el baloncesto de la
          Región de Murcia y Málaga.
        </p>
      </section>

      {/* ÚLTIMO VÍDEO DESTACADO */}
      {featuredVideo && (
        <section className="mb-24">
          <SectionHeader
            eyebrow="Último vídeo"
            title="El contenido más reciente de Cast To Cast"
            description="Accede al último episodio publicado en nuestro canal y sigue toda la actualidad del baloncesto desde la mirada del aficionado."
          />

          <Link
            href={`/videos/${featuredVideo.slug}`}
            className="group block overflow-hidden rounded-3xl border border-red-900/40 bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-orange-400/40"
          >
            <div className="grid lg:grid-cols-2 gap-8 p-6 md:p-8 items-center">
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-black/30">
                <Image
                  src={featuredVideo.thumbnail}
                  alt={featuredVideo.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                    <span className="text-3xl text-white ml-1">▶</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="uppercase tracking-[0.18em] text-orange-300 text-xs font-semibold mb-4">
                  Nuevo episodio
                </p>

                <h2 className="text-3xl md:text-5xl font-extrabold leading-tight mb-6 group-hover:text-orange-300 transition-colors">
                  {featuredVideo.title}
                </h2>

                <p className="text-white/75 leading-relaxed mb-8">
                  Mira el último vídeo de Cast To Cast Baloncesto y accede al
                  resto de tertulias, especiales y análisis publicados en la
                  web.
                </p>

                <span className="inline-flex rounded-xl bg-white px-5 py-3 font-semibold text-black transition-colors group-hover:bg-orange-400 group-hover:text-white">
                  Ver vídeo →
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* RESTO DE VÍDEOS */}
      <section>
        <SectionHeader
          eyebrow="Videoteca"
          title="Últimos vídeos publicados"
          description="Explora tertulias, episodios especiales, entrevistas y contenido audiovisual de Cast To Cast Baloncesto."
        />

        <VideoSearch videos={restVideos} />
      </section>
    </main>
  );
}