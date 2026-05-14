import { getLatestYouTubeVideos } from "@/lib/youtube";
import VideoSearch from "../components/VideoSearch";

export default async function VideosPage() {
  const videos = await getLatestYouTubeVideos(9);

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <section className="text-center mb-14">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
          Vídeos
        </h1>

        <p className="text-white/70 max-w-2xl mx-auto text-lg">
          Tertulias, análisis y contenido especial sobre el baloncesto de
          la Región de Murcia y Málaga.
        </p>
      </section>

      <VideoSearch videos={videos} />
    </main>
  );
}