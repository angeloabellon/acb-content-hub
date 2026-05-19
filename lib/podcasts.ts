import Parser from "rss-parser";

export type PodcastEpisode = {
  title: string;
  slug: string;
  description: string;
  pubDate: string;
  audioUrl: string;
  link: string;
};

const PODCAST_RSS_URL =
  "https://feeds.ivoox.com/feed_fg_f11580626_filtro_1.xml";

function createPodcastSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function getPodcastEpisodes(): Promise<PodcastEpisode[]> {
  const parser = new Parser();

  try {
    const feed = await parser.parseURL(PODCAST_RSS_URL);

    return feed.items
      .map((item) => {
        const title = item.title || "Episodio sin título";

        return {
          title,
          slug: createPodcastSlug(title),
          description: item.contentSnippet || item.content || "",
          pubDate: item.pubDate || "",
          audioUrl: item.enclosure?.url || "",
          link: item.link || "",
        };
      })
      .filter((episode) => episode.audioUrl)
      .slice(0, 12);
  } catch (error) {
    console.error("Error cargando podcasts:", error);
    return [];
  }
}

export async function getLatestPodcastEpisode() {
  const episodes = await getPodcastEpisodes();

  return episodes[0] || null;
}

export async function getPodcastEpisodeBySlug(slug: string) {
  const episodes = await getPodcastEpisodes();

  return episodes.find((episode) => episode.slug === slug) || null;
}

export async function getPodcastStaticParams() {
  const episodes = await getPodcastEpisodes();

  return episodes.map((episode) => ({
    slug: episode.slug,
  }));
}