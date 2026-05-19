import { getPodcastEpisodes } from "@/lib/podcasts";
import PodcastSearch from "@/components/PodcastSearch";
import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";


export const metadata: Metadata = {
  title: "Podcasts | Cast To Cast Baloncesto",
  description:
    "Escucha los últimos episodios del podcast de Cast To Cast Baloncesto: tertulias, análisis y actualidad sobre baloncesto.",

  openGraph: {
    title: "Podcasts | Cast To Cast Baloncesto",
    description:
      "Tertulias, análisis y actualidad del baloncesto en formato podcast.",
    url: "https://casttocast.es/podcasts",
    siteName: "Cast To Cast Baloncesto",
    type: "website",
    images: [
      {
        url: "/og/podcast-cover.jpg",
        width: 1200,
        height: 630,
        alt: "Podcasts de Cast To Cast Baloncesto",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Podcasts | Cast To Cast Baloncesto",
    description:
      "Escucha los últimos episodios de Cast To Cast Baloncesto.",
    images: ["/og/podcast-cover.jpg"],
  },
};

export default async function PodcastsPage() {
  const episodes = await getPodcastEpisodes();

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <section className="text-center mb-14">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
          Podcasts
        </h1>

        <p className="text-white/70 max-w-2xl mx-auto text-lg">
          Escucha los episodios de Cast To Cast directamente desde nuestra web.
        </p>
      </section>

      <PodcastSearch episodes={episodes} />
    </main>
  );
}