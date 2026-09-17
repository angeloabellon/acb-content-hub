import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { promotionStatus } from "./episode-promotion.ts";
import type { ApprovedPublicEpisodeArtifact, PublicEpisodeCandidate } from "../types/public-episode-candidate.ts";

export const APPROVED_PROMOTIONS_DIRECTORY = path.join(process.cwd(), "data", "promotions", "approved");

export type PersistApprovedPromotionOptions = { baseDirectory?: string; environment?: NodeJS.ProcessEnv };
export type PersistApprovedPromotionResult =
  | { ok: true; filePath: string; version: number }
  | { ok: false; reason: "not_writable_environment" | "invalid_identifier" | "not_approved" | "write_failed" };

export function isEpisodePromotionStorageAvailable(environment: NodeJS.ProcessEnv = process.env): boolean {
  return environment.NODE_ENV !== "production" && environment.ENABLE_EDITOR === "true";
}

export function getSafePromotionFileStem(episodeId: string, slug: string): string | undefined {
  if (!/^[A-Za-z0-9_-]+$/.test(episodeId) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return undefined;
  return `${slug}--${episodeId}`;
}

async function nextAvailableTarget(directory: string, stem: string): Promise<{ target: string; version: number } | undefined> {
  const resolvedDirectory = path.resolve(directory);
  for (let version = 1; version < 1000; version += 1) {
    const target = path.resolve(resolvedDirectory, `${stem}_v${String(version).padStart(2, "0")}.json`);
    if (!target.startsWith(`${resolvedDirectory}${path.sep}`)) return undefined;
    try { await access(target); } catch { return { target, version }; }
  }
  return undefined;
}

export async function persistApprovedPublicEpisodeCandidate(
  candidate: PublicEpisodeCandidate,
  options: PersistApprovedPromotionOptions = {},
): Promise<PersistApprovedPromotionResult> {
  const environment = options.environment ?? process.env;
  if (!isEpisodePromotionStorageAvailable(environment)) return { ok: false, reason: "not_writable_environment" };
  if (promotionStatus(candidate) !== "approved" || !candidate.approvedAt) return { ok: false, reason: "not_approved" };
  const stem = getSafePromotionFileStem(candidate.episodeId, candidate.candidate.slug);
  if (!stem) return { ok: false, reason: "invalid_identifier" };
  const directory = options.baseDirectory ?? APPROVED_PROMOTIONS_DIRECTORY;
  const next = await nextAvailableTarget(directory, stem);
  if (!next) return { ok: false, reason: "write_failed" };
  const artifact: ApprovedPublicEpisodeArtifact = {
    schemaVersion: 1,
    approval: { episodeId: candidate.episodeId, version: next.version, createdAt: candidate.createdAt, approvedAt: candidate.approvedAt },
    candidate: candidate.candidate,
    sourceSummary: candidate.sourceSummary,
    diagnostics: [],
  };
  try {
    await mkdir(directory, { recursive: true });
    await writeFile(next.target, `${JSON.stringify(artifact, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
    return { ok: true, filePath: next.target, version: next.version };
  } catch {
    return { ok: false, reason: "write_failed" };
  }
}
