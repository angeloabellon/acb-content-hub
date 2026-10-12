import type { Metadata } from "next";

import NewsSourceCard from "@/components/NewsSourceCard";
import RecommendedReadingsSection from "@/components/sections/RecommendedReadingsSection";
import SectionHeader from "@/components/ui/SectionHeader";

import { createMetadata } from "@/lib/seo";
import { getBasketballNews } from "@/lib/news";

export const metadata: Metadata = createMetadata({
  title: "Actualidad",
  description:
    "Actualidad seleccionada sobre baloncesto, UCAM Murcia, Unicaja Málaga, Hozono Global Jairis, Albacete Basket, ACB y competiciones FEB.",
  path: "/news",
  image: "/og/news-cover.jpg",
});

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

  const albaceteNews = basketballNews.filter(
    (news) => news.source === "Albacete Basket"
  );

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      {/* CABECERA DE PÁGINA */}
{/* HERO EDITORIAL */}
<section className="relative overflow-hidden rounded-3xl border border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] px-5 py-12 sm:px-8 sm:py-16 md:px-14 md:py-24 mb-20 shadow-[0_10px_40px_rgba(122,12,12,0.22)]">
  <div className="absolute inset-0 bg-gradient-to-r from-[#7a0c0c]/35 via-transparent to-[#e01310]/15 pointer-events-none" />

  <div className="relative z-10 text-center">
    <p className="uppercase tracking-[0.2em] text-red-300/70 text-xs font-semibold mb-5">
      Actualidad Cast To Cast
    </p>

    <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight mb-6">
      Noticias, lecturas y contexto
      <span className="block text-red-500">
        para seguir el baloncesto
      </span>
    </h1>

    <p className="text-lg text-white/70 max-w-3xl mx-auto leading-relaxed">
      Una selección de actualidad, fuentes oficiales y lecturas recomendadas
      sobre UCAM Murcia CB, Hozono Global Jairis, Unicaja Málaga, Albacete
      Basket, ACB y competiciones FEB.
    </p>
  </div>
</section>

      {/* ARTÍCULOS RECOMENDADOS */}
      <section className="mb-24">
        <RecommendedReadingsSection showHeader={false} />
      </section>



      {/* FUENTES DE NOTICIAS */}
      <section>
        <SectionHeader
          eyebrow="Noticias oficiales"
          title="Fuentes de actualidad por club"
          description="Últimas publicaciones procedentes de las webs oficiales de UCAM Murcia CB, Hozono Global Jairis, Unicaja Málaga y Albacete Basket."
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

          <NewsSourceCard
            title="Albacete Basket"
            description="Últimas noticias publicadas por el club en su web oficial."
            logo="/logoAlbaceteBasket.png"
            news={albaceteNews}
          />
        </div>
      </section>
    </main>
  );
}
