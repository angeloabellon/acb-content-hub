import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import RelatedContentFromCoverage from "@/components/RelatedContentFromCoverage";
import GalleryClient from "@/components/GalleryClient";
import ShareButton from "@/components/ShareButton";

import { siteConfig } from "@/config/site";
import { galleryCollections } from "@/data/gallery";
import Image from "next/image";
import GalleryCollectionCard from "@/components/GalleryCollectionCard";

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

  const collection = galleryCollections.find((item) => item.slug === slug);

  if (!collection) {
    return {
      title: "Galería no encontrada | Cast To Cast Baloncesto",
    };
  }

  const pageUrl = `${siteConfig.url}/galeria/${collection.slug}`;
  const description =
    collection.description ??
    `Galería fotográfica de ${collection.title} en Cast To Cast Baloncesto.`;

  return {
    metadataBase: new URL(siteConfig.url),

    title: `${collection.title} | Galería | ${siteConfig.name}`,
    description,

    alternates: {
      canonical: `/galeria/${collection.slug}`,
    },

    openGraph: {
      title: `${collection.title} | ${siteConfig.name}`,
      description,
      url: pageUrl,
      siteName: siteConfig.name,
      type: "article",
      images: [
        {
          url: `${siteConfig.url}${collection.cover}`,
          width: 1200,
          height: 630,
          alt: collection.title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: `${collection.title} | ${siteConfig.name}`,
      description,
      images: [`${siteConfig.url}${collection.cover}`],
    },
  };
}

export default async function GalleryCollectionPage({
  params,
}: GalleryPageProps) {
  const { slug } = await params;

  const collection = galleryCollections.find((item) => item.slug === slug);

  if (!collection) {
    notFound();
  }

  const pageUrl = `${siteConfig.url}/galeria/${collection.slug}`;
  const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  name: collection.title,
  description: collection.description,
  url: pageUrl,
  image: collection.photos.slice(0, 12).map((photo) => ({
    "@type": "ImageObject",
    url: `${siteConfig.url}${photo.src}`,
    caption: photo.alt,
  })),
  creator: {
    "@type": "Person",
    name: "Antonio Martínez",
    sameAs: [
      "https://x.com/anmasa73",
      "https://instagram.com/anmasa73sports",
    ],
  },
  publisher: {
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: {
      "@type": "ImageObject",
      url: `${siteConfig.url}${siteConfig.logo}`,
    },
  },
};

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
  }}
/>
      <div className="mb-10">
        <Link
          href="/galeria"
          className="inline-flex items-center gap-2 text-sm md:text-base text-white/70 hover:text-orange-400 transition-colors"
        >
          ← Volver a Galería
        </Link>
      </div>

      <section className="relative overflow-hidden rounded-3xl border border-white/10 mb-12 shadow-2xl min-h-[520px] flex items-end">
<Image
  src={collection.cover}
  alt={collection.title}
  fill
  priority
  className="object-cover"
/>

  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/20" />
  <div className="absolute inset-0 bg-gradient-to-r from-[#7a0c0c]/70 via-black/30 to-[#e01310]/20" />

  <div className="relative z-10 w-full p-8 md:p-12">
    <div className="max-w-4xl">
      <p className="uppercase tracking-[0.2em] text-red-200/80 text-xs font-semibold mb-4">
        Galería fotográfica
      </p>

      <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold mb-6 leading-tight text-white drop-shadow-2xl">
        {collection.title}
      </h1>

      <p className="text-lg text-gray-200 leading-relaxed mb-6 max-w-3xl">
        {collection.description}
      </p>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm text-white/80 mb-8">
<span className="inline-flex w-fit rounded-full border border-white/15 bg-black/40 px-4 py-2 backdrop-blur">
  {collection.photos.length} fotografías
</span>

{collection.competition && (
  <span className="inline-flex w-fit rounded-full border border-white/15 bg-black/40 px-4 py-2 backdrop-blur">
    {collection.competition}
  </span>
)}

{collection.location && (
  <span className="inline-flex w-fit rounded-full border border-white/15 bg-black/40 px-4 py-2 backdrop-blur">
    {collection.location}
  </span>
)}

<span className="inline-flex w-fit rounded-full border border-white/15 bg-black/40 px-4 py-2 backdrop-blur">
  Fotografía: Antonio Martínez
</span>
      </div>

      <ShareButton title={collection.title} url={pageUrl} />
    </div>
  </div>
</section>

      <GalleryClient photos={collection.photos} />
<RelatedContentFromCoverage
  currentType="gallery"
  currentSlug={collection.slug}
/>
      <section className="mt-16 rounded-3xl border border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] p-8 md:p-10 shadow-[0_10px_40px_rgba(122,12,12,0.22)]">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
    <div>
      <p className="uppercase tracking-[0.2em] text-red-300/70 text-xs font-semibold mb-3">
        Fotografía deportiva
      </p>

      <h2 className="text-2xl md:text-3xl font-bold mb-4">
        Imágenes de Antonio Martínez
      </h2>

      <p className="text-gray-300 leading-relaxed max-w-2xl">
        Una mirada cercana al baloncesto, capturando el juego, la grada y los
        protagonistas desde dentro. Su trabajo fotográfico forma parte de la
        identidad visual de Cast To Cast Baloncesto.
      </p>
    </div>

    <div className="flex flex-col sm:flex-row gap-3 shrink-0">
      <a
        href="https://x.com/anmasa73"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:border-red-700/50 hover:text-orange-400"
      >
        X / Twitter
      </a>

      <a
        href="https://instagram.com/anmasa73sports"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex justify-center rounded-xl bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 px-5 py-3 text-sm font-semibold text-white border border-red-900/40 transition-all duration-300 hover:-translate-y-1 hover:text-orange-400"
      >
        Instagram
      </a>
    </div>
  </div>
</section>
      <section className="mt-16">
  <div className="mb-8">
    <p className="uppercase tracking-[0.2em] text-red-300/70 text-xs font-semibold mb-3">
      Sigue explorando
    </p>

    <h2 className="text-2xl md:text-3xl font-bold">
      Otras galerías de Cast To Cast
    </h2>
  </div>

  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
    {galleryCollections
      .filter((item) => item.slug !== collection.slug)
      .slice(0, 3)
      .map((item) => (
        <GalleryCollectionCard
          key={item.slug}
          title={item.title}
          cover={item.cover}
          href={`/galeria/${item.slug}`}
          count={item.photos.length}
          competition={item.competition}
          location={item.location}
          date={item.date}
        />
      ))}
  </div>
</section>

      <section className="mt-16 rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-10 text-center">
        <p className="uppercase tracking-[0.2em] text-red-300/70 text-xs font-semibold mb-4">
          Más contenido visual
        </p>

        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Revive el baloncesto desde dentro
        </h2>

        <p className="text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          Explora más galerías de partidos, afición y protagonistas en Cast To
          Cast Baloncesto.
        </p>

        <Link
          href="/galeria"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 px-6 py-3 font-semibold text-white border border-red-900/40 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:text-orange-400 hover:shadow-2xl"
        >
          Ver todas las galerías
        </Link>
      </section>
    </main>
  );
}