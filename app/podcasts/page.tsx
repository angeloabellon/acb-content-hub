import { getPodcastEpisodes } from "@/lib/podcasts";
import PodcastSearch from "../components/PodcastSearch";
import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Podcasts",
  description:
    "Escucha los episodios de Cast To Cast directamente desde nuestra web.",
  path: "/podcasts",
});

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