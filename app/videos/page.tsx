import he from "he";
import VideoCard from "../components/VideoCard";
import type { Route } from "next";
type YouTubeVideo = {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
};
async function getYouTubeVideos(): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  // 1. Obtener playlist de subidas del canal
  const channelResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`,
    { cache: "no-store" }
  );

  const channelData = await channelResponse.json();
  console.log("CHANNEL ID:", channelId);
console.log("CHANNEL DATA:", channelData);

  const uploadsPlaylistId =
    channelData.items[0].contentDetails.relatedPlaylists.uploads;

  // 2. Obtener vídeos de la playlist
  const videosResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=9&key=${apiKey}`,
    { cache: "no-store" }
  );

  const videosData = await videosResponse.json();

  return videosData.items.map((item: any) => ({
    id: item.snippet.resourceId.videoId,
    title: he.decode(item.snippet.title),

    thumbnail:
      item.snippet.thumbnails.high?.url ||
      item.snippet.thumbnails.medium?.url ||
      item.snippet.thumbnails.default?.url ||
      "/logo2526.png",

    url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
  }));
}
export default async function VideosPage() {
  const videos = await getYouTubeVideos();

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <section className="text-center mb-14">

        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Últimos vídeos de CTC
        </h1>
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {videos.map((video: YouTubeVideo) => (
          <VideoCard
          key={video.id}
          title={video.title}
          thumbnail={video.thumbnail}
          url={`/videos/${video.id}` as Route}
        />
        ))}
      </section>
    </main>
  );
}