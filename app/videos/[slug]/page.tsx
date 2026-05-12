import he from "he";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type VideoPageProps = {
  params: Promise<{
    slug: string;
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

export async function generateMetadata({
  params,
}: VideoPageProps): Promise<Metadata> {
  const { slug } = await params;

  const videoId = slug.split("-").pop() || "";

  const video = await getVideoData(videoId);

  if (!video) {
    return {
      title: "Vídeo | Cast To Cast Baloncesto",
    };
  }

  const title = he.decode(video.snippet.title);

  const description = he
    .decode(video.snippet.description || "")
    .slice(0, 160);

  const thumbnail =
    video.snippet.thumbnails.maxres?.url ||
    video.snippet.thumbnails.high?.url ||
    video.snippet.thumbnails.medium?.url;

  return {
    title: `${title} | Cast To Cast Baloncesto`,
    description,

    openGraph: {
      title,
      description,
      images: [thumbnail],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [thumbnail],
    },
  };
}

export default async function VideoPage({
  params,
}: VideoPageProps) {
  const { slug } = await params;

  const videoId = slug.split("-").pop() || "";

  const video = await getVideoData(videoId);

  if (!video) {
    notFound();
  }

  const title = he.decode(video.snippet.title);

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