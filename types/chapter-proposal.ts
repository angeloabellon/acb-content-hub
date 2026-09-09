/**
 * A non-published editorial suggestion. A proposal is intentionally separate
 * from Chapter so generation never changes what is visible on an episode.
 */
export type ChapterProposalStatus = "proposed" | "accepted" | "rejected" | "edited";

export type ChapterProposalSource = "deterministic-local" | "external-provider";

export type ChapterProposalCutReason = "gap" | "speaker_change" | "duration_threshold";

export type ChapterProposal = {
  /** Stable within a deterministic generation run. */
  id: string;
  episodeId: string;
  title: string;
  startSeconds: number;
  endSeconds?: number;
  /** Transcript evidence for the proposed block, in source order. */
  transcriptSegmentIds: readonly string[];
  status: ChapterProposalStatus;
  source: ChapterProposalSource;
  confidence?: number;
  notes?: string;
  /** Why this block starts where it does; absent for the first block. */
  cutReason?: ChapterProposalCutReason;
};
