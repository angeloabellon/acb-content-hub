import { notFound } from "next/navigation";
import GalleryClient from "@/components/GalleryClient";
import { galleryCollections } from "@/data/gallery";
import Link from "next/link";

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

        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
          {collection.title}
        </h1>

        <p className="text-lg text-gray-300">
          {collection.photos.length} fotografías
        </p>

      </section>

      <GalleryClient photos={collection.photos} />

    </main>
  );
}