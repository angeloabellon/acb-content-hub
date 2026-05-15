import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getVideoIdFromSlug,
  getYouTubeVideoById,
} from "@/lib/youtube";


type VideoPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: VideoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const videoId = getVideoIdFromSlug(slug);
  const video = await getYouTubeVideoById(videoId);

  if (!video) {
    return {
      title: "Vídeo | Cast To Cast Baloncesto",
    };
  }

  const description = video.description.slice(0, 160);

  return {
    title: `${video.title} | Cast To Cast Baloncesto`,
    description,

    openGraph: {
      title: video.title,
      description,
      images: [video.thumbnail],
    },

    twitter: {
      card: "summary_large_image",
      title: video.title,
      description,
      images: [video.thumbnail],
    },
  };
}

export default async function VideoPage({
  params,
}: VideoPageProps) {
  const { slug } = await params;
  const videoId = getVideoIdFromSlug(slug);
  const video = await getYouTubeVideoById(videoId);

  if (!video) {
    notFound();
  }

  const videoStructuredData = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description,
    thumbnailUrl: [video.thumbnail],
    uploadDate: video.publishedAt,
    embedUrl: video.embedUrl,
    publisher: {
      "@type": "Organization",
      name: "Cast To Cast Baloncesto",
      logo: {
        "@type": "ImageObject",
        url: "https://casttocast.es/logo2526.png",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(videoStructuredData),
        }}
      />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-10">
        <section className="mb-6">
          <Link
            href="/videos"
            className="text-sm text-red-300 hover:text-orange-400 transition-colors"
          >
            ← Volver a vídeos
          </Link>
        </section>

        <section className="bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 rounded-3xl p-3 md:p-5 border border-red-900/40 shadow-2xl">
          <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
            <iframe
              className="w-full h-full"
              src={video.embedUrl}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </section>

        <section className="mt-8 max-w-4xl">
          <p className="uppercase tracking-[0.18em] text-red-300/80 text-xs font-semibold mb-4">
            Cast To Cast Baloncesto
          </p>

          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-6">
            {video.title}
          </h1>

          {video.description && (
            <p className="text-white/70 text-base md:text-lg leading-relaxed whitespace-pre-line line-clamp-6">
              {video.description}
            </p>
          )}
        </section>
      </main>
    </>
  );
}