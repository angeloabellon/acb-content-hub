export type NewsItem = {
  title: string;
  slug: string;
  url: string;
  externalUrl: string;
  source: string;
  content: string;
  pubDate: string;
  imageUrl?: string;
};

const ALBACETE_NEWS_URL = "https://albacetebasket.es/noticias/";

function cleanText(text: string) {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, value: string) => {
      const codePoint = value.toLowerCase().startsWith("x")
        ? Number.parseInt(value.slice(1), 16)
        : Number.parseInt(value, 10);

      return Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : "";
    })
    .replace(/\s+/g, " ")
    .trim();
}

function createNewsSlug(title: string, externalUrl: string) {
  const cleanTitle = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const url = new URL(externalUrl);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const lastPathPart = pathParts[pathParts.length - 1] || "";

  const cleanId = lastPathPart
    .replace(".html", "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!cleanId || cleanTitle.includes(cleanId) || cleanId.includes(cleanTitle)) {
    return cleanTitle;
  }

  return `${cleanTitle}-${cleanId}`;
}

function toAlbaceteUrl(value: string) {
  try {
    const url = new URL(value, ALBACETE_NEWS_URL);

    return url.hostname === "albacetebasket.es" ||
      url.hostname === "www.albacetebasket.es"
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Parses the UAGB/WordPress post grid used by Albacete Basket's news archive.
 * Each card carries the canonical article URL, ISO publication timestamp, and
 * featured image in the initial HTML response.
 */
export function extractAlbaceteNews(html: string): NewsItem[] {
  const articles = Array.from(
    html.matchAll(
      /<article\b[^>]*class=["'][^"']*\buagb-post__inner-wrap\b[^"']*["'][^>]*>([\s\S]*?)<\/article>/gi,
    ),
  );

  return articles
    .map((article) => {
      const markup = article[1];
      const titleMatch = markup.match(
        /<h4\b[^>]*\buagb-post__title\b[^>]*>\s*<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i,
      );
      const imageMatch = markup.match(
        /<div\b[^>]*\buagb-post__image\b[^>]*>[\s\S]*?<img\b[^>]*\bsrc=["']([^"']+)["']/i,
      );
      const dateMatch = markup.match(
        /<time\b(?=[^>]*\buagb-post__date\b)[^>]*\bdatetime=["']([^"']+)["'][^>]*>/i,
      );

      const externalUrl = titleMatch ? toAlbaceteUrl(titleMatch[1]) : undefined;
      const title = titleMatch ? cleanText(titleMatch[2]) : "";
      const imageUrl = imageMatch ? toAlbaceteUrl(imageMatch[1]) : undefined;

      if (!externalUrl || title.length <= 10) {
        return undefined;
      }

      const news: NewsItem = {
        title,
        slug: createNewsSlug(title, externalUrl),
        url: `/news/${createNewsSlug(title, externalUrl)}`,
        externalUrl,
        source: "Albacete Basket",
        content: "",
        pubDate: dateMatch?.[1] ?? "",
        ...(imageUrl ? { imageUrl } : {}),
      };

      return news;
    })
    .filter((item): item is NewsItem => item !== undefined)
    .filter(
      (item, index, self) =>
        index === self.findIndex((news) => news.externalUrl === item.externalUrl),
    )
    .slice(0, 6);
}
