import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ShareButton from "@/components/ShareButton";

import { siteConfig } from "@/config/site";
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
      title: `Vídeo | ${siteConfig.name}`,
    };
  }

  const description =
    video.description?.slice(0, 160) ||
    "Vídeo de Cast To Cast Baloncesto.";

  return {
    metadataBase: new URL(siteConfig.url),

    title: `${video.title} | ${siteConfig.name}`,
    description,

    alternates: {
      canonical: `/videos/${slug}`,
    },

    openGraph: {
      title: `${video.title} | ${siteConfig.name}`,
      description,
      url: `${siteConfig.url}/videos/${slug}`,
      siteName: siteConfig.name,
      type: "video.other",
      images: [
        {
          url: video.thumbnail,
          width: 1280,
          height: 720,
          alt: video.title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: `${video.title} | ${siteConfig.name}`,
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

  const videoUrl = `${siteConfig.url}/videos/${slug}`;

  const videoStructuredData = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description,
    thumbnailUrl: [video.thumbnail],
    uploadDate: video.publishedAt,
    embedUrl: video.embedUrl,
    url: videoUrl,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}${siteConfig.logo}`,
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

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-16">
        {/* VOLVER */}
        <section className="mb-8">
          <Link
            href="/videos"
            className="inline-flex items-center gap-2 text-sm md:text-base text-white/70 hover:text-orange-400 transition-colors"
          >
            ← Volver a vídeos
          </Link>
        </section>

        {/* REPRODUCTOR */}
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

        {/* INFORMACIÓN DEL VÍDEO */}
        <section className="mt-10 max-w-4xl">
          <p className="uppercase tracking-[0.18em] text-red-300/80 text-xs font-semibold mb-4">
            Cast To Cast Baloncesto
          </p>

          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-6">
            {video.title}
          </h1>

          {video.publishedAt && (
            <p className="text-sm text-white/50 mb-8">
              Publicado el{" "}
              {new Date(video.publishedAt).toLocaleDateString("es-ES")}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <ShareButton
              title={video.title}
              url={videoUrl}
              text="Compartir vídeo"
            />

            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-all hover:border-orange-400/30 hover:text-orange-300"
            >
              Ver en YouTube →
            </a>
          </div>
        </section>
      </main>
    </>
  );
}