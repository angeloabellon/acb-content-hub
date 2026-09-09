import { chapters } from "../data/chapters/index.ts";
import type { Chapter } from "../types/chapter.ts";
import type { Transcript, TranscriptSegment } from "../types/transcript.ts";

export type ChapterValidationCode =
  | "invalid_episode_id"
  | "duplicate_id"
  | "empty_title"
  | "invalid_start_seconds"
  | "invalid_end_seconds"
  | "unordered_start"
  | "overlapping_chapters"
  | "transcript_not_available"
  | "unknown_transcript_segment";

export type ChapterValidationDiagnostic = {
  code: ChapterValidationCode;
  chapterId?: string;
  message: string;
};

export type ChapterValidationOptions = {
  /** Ensures a supplied chapter collection belongs to the episode being edited. */
  episodeId?: string;
  /** Required only when chapters reference transcript segments. */
  transcript?: Transcript;
};

export function getChaptersByEpisodeId(episodeId: string): readonly Chapter[] {
  return chapters.filter((chapter) => chapter.episodeId === episodeId);
}

/** Stable, readable fragment IDs for linking to a chapter from elsewhere on the page. */
export function getChapterAnchor(chapter: Pick<Chapter, "id">): string {
  return `chapter-${chapter.id}`;
}

export function formatChapterTimestamp(seconds: number): string {
  const wholeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(wholeSeconds / 3600);
  const minutes = Math.floor((wholeSeconds % 3600) / 60);
  const remainingSeconds = wholeSeconds % 60;
  return hours > 0
    ? `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
    : `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * Creates a genuine YouTube time URL only for supported video URL shapes.
 * Existing query parameters (including `v`) and fragments are preserved.
 */
export function getYouTubeTimestampUrl(url: string | undefined, startSeconds: number): string | undefined {
  if (!url || !Number.isFinite(startSeconds) || startSeconds < 0) return undefined;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return undefined;
  const hostname = parsed.hostname.toLowerCase();
  const isYoutubeWatch = ["youtube.com", "www.youtube.com", "m.youtube.com"].includes(hostname)
    && parsed.pathname === "/watch"
    && Boolean(parsed.searchParams.get("v"));
  const isShortUrl = ["youtu.be", "www.youtu.be"].includes(hostname)
    && /^\/[^/]+\/?$/.test(parsed.pathname);
  if (!isYoutubeWatch && !isShortUrl) return undefined;

  parsed.searchParams.set("t", `${Math.floor(startSeconds)}s`);
  return parsed.toString();
}

export function validateChapters(
  chapterList: readonly Chapter[],
  options: ChapterValidationOptions = {},
): ChapterValidationDiagnostic[] {
  const diagnostics: ChapterValidationDiagnostic[] = [];
  const ids = new Set<string>();
  let previous: Chapter | undefined;
  const transcriptSegmentIds = options.transcript
    ? new Set(options.transcript.segments.map((segment) => segment.id))
    : undefined;

  for (const chapter of chapterList) {
    if (options.episodeId && chapter.episodeId !== options.episodeId) {
      diagnostics.push({ code: "invalid_episode_id", chapterId: chapter.id, message: `Chapter belongs to ${chapter.episodeId}, not ${options.episodeId}.` });
    }
    if (ids.has(chapter.id)) {
      diagnostics.push({ code: "duplicate_id", chapterId: chapter.id, message: "Chapter ids must be unique within an episode." });
    }
    ids.add(chapter.id);
    if (!chapter.title.trim()) {
      diagnostics.push({ code: "empty_title", chapterId: chapter.id, message: "A chapter title is required." });
    }
    if (!Number.isFinite(chapter.startSeconds) || chapter.startSeconds < 0) {
      diagnostics.push({ code: "invalid_start_seconds", chapterId: chapter.id, message: "startSeconds must be a non-negative finite number." });
    }
    if (chapter.endSeconds !== undefined && (!Number.isFinite(chapter.endSeconds) || chapter.endSeconds <= chapter.startSeconds)) {
      diagnostics.push({ code: "invalid_end_seconds", chapterId: chapter.id, message: "endSeconds must be later than startSeconds." });
    }
    if (previous && chapter.startSeconds <= previous.startSeconds) {
      diagnostics.push({ code: "unordered_start", chapterId: chapter.id, message: "Chapters must be strictly ordered by startSeconds." });
    }
    if (previous?.endSeconds !== undefined && previous.endSeconds > chapter.startSeconds) {
      diagnostics.push({ code: "overlapping_chapters", chapterId: chapter.id, message: "A chapter cannot start before the preceding chapter ends." });
    }
    if (chapter.transcriptSegmentIds?.length) {
      if (!options.transcript || options.transcript.episodeId !== chapter.episodeId) {
        diagnostics.push({ code: "transcript_not_available", chapterId: chapter.id, message: "Transcript segment references require a transcript from the same episode." });
      } else {
        for (const segmentId of chapter.transcriptSegmentIds) {
          if (!transcriptSegmentIds?.has(segmentId)) {
            diagnostics.push({ code: "unknown_transcript_segment", chapterId: chapter.id, message: `Transcript segment ${segmentId} does not belong to this episode.` });
          }
        }
      }
    }
    previous = chapter;
  }
  return diagnostics;
}

/** Resolves a chapter's optional transcript evidence in its declared order. */
export function getTranscriptSegmentsForChapter(
  chapter: Chapter,
  transcript: Transcript | undefined,
): readonly TranscriptSegment[] {
  if (!transcript || transcript.episodeId !== chapter.episodeId || !chapter.transcriptSegmentIds) return [];
  const segmentById = new Map(transcript.segments.map((segment) => [segment.id, segment]));
  return chapter.transcriptSegmentIds.flatMap((segmentId) => {
    const segment = segmentById.get(segmentId);
    return segment ? [segment] : [];
  });
}

/** Development-only chapters use the same deliberate opt-in as transcript fixtures. */
export function getRenderableChaptersByEpisodeId(episodeId: string): readonly Chapter[] {
  return getChaptersByEpisodeId(episodeId).filter(
    (chapter) => chapter.visibility === "public" || process.env.NEXT_PUBLIC_ENABLE_DEMO_TRANSCRIPTS === "true",
  );
}
