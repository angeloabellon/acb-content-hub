import type { Metadata } from "next";

import ArticleCard from "@/components/ArticleCard";
import NewsSourceCard from "@/components/NewsSourceCard";
import RecommendedReadingsSection from "@/components/sections/RecommendedReadingsSection";
import SectionHeader from "@/components/ui/SectionHeader";

import { createMetadata } from "@/lib/seo";
import { getBasketballNews } from "@/lib/news";

export const metadata: Metadata = createMetadata({
  title: "Actualidad",
  description:
    "Actualidad seleccionada sobre baloncesto, UCAM Murcia, Unicaja Málaga, Hozono Global Jairis, ACB y competiciones FEB.",
  path: "/news",
  image: "/og/news-cover.jpg",
});

const officialSocialLinks = [
  {
    image: "/logoUCAM.png",
    category: "UCAM Murcia",
    url: "https://x.com/UCAMMurcia",
  },
  {
    image: "/logoJairis.png",
    category: "Hozono Global Jairis",
    url: "https://x.com/CBJairis",
  },
  {
    image: "/logoUnicaja.png",
    category: "Unicaja Málaga",
    url: "https://x.com/unicajaCB",
  },
];

export default async function NewsPage() {
  const basketballNews = await getBasketballNews();

  const ucamNews = basketballNews.filter(
    (news) => news.source === "UCAM Murcia CB"
  );

  const unicajaNews = basketballNews.filter(
    (news) => news.source === "Unicaja Málaga"
  );

  const jairisNews = basketballNews.filter(
    (news) => news.source === "Hozono Global Jairis"
  );

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      {/* CABECERA DE PÁGINA */}
      <section className="text-center mb-20">
        <p className="uppercase tracking-[0.18em] text-red-300/80 text-sm font-semibold mb-5">
          Cast To Cast Baloncesto
        </p>

        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
          Actualidad
        </h1>

        <p className="text-white/70 max-w-2xl mx-auto leading-relaxed">
          Actualidad seleccionada sobre baloncesto, UCAM Murcia, Unicaja Málaga,
          Hozono Global Jairis, ACB y competiciones FEB.
        </p>
      </section>

      {/* ARTÍCULOS RECOMENDADOS */}
      <section className="mb-24">
        <RecommendedReadingsSection showHeader={false} />
      </section>

      {/* RRSS OFICIALES */}
      <section className="mb-24">
        <SectionHeader
          eyebrow="Redes oficiales"
          title="Canales de los clubes"
          description="Accede rápidamente a los perfiles oficiales de los clubes que seguimos en Cast To Cast."
        />

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {officialSocialLinks.map((article) => (
            <ArticleCard
              key={article.category}
              image={article.image}
              category={article.category}
              url={article.url}
            />
          ))}
        </div>
      </section>

      {/* FUENTES DE NOTICIAS */}
      <section>
        <SectionHeader
          eyebrow="Noticias oficiales"
          title="Fuentes de actualidad por club"
          description="Últimas publicaciones procedentes de las webs oficiales de UCAM Murcia CB, Hozono Global Jairis y Unicaja Málaga."
        />

        <div className="grid gap-8">
          <NewsSourceCard
            title="UCAM Murcia CB"
            description="Últimas noticias publicadas por el club en su web oficial."
            logo="/logoUCAM.png"
            news={ucamNews}
          />

          <NewsSourceCard
            title="Unicaja Málaga"
            description="Últimas noticias publicadas por el club en su web oficial."
            logo="/logoUnicaja.png"
            news={unicajaNews}
          />

          <NewsSourceCard
            title="Hozono Global Jairis"
            description="Últimas noticias publicadas por el club en su web oficial."
            logo="/logoJairis.png"
            news={jairisNews}
          />
        </div>
      </section>
    </main>
  );
}