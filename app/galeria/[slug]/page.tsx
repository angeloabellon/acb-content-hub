import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { galleryCollections } from "@/data/gallery";
import { siteConfig } from "@/config/site";
import GalleryClient from "@/components/GalleryClient";

type GalleryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return galleryCollections.map((collection) => ({
    slug: collection.slug,
  }));
}

export async function generateMetadata({
  params,
}: GalleryPageProps): Promise<Metadata> {
  const { slug } = await params;

  const collection = galleryCollections.find(
    (item) => item.slug === slug
  );

  if (!collection) {
    return {
      title: "Galería no encontrada | Cast To Cast Baloncesto",
      description: "La galería solicitada no está disponible.",
    };
  }

  return {
    metadataBase: new URL(siteConfig.url),

    title: `${collection.title} | Galería | ${siteConfig.name}`,
    description: collection.description,

    alternates: {
      canonical: `/galeria/${collection.slug}`,
    },

    openGraph: {
      title: `${collection.title} | ${siteConfig.name}`,
      description: collection.description,
      url: `${siteConfig.url}/galeria/${collection.slug}`,
      siteName: siteConfig.name,
      type: "article",
      images: [
        {
          url: collection.cover,
          width: 1200,
          height: 630,
          alt: collection.title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: `${collection.title} | ${siteConfig.name}`,
      description: collection.description,
      images: [collection.cover],
    },
  };
}

export default async function GalleryCollectionPage({
  params,
}: GalleryPageProps) {
  const { slug } = await params;

  const collection = galleryCollections.find(
    (item) => item.slug === slug
  );

  if (!collection) {
    notFound();
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-10">
        <Link
          href="/galeria"
          className="inline-flex items-center gap-2 text-sm md:text-base text-white/70 hover:text-orange-400 transition-colors"
        >
          ← Volver a Galería
        </Link>
      </div>

      <section className="text-center mb-14">
        <p className="uppercase tracking-[0.18em] text-red-300/80 text-sm font-semibold mb-5">
          Galería Cast To Cast
        </p>

        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
          {collection.title}
        </h1>

        <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
          {collection.description}
        </p>

        <p className="text-sm text-white/50 mt-4">
          {collection.photos.length} fotografías
        </p>
      </section>

      <GalleryClient photos={collection.photos} />
    </main>
  );
}