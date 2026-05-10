import { imageConfigDefault } from "next/dist/shared/lib/image-config";
import ArticleCard from "../components/ArticleCard";
import Parser from "rss-parser";
const articles = [
  {
    image: "/logoUCAM.png",
    category: "UCAM Murcia",
    url: "https://x.com/UCAMMurcia",
  },
  {
    image: "/logoJairis.png",
    category: "CB Jairis",
    url: "https://x.com/CBJairis"
  },
  {
    image: "/logoUnicaja.png",
    category: "Unicaja Málaga",
    url: "https://x.com/unicajaCB",
  },
];

async function getBasketballNews() {
  try {
    const parser = new Parser();

    const feed = await parser.parseURL(
      "https://www.mundodeportivo.com/feed/rss/baloncesto"
    );

    return feed.items.slice(0, 5).map((item) => ({
      title: item.title || "Noticia sin título",
      url: item.link || "#",
    }));
  } catch (error) {
    console.error("Error cargando noticias RSS:", error);

    return [
      {
        title: "No se han podido cargar las noticias en este momento.",
        url: "#",
      },
    ];
  }
}

export default async function NewsPage() {
  const basketballNews = await getBasketballNews();
  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <section className="text-center mb-14">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Noticias en la red
        </h1>
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

        <div className="flex flex-col gap-4">

          {basketballNews.map((news, index) => (
            <a
              key={index}
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-black/20 hover:bg-black/40 transition-colors rounded-xl p-4"
            >

              <p className="text-white font-semibold group-hover:text-orange-400 transition-colors">
                {news.title}
              </p>

            </a>
          ))}

        </div>

                </div>

      </section>
    </main>
  );
}