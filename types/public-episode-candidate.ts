import type { Chapter } from "./chapter.ts";
import type { Episode } from "./episode.ts";
import type { Transcript } from "./transcript.ts";

export type PublicEpisodeCandidateStatus = "draft" | "ready" | "blocked" | "approved";

export type PromotionDiagnosticSeverity = "error" | "warning";

export type PromotionDiagnostic = {
  code: string;
  field?: string;
  message: string;
  severity: PromotionDiagnosticSeverity;
};

export type PromotionSourceReference = {
  kind: "public-data" | "manifest" | "transcript" | "chapters" | "manual-overrides";
  label: string;
  version?: string;
};

/** A traceable account of the inputs; it deliberately contains no local paths. */
export type PublicEpisodeCandidateSourceSummary = {
  candidateSource: "public-data" | "manifest" | "manual-overrides";
  fields: Readonly<Record<string, PromotionSourceReference["kind"]>>;
  manifest?: PromotionSourceReference;
  transcript?: PromotionSourceReference;
  chapters?: PromotionSourceReference;
  manualOverrides?: PromotionSourceReference;
};

export type PublicEpisodeCandidate = {
  episodeId: string;
  candidate: Episode;
  sourceSummary: PublicEpisodeCandidateSourceSummary;
  validation: readonly PromotionDiagnostic[];
  status: PublicEpisodeCandidateStatus;
  version: number;
  createdAt: string;
  approvedAt?: string;
};

export type PublicEpisodeCandidateInputs = {
  /** Current public source. It is never changed by the promotion helpers. */
  current?: Episode;
  /** A fully parsed manifest projection, selected explicitly by the caller. */
  manifestEpisode?: Episode;
  manifestSource?: string;
  transcript?: Transcript;
  chapters?: readonly Chapter[];
  /** Explicit editorial overlay. It must never be inferred from an import. */
  manualOverrides?: Partial<Omit<Episode, "id">>;
  version?: number;
  createdAt?: string;
};

export type PublicEpisodeDiffKind = "unchanged" | "added" | "removed" | "changed";

export type PublicEpisodeDiffItem = {
  field: string;
  kind: PublicEpisodeDiffKind;
  current?: unknown;
  candidate?: unknown;
};

export type ApprovedPublicEpisodeArtifact = {
  schemaVersion: 1;
  approval: {
    episodeId: string;
    version: number;
    createdAt: string;
    approvedAt: string;
  };
  candidate: Episode;
  sourceSummary: PublicEpisodeCandidateSourceSummary;
  diagnostics: readonly [];
};
