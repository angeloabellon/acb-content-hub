// ARTÍCULO EXTERNO OBTENIDO DESDE UNA FUENTE PÚBLICA
import { fetchExternal } from "@/lib/external-fetch";

export type ExternalArticle = {
  title: string;
  url: string;
};

export async function getLatestExternalArticle(
  authorUrl: string
): Promise<ExternalArticle | null> {
  let origin: URL;
  try {
    origin = new URL(authorUrl);
  } catch {
    return null;
  }
  if (origin.protocol !== "https:") return null;

  const response = await fetchExternal(origin.toString(), { revalidate: 21600 });
  if (!response) return null;

  try {
    const html = await response.text();

    // INTENTA LOCALIZAR EL PRIMER ENLACE DE ARTÍCULO EN LA PÁGINA DEL AUTOR
    const articleMatch = html.match(
      /<h2[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/i
    );

    if (!articleMatch) {
      return null;
    }

    const [, href, rawTitle] = articleMatch;

    const title = rawTitle
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const url = href.startsWith("http")
      ? href
      : new URL(href, authorUrl).toString();

    return {
      title,
      url,
    };
  } catch {
    return null;
  }
}
