import { imageConfigDefault } from "next/dist/shared/lib/image-config";
import ArticleCard from "../components/ArticleCard";
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

export default function NewsPage() {
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
    </main>
  );
}