import Parser from "rss-parser";

export type PodcastEpisode = {
  title: string;
  description: string;
  pubDate: string;
  audioUrl: string;
  link: string;
};

const PODCAST_RSS_URL =
  "https://feeds.ivoox.com/feed_fg_f11580626_filtro_1.xml";

export async function getPodcastEpisodes(): Promise<PodcastEpisode[]> {
  const parser = new Parser();

  try {
    const feed = await parser.parseURL(PODCAST_RSS_URL);

    return feed.items
      .map((item) => ({
        title: item.title || "Episodio sin título",
        description: item.contentSnippet || item.content || "",
        pubDate: item.pubDate || "",
        audioUrl: item.enclosure?.url || "",
        link: item.link || "",
      }))
      .filter((episode) => episode.audioUrl)
      .slice(0, 12);
  } catch (error) {
    console.error("Error cargando podcasts:", error);
    return [];
  }
}