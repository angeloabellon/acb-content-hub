// ARTÍCULO EXTERNO OBTENIDO DESDE UNA FUENTE PÚBLICA
export type ExternalArticle = {
  title: string;
  url: string;
};

export async function getLatestExternalArticle(
  authorUrl: string
): Promise<ExternalArticle | null> {
  try {
    const response = await fetch(authorUrl, {
      next: {
        revalidate: 60 * 60 * 6,
      },
    });

    if (!response.ok) {
      return null;
    }

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