export type NewsItem = {
  title: string;
  slug: string;
  url: string;
  externalUrl: string;
  source: string;
  content: string;
  pubDate: string;
};

const UCAM_NEWS_URL = "https://www.ucamdeportes.com/ucamcb/noticias";
const UNICAJA_NEWS_URL = "https://www.unicajabaloncesto.com/noticia";
const JAIRIS_NEWS_URL = "https://www.hozonojairis.com/noticias/";

function cleanText(text: string) {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function createNewsSlug(title: string, externalUrl: string) {
  const cleanTitle = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const id = externalUrl.split("/").filter(Boolean).pop() || "noticia";

  return `${cleanTitle}-${id}`;
}

function extractUcamNews(html: string): NewsItem[] {
  const linkRegex =
    /href="(\/ucamcb\/noticias\/[^"]+)"[^>]*>(.*?)<\/a>/g;

  const matches = Array.from(html.matchAll(linkRegex));

  const news = matches
    .map((match) => {
      const path = match[1];
      const rawTitle = match[2];
      const title = cleanText(rawTitle);
      const externalUrl = `https://www.ucamdeportes.com${path}`;
      const slug = createNewsSlug(title, externalUrl);

      return {
        title,
        slug,
        url: `/news/${slug}`,
        externalUrl,
        source: "UCAM Murcia CB",
        content: "",
        pubDate: "",
      };
    })
    .filter((item) => item.title.length > 10)
    .filter(
      (item, index, self) =>
        index === self.findIndex((n) => n.externalUrl === item.externalUrl)
    )
    .slice(0, 8);

  return news;
}
function extractUnicajaNews(html: string): NewsItem[] {
  const linkRegex =
    /href="(\/noticia\/[^"]+)"[^>]*>(.*?)<\/a>/g;

  const matches = Array.from(html.matchAll(linkRegex));

  return matches
    .map((match) => {
      const path = match[1];
      const rawTitle = match[2];

      const title = cleanText(rawTitle);
      const externalUrl = `https://www.unicajabaloncesto.com${path}`;

      return {
        title,
        slug: createNewsSlug(title, externalUrl),
        url: `/news/${createNewsSlug(title, externalUrl)}`,
        externalUrl,
        source: "Unicaja Málaga",
        content: "",
        pubDate: "",
      };
    })
    .filter((item) => item.title.length > 10)
    .filter(
      (item, index, self) =>
        index === self.findIndex((n) => n.externalUrl === item.externalUrl)
    )
    .slice(0, 6);
}
function extractJairisNews(html: string): NewsItem[] {
  const titleRegex =
    /<h4[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>\s*<\/h4>/g;

  const matches = Array.from(html.matchAll(titleRegex));

  console.log("Noticias Jairis encontradas:", matches.length);

  return matches
    .map((match) => {
      const path = match[1];
      const rawTitle = match[2];

      const title = cleanText(rawTitle);

      const externalUrl = path.startsWith("http")
        ? path
        : `https://www.hozonojairis.com${path}`;

      const slug = createNewsSlug(title, externalUrl);

      return {
        title,
        slug,
        url: `/news/${slug}`,
        externalUrl,
        source: "Hozono Global Jairis",
        content: "",
        pubDate: "",
      };
    })
    .filter(
  (item, index, self) =>
    index === self.findIndex((n) => n.title === item.title)
)
    .slice(0, 6);
}
export async function getBasketballNews(): Promise<NewsItem[]> {
  try {
    const [ucamResponse, unicajaResponse, jairisResponse] =
      await Promise.all([
        fetch(UCAM_NEWS_URL, {
          next: { revalidate: 3600 },
        }),

        fetch(UNICAJA_NEWS_URL, {
          next: { revalidate: 3600 },
        }),

        fetch(JAIRIS_NEWS_URL, {
          next: { revalidate: 3600 },
        }),
      ]);

    const [ucamHtml, unicajaHtml, jairisHtml] =
      await Promise.all([
        ucamResponse.text(),
        unicajaResponse.text(),
        jairisResponse.text(),
      ]);

    const ucamNews = extractUcamNews(ucamHtml);
    const unicajaNews = extractUnicajaNews(unicajaHtml);
    const jairisNews = extractJairisNews(jairisHtml);

return [
  ...ucamNews,
  ...unicajaNews,
  ...jairisNews,
];
  } catch (error) {
    console.error("Error cargando noticias:", error);

    return [];
  }
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  const news = await getBasketballNews();

  return news.find((item) => item.slug === slug) || null;
}