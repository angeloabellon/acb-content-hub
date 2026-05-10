import { imageConfigDefault } from "next/dist/shared/lib/image-config";
import ArticleCard from "../components/ArticleCard";
const articles = [
  {
    title: "UCAM Murcia",
      image: "/logoUCAM.png",
      category: "UCAM Murcia",
  },
  {
    title: "CB Jairis",
      image: "/logoJairis.png",
      category: "CB Jairis",
  },
  {
    title: "Unicaja Málaga",
    image: "/logoUnicaja.png",
    category: "Unicaja Málaga",
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

      <section className="grid md:grid-cols-3 gap-8">
        {articles.map((article) => (
          <ArticleCard
            key={article.title}
            title={article.title}
            image={article.image}
            category={article.category}
          />
        ))}
      </section>
    </main>
  );
}