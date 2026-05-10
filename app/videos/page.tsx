import he from "he";
import VideoCard from "../components/VideoCard";
type YouTubeVideo = {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
};
async function getYouTubeVideos(): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet&order=date&maxResults=9&type=video`,
    { next: { revalidate: 3600 } }
  );

  const data = await response.json();

  return data.items.map((video: any) => ({
    id: video.id.videoId,
    title: he.decode(video.snippet.title),
    thumbnail: video.snippet.thumbnails.high.url,
    url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
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
            url={video.url}
          />
        ))}
      </section>
    </main>
  );
}