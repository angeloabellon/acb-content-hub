import { validateChapters, type ChapterValidationDiagnostic } from "./chapters.ts";
import type { Chapter } from "../types/chapter.ts";
import type {
  ChapterProposal,
  ChapterProposalCutReason,
} from "../types/chapter-proposal.ts";
import type { Transcript, TranscriptSegment } from "../types/transcript.ts";

/** Tunable technical defaults, not an editorial policy. All durations are seconds. */
export const DEFAULT_CHAPTER_PROPOSAL_OPTIONS = {
  minimumDurationSeconds: 120,
  targetDurationSeconds: 480,
  maximumDurationSeconds: 720,
  minimumGapSeconds: 45,
  maximumChapterCount: 12,
} as const;

export type ChapterProposalOptions = Partial<typeof DEFAULT_CHAPTER_PROPOSAL_OPTIONS>;

export type ChapterProposalDiagnosticCode =
  | "unsupported/no_timestamps"
  | "invalid_episode_id"
  | "duplicate_id"
  | "empty_title"
  | "invalid_start_seconds"
  | "invalid_end_seconds"
  | "unordered_start"
  | "overlapping_proposals"
  | "missing_transcript_evidence"
  | "unknown_transcript_segment"
  | "proposal_not_accepted";

export type ChapterProposalDiagnostic = {
  code: ChapterProposalDiagnosticCode;
  proposalId?: string;
  message: string;
};

export type ChapterProposalGenerationResult = {
  proposals: readonly ChapterProposal[];
  diagnostics: readonly ChapterProposalDiagnostic[];
};

/** Provider boundary for the future local or remote generator. */
export type ChapterProposalProvider = {
  generate(transcript: Transcript, options?: ChapterProposalOptions): ChapterProposalGenerationResult;
};

export type ChapterProposalTransitionResult = {
  proposal: ChapterProposal;
  diagnostics: readonly ChapterProposalDiagnostic[];
};

export type ChapterProposalConversionResult = {
  chapters: readonly Chapter[];
  diagnostics: readonly ChapterProposalDiagnostic[];
  chapterDiagnostics: readonly ChapterValidationDiagnostic[];
};

type TimedSegment = TranscriptSegment & { startSeconds: number };

function hasUsableTimestamps(segments: readonly TranscriptSegment[]): segments is readonly TimedSegment[] {
  return segments.length > 0 && segments.every((segment) =>
    Number.isFinite(segment.startSeconds) && (segment.startSeconds ?? -1) >= 0,
  );
}

function resolveOptions(options: ChapterProposalOptions): typeof DEFAULT_CHAPTER_PROPOSAL_OPTIONS {
  return { ...DEFAULT_CHAPTER_PROPOSAL_OPTIONS, ...options };
}

function proposalId(episodeId: string, position: number): string {
  return `${episodeId}-proposal-${position}`;
}

function createProposal(
  episodeId: string,
  position: number,
  segments: readonly TimedSegment[],
  cutReason?: ChapterProposalCutReason,
): ChapterProposal {
  const finalSegment = segments.at(-1);
  return {
    id: proposalId(episodeId, position),
    episodeId,
    // Neutral by design: this local heuristic never writes attributed text.
    title: `Bloque ${position}`,
    startSeconds: segments[0].startSeconds,
    endSeconds: finalSegment?.endSeconds,
    transcriptSegmentIds: segments.map((segment) => segment.id),
    status: "proposed",
    source: "deterministic-local",
    cutReason,
  };
}

/**
 * Technical baseline for exercising the proposal contract. It cuts before a
 * segment after a large gap, after a target-length speaker change, or at the
 * maximum duration. It never derives titles from spoken content.
 */
export function generateChapterProposals(
  transcript: Transcript,
  options: ChapterProposalOptions = {},
): ChapterProposalGenerationResult {
  if (!hasUsableTimestamps(transcript.segments)) {
    return {
      proposals: [],
      diagnostics: [{
        code: "unsupported/no_timestamps",
        message: "Chapter proposals require a non-empty transcript with a timestamp on every segment.",
      }],
    };
  }

  const settings = resolveOptions(options);
  const proposals: ChapterProposal[] = [];
  let group: TimedSegment[] = [transcript.segments[0]];
  let nextCutReason: ChapterProposalCutReason | undefined;

  for (let index = 1; index < transcript.segments.length; index += 1) {
    const current = transcript.segments[index];
    const previous = transcript.segments[index - 1];
    const elapsed = current.startSeconds - group[0].startSeconds;
    const previousEnd = previous.endSeconds ?? previous.startSeconds;
    const gap = current.startSeconds - previousEnd;
    const speakerChanged = Boolean(current.speaker && previous.speaker && current.speaker !== previous.speaker);
    const canCut = elapsed >= settings.minimumDurationSeconds && proposals.length + 1 < settings.maximumChapterCount;
    const reason = canCut && gap >= settings.minimumGapSeconds
      ? "gap"
      : canCut && elapsed >= settings.maximumDurationSeconds
        ? "duration_threshold"
        : canCut && speakerChanged && elapsed >= settings.targetDurationSeconds
          ? "speaker_change"
          : undefined;

    if (reason) {
      const proposal = createProposal(transcript.episodeId, proposals.length + 1, group, nextCutReason);
      proposals.push({ ...proposal, endSeconds: current.startSeconds });
      group = [current];
      nextCutReason = reason;
    } else {
      group.push(current);
    }
  }
  proposals.push(createProposal(transcript.episodeId, proposals.length + 1, group, nextCutReason));

  return { proposals, diagnostics: validateChapterProposals(proposals, transcript) };
}

/** Adapter boundary: a future LLM/provider returns this same result shape. */
export const deterministicChapterProposalProvider: ChapterProposalProvider = {
  generate: generateChapterProposals,
};

export function validateChapterProposals(
  proposals: readonly ChapterProposal[],
  transcript: Transcript,
): ChapterProposalDiagnostic[] {
  const diagnostics: ChapterProposalDiagnostic[] = [];
  const ids = new Set<string>();
  const transcriptIds = new Set(transcript.segments.map((segment) => segment.id));
  let previous: ChapterProposal | undefined;

  for (const proposal of proposals) {
    if (proposal.episodeId !== transcript.episodeId) diagnostics.push({ code: "invalid_episode_id", proposalId: proposal.id, message: "Proposal belongs to another episode." });
    if (ids.has(proposal.id)) diagnostics.push({ code: "duplicate_id", proposalId: proposal.id, message: "Proposal ids must be unique." });
    ids.add(proposal.id);
    if (!proposal.title.trim()) diagnostics.push({ code: "empty_title", proposalId: proposal.id, message: "A proposal title is required." });
    if (!Number.isFinite(proposal.startSeconds) || proposal.startSeconds < 0) diagnostics.push({ code: "invalid_start_seconds", proposalId: proposal.id, message: "startSeconds must be a non-negative finite number." });
    if (proposal.endSeconds !== undefined && (!Number.isFinite(proposal.endSeconds) || proposal.endSeconds <= proposal.startSeconds)) diagnostics.push({ code: "invalid_end_seconds", proposalId: proposal.id, message: "endSeconds must be later than startSeconds." });
    if (previous && proposal.startSeconds <= previous.startSeconds) diagnostics.push({ code: "unordered_start", proposalId: proposal.id, message: "Proposals must be strictly ordered by startSeconds." });
    if (previous?.endSeconds !== undefined && previous.endSeconds > proposal.startSeconds) diagnostics.push({ code: "overlapping_proposals", proposalId: proposal.id, message: "A proposal cannot overlap its predecessor." });
    if (!proposal.transcriptSegmentIds.length) diagnostics.push({ code: "missing_transcript_evidence", proposalId: proposal.id, message: "Proposal requires transcript evidence." });
    for (const segmentId of proposal.transcriptSegmentIds) {
      if (!transcriptIds.has(segmentId)) diagnostics.push({ code: "unknown_transcript_segment", proposalId: proposal.id, message: `Unknown transcript segment: ${segmentId}.` });
    }
    previous = proposal;
  }
  return diagnostics;
}

export function acceptChapterProposal(proposal: ChapterProposal, transcript: Transcript): ChapterProposalTransitionResult {
  const accepted = { ...proposal, status: "accepted" as const };
  return { proposal: accepted, diagnostics: validateChapterProposals([accepted], transcript) };
}

export function rejectChapterProposal(proposal: ChapterProposal): ChapterProposal {
  return { ...proposal, status: "rejected" };
}

export function editChapterProposal(
  proposal: ChapterProposal,
  changes: Partial<Pick<ChapterProposal, "title" | "startSeconds" | "endSeconds" | "transcriptSegmentIds" | "notes">>,
  transcript: Transcript,
): ChapterProposalTransitionResult {
  const edited = { ...proposal, ...changes, status: "edited" as const };
  return { proposal: edited, diagnostics: validateChapterProposals([edited], transcript) };
}

/** Converts only reviewed/accepted proposals and delegates final rules to Chapter validation. */
export function convertAcceptedProposalsToChapters(
  proposals: readonly ChapterProposal[],
  transcript: Transcript,
): ChapterProposalConversionResult {
  const diagnostics: ChapterProposalDiagnostic[] = [];
  for (const proposal of proposals) {
    if (proposal.status !== "accepted") diagnostics.push({ code: "proposal_not_accepted", proposalId: proposal.id, message: "Only accepted proposals can become chapters." });
  }
  if (diagnostics.length) return { chapters: [], diagnostics, chapterDiagnostics: [] };

  const proposalDiagnostics = validateChapterProposals(proposals, transcript);
  if (proposalDiagnostics.length) return { chapters: [], diagnostics: proposalDiagnostics, chapterDiagnostics: [] };
  const chapters: Chapter[] = proposals.map((proposal) => ({
    id: proposal.id,
    episodeId: proposal.episodeId,
    title: proposal.title,
    startSeconds: proposal.startSeconds,
    ...(proposal.endSeconds === undefined ? {} : { endSeconds: proposal.endSeconds }),
    transcriptSegmentIds: proposal.transcriptSegmentIds,
    source: "automatic-proposal",
    reviewed: true,
    // A conversion is still in memory; callers must deliberately persist/publish it.
    visibility: "development-only",
  }));
  const chapterDiagnostics = validateChapters(chapters, { episodeId: transcript.episodeId, transcript });
  return { chapters: chapterDiagnostics.length ? [] : chapters, diagnostics: [], chapterDiagnostics };
}
