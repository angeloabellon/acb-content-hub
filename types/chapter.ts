/**
 * Editorial navigation layer for an episode. Chapters intentionally live apart
 * from `Episode` and `Transcript`: their lifecycle is editorial and they can
 * exist before a transcript is available.
 */
export type ChapterSource = "editorial" | "automatic-proposal";

export type Chapter = {
  /** Stable, source-owned identifier used by the chapter fragment anchor. */
  id: string;
  episodeId: string;
  title: string;
  startSeconds: number;
  endSeconds?: number;
  description?: string;
  /** Optional evidence pointers into the transcript for future editorial tooling. */
  transcriptSegmentIds?: readonly string[];
  source?: ChapterSource;
  version?: string;
  reviewed?: boolean;
  /** Demo material must be explicitly enabled before it can render. */
  visibility: "public" | "development-only";
  isDemo?: boolean;
};
