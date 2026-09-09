export type EpisodeKind = "episode" | "special" | "interview";

export type EpisodePlatform = "youtube" | "ivoox" | "applePodcasts" | "spotify";

export type EpisodePlatformLinks = Partial<Record<EpisodePlatform, string>>;

export type EpisodeParticipant = {
  name: string;
  role?: string;
};

export type EpisodeDerivedPiece = {
  title: string;
  url: string;
  type: "clip" | "short" | "article" | "gallery";
};

export type EpisodeRelatedContent = {
  title: string;
  url: string;
  type: "episode" | "video" | "article" | "gallery";
};

/** Lightweight pointer only; transcript text lives in data/transcripts. */
export type EpisodeTranscriptReference = {
  language: string;
  source: "local-fixture" | "automation";
  visibility: "public" | "development-only";
};

/**
 * The public, editorial representation of a Cast To Cast programme.
 *
 * `id` is deliberately independent from a platform URL: it is the stable
 * identifier shared with production files and the future Automation manifest.
 */
export type Episode = {
  id: string;
  kind: EpisodeKind;
  season?: number;
  episodeNumber?: number;
  slug: string;
  title: string;
  date: string;
  description: string;
  thumbnail: string;
  participants: EpisodeParticipant[];
  platforms: EpisodePlatformLinks;
  transcript?: EpisodeTranscriptReference;
  subtitles?: string;
  derivedPieces?: EpisodeDerivedPiece[];
  relatedContent?: EpisodeRelatedContent[];
};
