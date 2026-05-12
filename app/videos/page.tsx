import VideoCard from "../components/VideoCard";
import { getLatestYouTubeVideos } from "@/lib/youtube";
import type { Route } from "next";

export default async function VideosPage() {
  const videos = await getLatestYouTubeVideos(9);

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <section className="text-center mb-14">
        <p className="uppercase tracking-[0.18em] text-red-300/80 text-sm font-semibold mb-5">
          Cast To Cast Baloncesto
        </p>

        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
          Últimos vídeos de CTC
        </h1>

        <p className="text-white/70 max-w-2xl mx-auto text-lg">
          Tertulias, análisis y contenido especial sobre el baloncesto de
          Murcia, Málaga y sus protagonistas.
        </p>
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            title={video.title}
            thumbnail={video.thumbnail}
            url={`/videos/${video.slug}` as Route}
          />
        ))}
      </section>
    </main>
  );
}