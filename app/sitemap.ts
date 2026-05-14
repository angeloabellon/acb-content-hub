import { MetadataRoute } from "next";
import { getLatestYouTubeVideos } from "@/lib/youtube";
import { getBasketballNews } from "@/lib/news";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://casttocast.es";

  const videos = await getLatestYouTubeVideos(20);
  const news = await getBasketballNews();

  const staticPages = [
    "",
    "/videos",
    "/podcasts",
    "/news",
    "/galeria",
    "/about",
    "/contacto",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));

  const videoPages = videos.map((video) => ({
    url: `${baseUrl}/videos/${video.slug}`,
    lastModified: new Date(),
  }));

  const newsPages = news.map((item) => ({
    url: `${baseUrl}/news/${item.slug}`,
    lastModified: new Date(),
  }));

  return [
    ...staticPages,
    ...videoPages,
    ...newsPages,
  ];
}