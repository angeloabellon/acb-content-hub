import Parser from "rss-parser";

export type NewsItem = {
  title: string;
  url: string;
  source: string;
  content: string;
  pubDate: string;
};

const RSS_SOURCES = [
  {
    name: "SER Deportivos Región de Murcia",
    url: "https://fapi-top.prisasd.com/podcast/playser/ser_deportivos_region_de_murcia/itunestfp/podcast.xml",
  },
];

const BASKETBALL_KEYWORDS = [
  "ucam",
  "ucam murcia",
  "baloncesto",
  "basket",
  "liga endesa",
  "acb",
  "basketball champions league",
  "bcl",
  "jairis",
  "cb jairis",
  "cb cartagena",
  "unicaja",
  "feb",
];

function isBasketballNews(title: string, content?: string) {
  const text = `${title} ${content || ""}`.toLowerCase();

  return BASKETBALL_KEYWORDS.some((keyword) =>
    text.includes(keyword)
  );
}

export async function getBasketballNews(): Promise<NewsItem[]> {
  const parser = new Parser();

  try {
    const feeds = await Promise.allSettled(
      RSS_SOURCES.map(async (source) => {
        const feed = await parser.parseURL(source.url);

        return feed.items.map((item) => ({
          title: item.title || "Noticia sin título",
          url: item.link || "#",
          source: source.name,
          content: item.contentSnippet || item.content || "",
          pubDate: item.pubDate || "",
        }));
      })
    );

    return feeds
      .flatMap((result) =>
        result.status === "fulfilled" ? result.value : []
      )
      .filter((item) => isBasketballNews(item.title, item.content))
      .sort((a, b) => {
        const dateA = new Date(a.pubDate).getTime();
        const dateB = new Date(b.pubDate).getTime();

        return dateB - dateA;
      })
      .slice(0, 8);
  } catch (error) {
    console.error("Error cargando noticias RSS:", error);
    return [];
  }
}