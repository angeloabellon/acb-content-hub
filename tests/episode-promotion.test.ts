import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { approvePublicEpisodeCandidate, buildPublicEpisodeCandidate, diffPublicEpisode } from "../lib/episode-promotion.ts";
import { getSafePromotionFileStem, isEpisodePromotionStorageAvailable, persistApprovedPublicEpisodeCandidate } from "../lib/episode-promotion-storage.ts";
import type { Chapter } from "../types/chapter.ts";
import type { Episode } from "../types/episode.ts";
import type { Transcript } from "../types/transcript.ts";

const episode: Episode = { id: "CTC_T5E10", kind: "episode", season: 5, episodeNumber: 10, slug: "episodio-de-prueba", title: "Episodio de prueba", date: "2026-09-17", description: "Descripción editorial completa.", thumbnail: "https://cdn.example.test/episode.jpg", participants: [{ name: "Equipo", role: "Presentación" }], platforms: { youtube: "https://www.youtube.com/watch?v=test" } };
const transcript: Transcript = { episodeId: episode.id, language: "es", source: "importación controlada", visibility: "development-only", segments: [{ id: "s1", startSeconds: 0, endSeconds: 10, text: "Texto válido." }] };
const chapters: readonly Chapter[] = [{ id: "c1", episodeId: episode.id, title: "Inicio", startSeconds: 0, transcriptSegmentIds: ["s1"], visibility: "development-only" }];
const environment = { ENABLE_EDITOR: "true", NODE_ENV: "development" } as NodeJS.ProcessEnv;

test("a complete candidate is ready and does not mutate its sources", () => {
  const original = structuredClone(episode);
  const candidate = buildPublicEpisodeCandidate({ current: episode, transcript, chapters, createdAt: "2026-09-17T00:00:00.000Z" });
  assert.equal(candidate.status, "ready");
  assert.deepEqual(episode, original);
  assert.equal(candidate.sourceSummary.fields.title, "public-data");
});

test("missing public fields and manifest identity conflict block promotion", () => {
  const missing = buildPublicEpisodeCandidate({ current: { ...episode, title: "", description: "", thumbnail: "" } });
  assert.equal(missing.status, "blocked");
  assert.ok(missing.validation.some((item) => item.code === "missing_title"));
  const conflict = buildPublicEpisodeCandidate({ current: episode, manifestEpisode: { ...episode, episodeNumber: 11 } });
  assert.equal(conflict.status, "blocked");
  assert.ok(conflict.validation.some((item) => item.code === "manifest_manual_conflict"));
});

test("included invalid transcript or chapters block promotion", () => {
  const invalidTranscript = buildPublicEpisodeCandidate({ current: episode, transcript: { ...transcript, episodeId: "CTC_T5E99", segments: [] } });
  assert.equal(invalidTranscript.status, "blocked");
  const invalidChapters = buildPublicEpisodeCandidate({ current: episode, transcript, chapters: [{ ...chapters[0], startSeconds: -1 }] });
  assert.equal(invalidChapters.status, "blocked");
});

test("diff reports unchanged, added, removed and changed values", () => {
  const current = { ...episode, subtitles: "/subtitles.vtt", transcript: { language: "es", source: "automation", visibility: "public" as const } };
  const candidate = { ...episode, title: "Título revisado", participants: [], platforms: {} };
  const diff = diffPublicEpisode(current, candidate);
  assert.equal(diff.find((item) => item.field === "id")?.kind, "unchanged");
  assert.equal(diff.find((item) => item.field === "title")?.kind, "changed");
  assert.equal(diff.find((item) => item.field === "participants")?.kind, "changed");
  assert.equal(diff.find((item) => item.field === "subtitles")?.kind, "removed");
  assert.equal(diffPublicEpisode(undefined, candidate).find((item) => item.field === "title")?.kind, "added");
});

test("blocked candidates cannot be approved", () => {
  const blocked = buildPublicEpisodeCandidate({ current: { ...episode, slug: "No estable" } });
  assert.throws(() => approvePublicEpisodeCandidate(blocked), /bloqueado/);
});

test("approved storage is local-only, safe, append-only and versioned", async () => {
  assert.equal(isEpisodePromotionStorageAvailable({ ENABLE_EDITOR: "true", NODE_ENV: "production" }), false);
  assert.equal(getSafePromotionFileStem("../bad", "episodio"), undefined);
  assert.equal(getSafePromotionFileStem("CTC_T5E10", "../episodio"), undefined);
  const directory = await mkdtemp(path.join(os.tmpdir(), "promotion-"));
  try {
    const approved = approvePublicEpisodeCandidate(buildPublicEpisodeCandidate({ current: episode, transcript, chapters }));
    const first = await persistApprovedPublicEpisodeCandidate(approved, { baseDirectory: directory, environment });
    const second = await persistApprovedPublicEpisodeCandidate(approved, { baseDirectory: directory, environment });
    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    if (first.ok && second.ok) {
      assert.match(first.filePath, /_v01\.json$/);
      assert.match(second.filePath, /_v02\.json$/);
      const artifact = JSON.parse(await readFile(first.filePath, "utf8"));
      assert.equal(artifact.approval.version, 1);
      assert.deepEqual(artifact.diagnostics, []);
      assert.equal(artifact.candidate.id, episode.id);
    }
  } finally { await rm(directory, { recursive: true, force: true }); }
});
