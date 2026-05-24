import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getNewsBySlug } from "@/lib/news";

type NewsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: NewsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);

  if (!news) {
    return {
      title: "Noticia | Cast To Cast Baloncesto",
    };
  }

  return {
    title: `${news.title} | Cast To Cast Baloncesto`,
    description: `Noticia de ${news.source} enlazada desde Cast To Cast Baloncesto.`,
    openGraph: {
      title: news.title,
      description: `Noticia de ${news.source} enlazada desde Cast To Cast Baloncesto.`,
    },
    twitter: {
      card: "summary_large_image",
      title: news.title,
      description: `Noticia de ${news.source} enlazada desde Cast To Cast Baloncesto.`,
    },
  };
}

export default async function NewsDetailPage({
  params,
}: NewsPageProps) {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);

  if (!news) {
    notFound();
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <section className="mb-8">
        <Link
          href="/news"
          className="text-sm text-red-300 hover:text-orange-400 transition-colors"
        >
          ← Volver a noticias
        </Link>
      </section>

      <article className="bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 rounded-3xl p-8 md:p-12 border border-red-900/40 shadow-2xl">
        <p className="uppercase tracking-[0.18em] text-red-200/80 text-sm font-semibold mb-5">
          {news.source}
        </p>

        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-8">
          {news.title}
        </h1>

        <p className="text-red-100/90 text-lg leading-relaxed mb-8">
          Noticia publicada en la web oficial de {news.source}.
        </p>

        <a
          href={news.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex bg-white text-black px-6 py-4 rounded-xl font-semibold transition-all duration-300 hover:-translate-y-1 hover:bg-orange-400 hover:text-white"
        >
          Leer noticia original
        </a>
      </article>
    </main>
  );
}