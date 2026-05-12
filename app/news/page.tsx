import ArticleCard from "../components/ArticleCard";
import NewsSourceCard from "../components/NewsSourceCard";
import { getBasketballNews } from "@/lib/news";

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

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <section className="text-center mb-14">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Noticias en la red
        </h1>

        <p className="text-white/70 max-w-2xl mx-auto">
          Actualidad seleccionada sobre baloncesto, UCAM Murcia, Unicaja,
          Jairis, CB Cartagena, ACB, BCL y competiciones FEB.
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

        <NewsSourceCard
          title="UCAM Murcia CB"
          description="Últimas noticias publicadas por el club en su web oficial."
          news={basketballNews}
        />
      </section>
    </main>
  );
}