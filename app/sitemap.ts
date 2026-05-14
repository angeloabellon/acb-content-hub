import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getLatestYouTubeVideos } from "@/lib/youtube";
import { getBasketballNews } from "@/lib/news";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
  }));

  const videoPages = videos.map((video) => ({
    url: `${siteConfig.url}/videos/${video.slug}`,
    lastModified: new Date(),
  }));

  const newsPages = news.map((item) => ({
    url: `${siteConfig.url}/news/${item.slug}`,
    lastModified: new Date(),
  }));

  return [...staticPages, ...videoPages, ...newsPages];
}