

export type BaseContentItem = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  publishedAt?: string;
  image?: string;
  url: string;
  type: ContentType;
};

export type VideoContentItem = BaseContentItem & {
  type: "video";
  videoId: string;
  duration?: string;
};

export type PodcastContentItem = BaseContentItem & {
  type: "podcast";
  audioUrl: string;
  duration?: string;
};

export type NewsContentItem = BaseContentItem & {
  type: "news";
  source?: string;
};

export type ContentItem =
  | VideoContentItem
  | PodcastContentItem
  | NewsContentItem;

  // TIPOS DE CONTENIDO
export type ContentType =
  | "video"
  | "podcast"
  | "news"
  | "gallery"
  | "coverage";

// BASE CONTENT
export interface BaseContent {
  title: string;
  description: string;
  href: string;
  image?: string;
  type: ContentType;
}

// COBERTURAS
export interface CoverageContent
  extends BaseContent {
  accent: string;
  teamLogo: string;
  leagueLogo: string;
  leagueLogoSize?: string;
}