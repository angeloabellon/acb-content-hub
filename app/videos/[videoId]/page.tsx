import he from "he";
import { notFound } from "next/navigation";

type VideoPageProps = {
  params: Promise<{
    videoId: string;
  }>;
};

async function getVideoData(videoId: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`,
    { cache: "no-store" }
  );

  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    return null;
  }

  return data.items[0];
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { videoId } = await params;

  const video = await getVideoData(videoId);

  if (!video) {
    notFound();
  }

  const title = he.decode(video.snippet.title);
  const description = he.decode(video.snippet.description || "");

  return (
  <main className="max-w-6xl mx-auto px-4 md:px-6 py-10">

    <section className="bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 rounded-2xl p-3 md:p-5 border border-red-900/40 shadow-2xl">

      <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">

        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />

      </div>

    </section>

    <section className="mt-6">

      <h1 className="text-2xl md:text-4xl font-bold leading-tight">
        {title}
      </h1>

    </section>

  </main>
);
}