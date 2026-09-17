import { validateChapters } from "./chapters.ts";
import { validateTranscript } from "./transcript-importer.ts";
import type { Episode, EpisodePlatform, EpisodePlatformLinks } from "../types/episode.ts";
import type {
  PromotionDiagnostic,
  PromotionSourceReference,
  PublicEpisodeCandidate,
  PublicEpisodeCandidateInputs,
  PublicEpisodeDiffItem,
} from "../types/public-episode-candidate.ts";

const publicFields = ["id", "kind", "season", "episodeNumber", "slug", "title", "date", "description", "thumbnail", "participants", "platforms", "transcript", "subtitles", "derivedPieces", "relatedContent"] as const;
const technicalFields = ["id", "kind", "season", "episodeNumber"] as const;
const platformNames: readonly EpisodePlatform[] = ["youtube", "ivoox", "applePodcasts", "spotify"];

function diagnostic(code: string, message: string, field?: string, severity: "error" | "warning" = "error"): PromotionDiagnostic {
  return { code, message, ...(field ? { field } : {}), severity };
}

function isPublicUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isValidSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function sameValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function source(kind: PromotionSourceReference["kind"], label: string, version?: string): PromotionSourceReference {
  return { kind, label, ...(version ? { version } : {}) };
}

function explicitOverlay(base: Episode, overrides: Partial<Omit<Episode, "id">>): Episode {
  // This is the one intentional field-level composition: a human-selected overlay.
  return { ...base, ...overrides, id: base.id };
}

/**
 * Builds a read-only promotion candidate. It never mutates inputs and never
 * quietly combines an imported manifest with public data: public data remains
 * the baseline when both sources are supplied, while mismatches are diagnosed.
 */
export function buildPublicEpisodeCandidate(inputs: PublicEpisodeCandidateInputs): PublicEpisodeCandidate {
  const base = inputs.current ?? inputs.manifestEpisode;
  if (!base) throw new Error("A current public episode or a complete manifest episode is required.");
  const candidate = inputs.manualOverrides ? explicitOverlay(base, inputs.manualOverrides) : { ...base };
  const fields: Record<string, PromotionSourceReference["kind"]> = {};
  for (const field of publicFields) fields[field] = inputs.manualOverrides && field in inputs.manualOverrides ? "manual-overrides" : inputs.current ? "public-data" : "manifest";
  const conflicts: PromotionDiagnostic[] = [];
  if (inputs.current && inputs.manifestEpisode) {
    for (const field of technicalFields) {
      if (!sameValue(inputs.current[field], inputs.manifestEpisode[field])) {
        conflicts.push(diagnostic("manifest_manual_conflict", `El manifest y la ficha pública difieren en ${field}; no se han combinado.`, field));
      }
    }
  }
  const validation = [...conflicts, ...validatePublicEpisodeCandidate(candidate, { transcript: inputs.transcript, chapters: inputs.chapters })];
  const status = validation.some((item) => item.severity === "error") ? "blocked" : "ready";
  return {
    episodeId: candidate.id,
    candidate,
    sourceSummary: {
      candidateSource: inputs.manualOverrides ? "manual-overrides" : inputs.current ? "public-data" : "manifest",
      fields,
      ...(inputs.manifestEpisode ? { manifest: source("manifest", inputs.manifestSource ?? "manifest importado") } : {}),
      ...(inputs.transcript ? { transcript: source("transcript", inputs.transcript.source ?? "transcripción editorial", inputs.transcript.version) } : {}),
      ...(inputs.chapters ? { chapters: source("chapters", "capítulos editoriales") } : {}),
      ...(inputs.manualOverrides ? { manualOverrides: source("manual-overrides", "ajustes editoriales explícitos") } : {}),
    },
    validation,
    status,
    version: inputs.version ?? 1,
    createdAt: inputs.createdAt ?? new Date().toISOString(),
  };
}

export function validatePublicEpisodeCandidate(
  episode: Episode,
  related: Pick<PublicEpisodeCandidateInputs, "transcript" | "chapters"> = {},
): PromotionDiagnostic[] {
  const diagnostics: PromotionDiagnostic[] = [];
  if (!/^[A-Za-z0-9_-]+$/.test(episode.id)) diagnostics.push(diagnostic("invalid_identity", "El ID técnico no es válido.", "id"));
  if (!episode.kind) diagnostics.push(diagnostic("missing_kind", "Falta el tipo de episodio.", "kind"));
  if (!isValidSlug(episode.slug)) diagnostics.push(diagnostic("invalid_slug", "El slug debe ser estable y usar minúsculas con guiones.", "slug"));
  if (!episode.title.trim()) diagnostics.push(diagnostic("missing_title", "Falta el título.", "title"));
  if (!episode.description.trim()) diagnostics.push(diagnostic("missing_description", "Falta la descripción.", "description"));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(episode.date) || Number.isNaN(Date.parse(`${episode.date}T00:00:00Z`))) diagnostics.push(diagnostic("invalid_date", "La fecha debe usar YYYY-MM-DD.", "date"));
  if (!isPublicUrl(episode.thumbnail)) diagnostics.push(diagnostic("invalid_thumbnail", "La miniatura debe ser una URL pública http(s).", "thumbnail"));
  for (const platform of platformNames) {
    const url = (episode.platforms as EpisodePlatformLinks)[platform];
    if (url && !isPublicUrl(url)) diagnostics.push(diagnostic("invalid_platform", `La URL de ${platform} debe ser pública http(s).`, `platforms.${platform}`));
  }
  if (related.transcript) {
    if (related.transcript.episodeId !== episode.id) diagnostics.push(diagnostic("transcript_episode_mismatch", "La transcripción pertenece a otro episodio.", "transcript"));
    for (const item of validateTranscript(related.transcript)) diagnostics.push(diagnostic("invalid_transcript", item.message, "transcript"));
  }
  if (related.chapters) {
    for (const item of validateChapters(related.chapters, { episodeId: episode.id, transcript: related.transcript })) diagnostics.push(diagnostic("invalid_chapter", item.message, "chapters"));
  }
  return diagnostics;
}

/** Field-level diff retains arrays as values so the editor can show them legibly. */
export function diffPublicEpisode(current: Episode | undefined, candidate: Episode): PublicEpisodeDiffItem[] {
  return publicFields.map((field) => {
    const currentValue = current?.[field];
    const candidateValue = candidate[field];
    const kind = currentValue === undefined && candidateValue !== undefined ? "added"
      : currentValue !== undefined && candidateValue === undefined ? "removed"
        : sameValue(currentValue, candidateValue) ? "unchanged" : "changed";
    return { field, kind, ...(currentValue !== undefined ? { current: currentValue } : {}), ...(candidateValue !== undefined ? { candidate: candidateValue } : {}) };
  });
}

/** Approval is an immutable in-memory transition; persistence is separate. */
export function approvePublicEpisodeCandidate(candidate: PublicEpisodeCandidate, approvedAt = new Date().toISOString()): PublicEpisodeCandidate {
  if (promotionStatus(candidate) === "blocked") throw new Error("No se puede aprobar un candidato bloqueado.");
  return { ...candidate, status: "approved", approvedAt };
}

export function promotionStatus(candidate: Pick<PublicEpisodeCandidate, "status" | "validation">): "draft" | "ready" | "blocked" | "approved" {
  if (candidate.status === "approved") return "approved";
  if (candidate.validation.some((item) => item.severity === "error")) return "blocked";
  return candidate.status === "draft" ? "draft" : "ready";
}
