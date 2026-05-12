import ArticleCard from "../components/ArticleCard";
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
          Actualidad del baloncesto
        </h2>

        <div className="bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 rounded-2xl p-8 border border-red-900/40 shadow-2xl">
          {basketballNews.length > 0 ? (
            <div className="flex flex-col gap-4">
              {basketballNews.map((news, index) => (
                <a
                  key={`${news.url}-${index}`}
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block bg-black/20 hover:bg-black/40 transition-colors rounded-xl p-4"
                >
                  <p className="text-white font-semibold group-hover:text-orange-400 transition-colors">
                    {news.title}
                  </p>

                  <p className="text-sm text-white/60 mt-2">
                    {news.source}
                  </p>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-white/70">
              No se han encontrado noticias recientes de baloncesto en las
              fuentes configuradas.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}