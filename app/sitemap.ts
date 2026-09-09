import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getLatestYouTubeVideos } from "@/lib/youtube";
import { getBasketballNews } from "@/lib/news";
import { getEpisodes } from "@/lib/episodes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const videos = await getLatestYouTubeVideos(20);
  const news = await getBasketballNews();
  const episodes = getEpisodes();

  const staticPages = [
    "",
    "/videos",
    "/podcasts",
    "/episodios",
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

  const episodePages = episodes.map((episode) => ({
    url: `${siteConfig.url}/episodios/${episode.slug}`,
    lastModified: new Date(episode.date),
  }));

  return [...staticPages, ...videoPages, ...newsPages, ...episodePages];
}
