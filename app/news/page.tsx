import ArticleCard from "@/components/ArticleCard";
import NewsSourceCard from "@/components/NewsSourceCard";
import { getBasketballNews } from "@/lib/news";
import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import RecommendedReadingsSection from "@/components/sections/RecommendedReadingsSection";

export const metadata: Metadata = createMetadata({
  title: "Actualidad",
  description:
    "Actualidad seleccionada sobre baloncesto, UCAM Murcia, Unicaja, Jairis, ACB y competiciones FEB.",
  path: "/news",
});

const articles = [
  {
    image: "/logoUCAM.png",
    category: "UCAM Murcia",
    url: "https://x.com/UCAMMurcia",
  },
  {
    image: "/logoJairis.png",
    category: "CB Jairis",
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
      <section className="text-center mb-14">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
          Actualidad
        </h1>

        <p className="text-white/70 max-w-2xl mx-auto">
          Actualidad seleccionada sobre baloncesto, UCAM Murcia, Unicaja,
          Jairis, ACB y competiciones FEB.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8">
          RRSS oficiales
        </h2>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard
              key={article.category}
              image={article.image}
              category={article.category}
              url={article.url}
            />
          ))}
        </div>
      </section>

      <section className="mt-20">
        <h2 className="text-2xl font-bold mb-8">
          Fuentes de noticias
        </h2>

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
      {/* FIRMAS INVITADAS */}
<RecommendedReadingsSection className="mt-16" />
    </main>
  );
}