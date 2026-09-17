import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { __test__, applyPromotionPatch, buildEpisodesPatch, createPromotionPreview, isPromotionWriteAvailable, loadApprovedPromotionArtifact, persistPromotionPreview, promotionPatchStatus } from "../lib/promote-to-public.ts";
import type { ApprovedPublicEpisodeArtifact } from "../types/public-episode-candidate.ts";
import type { Episode } from "../types/episode.ts";

const oldEpisode: Episode = { id: "CTC_T5E01", kind: "episode", season: 5, episodeNumber: 1, slug: "antiguo", title: "Antiguo", date: "2026-01-01", description: "Texto anterior", thumbnail: "https://example.test/old.jpg", participants: [], platforms: {}, transcript: { language: "es", source: "automation", visibility: "public" }, subtitles: "/manual.vtt" };
const otherEpisode: Episode = { ...oldEpisode, id: "CTC_T5E02", slug: "otro", title: "Otro" };
const candidate: Episode = { ...oldEpisode, slug: "nuevo", title: "Nuevo", description: "Texto revisado", participants: [{ name: "Ana" }], platforms: { youtube: "https://youtube.test/new" }, transcript: undefined, subtitles: undefined };
function artifact(version = 1, episode = candidate): ApprovedPublicEpisodeArtifact { return { schemaVersion: 1, approval: { episodeId: episode.id, version, createdAt: "2026-01-01T00:00:00.000Z", approvedAt: "2026-01-01T01:00:00.000Z" }, candidate: episode, sourceSummary: { candidateSource: "manual-overrides", fields: {} }, diagnostics: [] }; }
function source(episodes: readonly Episode[]): string { return __test__.serializeEpisodes(episodes); }
async function fixture(version = 1): Promise<{ root: string; episodesFile: string; approvedDirectory: string; artifactFile: string }> {
  const root = await mkdtemp(path.join(os.tmpdir(), "promote-public-")); const episodesFile = path.join(root, "episodes.ts"); const approvedDirectory = path.join(root, "approved"); await mkdir(approvedDirectory); await writeFile(episodesFile, source([oldEpisode, otherEpisode])); const artifactFile = `nuevo--CTC_T5E01_v${String(version).padStart(2, "0")}.json`; await writeFile(path.join(approvedDirectory, artifactFile), JSON.stringify(artifact(version))); return { root, episodesFile, approvedDirectory, artifactFile };
}
const environment = { NODE_ENV: "development", ENABLE_EDITOR: "true" } as NodeJS.ProcessEnv;

test("inserts a new episode and updates an existing one strictly by technical ID", () => {
  const inserted = buildEpisodesPatch([otherEpisode], artifact()); assert.equal(inserted.operation, "insert"); assert.equal(inserted.episodes[1].id, candidate.id);
  const updated = buildEpisodesPatch([oldEpisode, otherEpisode], artifact()); assert.equal(updated.operation, "update"); assert.equal(updated.episodes[0].title, "Nuevo"); assert.deepEqual(updated.episodes[1], otherEpisode);
});

test("preserves manual fields that are outside the promotion whitelist", () => {
  const result = applyPromotionPatch([oldEpisode], artifact())[0]; assert.deepEqual(result.transcript, oldEpisode.transcript); assert.equal(result.subtitles, oldEpisode.subtitles); assert.equal(result.id, oldEpisode.id);
});

test("preview is read-only and stale base or a newer artifact blocks apply", async () => {
  const item = await fixture();
  const before = await readFile(item.episodesFile, "utf8"); const preview = await createPromotionPreview(item.artifactFile, item);
  assert.equal(await readFile(item.episodesFile, "utf8"), before);
  assert.equal(promotionPatchStatus(preview, `${before}\n`, 1), "stale_base");
  await writeFile(path.join(item.approvedDirectory, "nuevo--CTC_T5E01_v02.json"), JSON.stringify(artifact(2)));
  await assert.rejects(() => persistPromotionPreview(preview.token, { ...item, environment }), /más reciente/);
});

test("apply makes a backup and atomically replaces only after a valid preview", async () => {
  const item = await fixture(); const preview = await createPromotionPreview(item.artifactFile, item); const result = await persistPromotionPreview(preview.token, { ...item, environment, now: new Date("2026-09-17T10:20:30.000Z") });
  assert.equal(result.operation, "update"); assert.match(result.backupFile, /backup-2026-09-17T10-20-30-000Z$/); assert.ok((await readFile(result.backupFile, "utf8")).includes("Antiguo")); assert.equal(__test__.parseEpisodes(await readFile(item.episodesFile, "utf8"))[0].title, "Nuevo"); assert.equal((await readdir(item.root)).some((name) => name.includes(".tmp-")), false);
});

test("rejects production, Vercel, traversal and non-approved artifact shapes", async () => {
  assert.equal(isPromotionWriteAvailable({ NODE_ENV: "production", ENABLE_EDITOR: "true" }), false); assert.equal(isPromotionWriteAvailable({ NODE_ENV: "development", ENABLE_EDITOR: "true", VERCEL: "1" }), false);
  await assert.rejects(() => loadApprovedPromotionArtifact("../escape.json"), /ruta segura/);
  const item = await fixture(); await writeFile(path.join(item.approvedDirectory, "nuevo--CTC_T5E01_v03.json"), JSON.stringify({ schemaVersion: 1, candidate })); await assert.rejects(() => loadApprovedPromotionArtifact("nuevo--CTC_T5E01_v03.json", item), /promoción aprobada/);
  const preview = await createPromotionPreview(item.artifactFile, item); await assert.rejects(() => persistPromotionPreview(preview.token, { ...item, environment: { NODE_ENV: "production", ENABLE_EDITOR: "true" } }), /desarrollo local/);
});
