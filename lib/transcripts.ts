import { transcripts } from "../data/transcripts/index.ts";
import type { Transcript, TranscriptSegment } from "../types/transcript.ts";

export function getTranscriptByEpisodeId(episodeId: string): Transcript | undefined {
  return transcripts.find((transcript) => transcript.episodeId === episodeId);
}

export function getTranscriptSegments(episodeId: string): readonly TranscriptSegment[] {
  return getTranscriptByEpisodeId(episodeId)?.segments ?? [];
}

/** Stable, readable fragment IDs even when a source does not include timing. */
export function getTranscriptSegmentAnchor(segment: Pick<TranscriptSegment, "id">): string {
  return `transcript-${segment.id}`;
}

export function formatTranscriptTimestamp(seconds: number): string {
  const wholeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(wholeSeconds / 60);
  const remainingSeconds = wholeSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * Development-only content is opt-in so a fixture cannot be published by
 * deployment configuration alone. Published transcripts require no flag.
 */
export function getRenderableTranscriptByEpisodeId(episodeId: string): Transcript | undefined {
  const transcript = getTranscriptByEpisodeId(episodeId);
  if (!transcript) return undefined;
  if (transcript.visibility === "public") return transcript;
  return process.env.NEXT_PUBLIC_ENABLE_DEMO_TRANSCRIPTS === "true" ? transcript : undefined;
}
