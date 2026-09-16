import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { galleryCollections } from "@/data/gallery";
import { getLatestYouTubeVideos } from "@/lib/youtube";
import { getEpisodes } from "@/lib/episodes";
import { getPodcastEpisodes } from "@/lib/podcasts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [videos, podcasts] = await Promise.all([
    getLatestYouTubeVideos(20),
    getPodcastEpisodes(),
  ]);
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
    "/directo",
  ].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
  }));

  const videoPages = videos.map((video) => ({
    url: `${siteConfig.url}/videos/${video.slug}`,
    lastModified: new Date(),
  }));

  const podcastPages = podcasts.map((episode) => ({
    url: `${siteConfig.url}/podcasts/${episode.slug}`,
    lastModified: episode.pubDate ? new Date(episode.pubDate) : new Date(),
  }));

  const galleryPages = galleryCollections.map((gallery) => ({
    url: `${siteConfig.url}/galeria/${gallery.slug}`,
    lastModified: gallery.date ? new Date(gallery.date) : new Date(),
  }));

  const episodePages = episodes.map((episode) => ({
    url: `${siteConfig.url}/episodios/${episode.slug}`,
    lastModified: new Date(episode.date),
  }));

  return [...staticPages, ...videoPages, ...podcastPages, ...galleryPages, ...episodePages];
}
