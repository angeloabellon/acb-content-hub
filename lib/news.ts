export type NewsItem = {
  title: string;
  url: string;
  source: string;
  content: string;
  pubDate: string;
};

const UCAM_NEWS_URL = "https://www.ucamdeportes.com/ucamcb/noticias";

function cleanText(text: string) {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractUcamNews(html: string): NewsItem[] {
  const linkRegex =
    /href="(\/ucamcb\/noticias\/[^"]+)"[^>]*>(.*?)<\/a>/g;

  const matches = Array.from(html.matchAll(linkRegex));

  const news = matches
    .map((match) => {
      const path = match[1];
      const rawTitle = match[2];

      return {
        title: cleanText(rawTitle),
        url: `https://www.ucamdeportes.com${path}`,
        source: "UCAM Murcia CB",
        content: "",
        pubDate: "",
      };
    })
    .filter((item) => item.title.length > 10)
    .filter(
      (item, index, self) =>
        index === self.findIndex((n) => n.url === item.url)
    )
    .slice(0, 8);

  return news;
}

export async function getBasketballNews(): Promise<NewsItem[]> {
  try {
    const response = await fetch(UCAM_NEWS_URL, {
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      throw new Error("No se pudo cargar la página de noticias de UCAM");
    }

    const html = await response.text();

    return extractUcamNews(html);
  } catch (error) {
    console.error("Error cargando noticias UCAM:", error);
    return [];
  }
}