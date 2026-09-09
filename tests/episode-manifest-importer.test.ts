import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { episodes } from "../data/episodes.ts";
import {
  getImportedEpisodeById,
  importEpisodeManifestSources,
  loadImportedEpisodeManifests,
  resolveEpisodesWithImportedManifests,
} from "../lib/episode-manifest-importer.ts";

function fixture(name: string) {
  return readFileSync(new URL(`./fixtures/episode-manifests/${name}.json`, import.meta.url), "utf8");
}

test("imports a valid manifest through the adapter", () => {
  const [result] = importEpisodeManifestSources([{ source: "data/manifests/regular.json", contents: fixture("regular") }]);
  assert.equal(result.status, "imported");
  assert.equal(result.episode?.id, "CTC_T5E02");
  assert.equal(result.source, "data/manifests/regular.json");
});

test("records invalid JSON and continues with good manifests", () => {
  const results = importEpisodeManifestSources([
    { source: "data/manifests/broken.json", contents: "{ broken" },
    { source: "data/manifests/regular.json", contents: fixture("regular") },
  ]);
  assert.equal(results[0].status, "error");
  assert.equal(results[0].diagnostics[0].code, "invalid_json");
  assert.equal(results[1].status, "imported");
});

test("records an unsupported schema without blocking other files", () => {
  const results = importEpisodeManifestSources([
    { source: "data/manifests/unknown.json", contents: fixture("unknown-schema") },
    { source: "data/manifests/regular.json", contents: fixture("regular") },
  ]);
  assert.equal(results[0].status, "error");
  assert.equal(results[0].diagnostics[0].code, "invalid_manifest");
  assert.equal(results[1].episode?.id, "CTC_T5E02");
});

test("keeps a parseable incomplete manifest as a partial result", () => {
  const [result] = importEpisodeManifestSources([{ source: "data/manifests/incomplete.json", contents: fixture("incomplete") }]);
  assert.equal(result.status, "partial");
  assert.equal(result.episode, undefined);
  assert.ok(result.diagnostics.some((item) => item.code === "missing_field"));
});

test("rejects a later duplicate technical id", () => {
  const results = importEpisodeManifestSources([
    { source: "data/manifests/first.json", contents: fixture("regular") },
    { source: "data/manifests/second.json", contents: fixture("regular") },
  ]);
  assert.equal(results[0].status, "imported");
  assert.equal(results[1].status, "duplicate");
  assert.equal(results[1].diagnostics[0].code, "duplicate_id");
});

test("future resolver reports a manual conflict and preserves manual data by default", () => {
  const imports = importEpisodeManifestSources([{ source: "data/manifests/special.json", contents: fixture("special") }]);
  const merged = resolveEpisodesWithImportedManifests(episodes, imports);
  assert.equal(merged.conflicts.length, 1);
  assert.equal(merged.episodes.find((episode) => episode.id === "CTC_T5E01")?.title, episodes[0].title);
});

test("future resolver can explicitly prefer a verified imported episode", () => {
  const imports = importEpisodeManifestSources([{ source: "data/manifests/special.json", contents: fixture("special") }]);
  const merged = resolveEpisodesWithImportedManifests(episodes, imports, "imported-wins");
  assert.equal(merged.episodes.find((episode) => episode.id === "CTC_T5E01")?.title, "Especial Copa del 96");
  assert.equal(getImportedEpisodeById(imports, "CTC_T5E01")?.id, "CTC_T5E01");
});

test("loads the repository demo directory without making it an application source", async () => {
  const results = await loadImportedEpisodeManifests();
  assert.equal(results.length, 1);
  assert.equal(results[0].status, "imported");
  assert.equal(results[0].episode?.id, "CTC_DEMO_T5E02");
});
