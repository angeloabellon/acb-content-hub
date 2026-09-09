/**
 * An editorial transcript is kept separate from Episode so it is never pulled
 * into episode lists, sitemap generation, or manifest imports by accident.
 */
export type TranscriptSegment = {
  /** Stable, source-owned identifier used for the page fragment anchor. */
  id: string;
  startSeconds?: number;
  endSeconds?: number;
  speaker?: string;
  text: string;
};

export type Transcript = {
  episodeId: string;
  language: string;
  source?: string;
  version?: string;
  /** Prevents technical fixtures from being published unless explicitly enabled. */
  visibility: "public" | "development-only";
  isDemo?: boolean;
  segments: readonly TranscriptSegment[];
};
