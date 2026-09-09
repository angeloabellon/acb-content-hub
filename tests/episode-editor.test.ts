import assert from "node:assert/strict";
import test from "node:test";

import { createEpisodeEditorialSummary, loadLocalChapterSources } from "../lib/episode-editor.ts";
import { importEpisodeManifestSources } from "../lib/episode-manifest-importer.ts";
import { importTranscriptFile } from "../lib/transcript-importer.ts";
import type { Episode } from "../types/episode.ts";
import type { Transcript } from "../types/transcript.ts";

const episode: Episode = { id: "CTC_T5E01", kind: "special", season: 5, episodeNumber: 1, slug: "especial-editorial", title: "Especial editorial", date: "2026-09-09", description: "", thumbnail: "", participants: [{ name: "Equipo" }], platforms: { youtube: "https://youtube.com/watch?v=x" } };
const demoTranscript: Transcript = { episodeId: episode.id, language: "es", source: "local-fixture", visibility: "development-only", isDemo: true, segments: [{ id: "a", startSeconds: 0, endSeconds: 4, text: "Demo." }] };

test("dashboard summary identifies partial episode data, demo transcript and platform gaps", () => {
  const summary = createEpisodeEditorialSummary(episode, { transcript: demoTranscript });
  assert.equal(summary.transcript.status, "demo");
  assert.equal(summary.transcript.hasTimestamps, true);
  assert.equal(summary.publication.available.length, 1);
  assert.deepEqual(summary.publication.missing, ["ivoox", "applePodcasts", "spotify"]);
  assert.equal(summary.chapters.publishedCount, 0);
});

test("dashboard summary reports no transcript and no local chapters clearly", () => {
  const summary = createEpisodeEditorialSummary(episode);
  assert.equal(summary.transcript.status, "no-disponible");
  assert.equal(summary.chapters.statusDetail.label, "No disponibles");
  assert.equal(summary.chapters.hasProposals, false);
});

test("dashboard summary distinguishes imported transcript and local chapters", () => {
  const imported = importTranscriptFile({ filename: "CTC_T5E01_SUBTITULOS.srt", contents: "1\n00:00:00,000 --> 00:00:02,000\nTexto real\n", metadata: { language: "es" } });
  const summary = createEpisodeEditorialSummary(episode, { transcript: imported.transcript, importedTranscripts: [imported], localChapters: [{ fileName: "especial-editorial--CTC_T5E01.json", chapterCount: 2, valid: true, diagnostics: [] }] });
  assert.equal(summary.transcript.status, "importada");
  assert.equal(summary.transcript.hash, imported.source.sha256);
  assert.equal(summary.chapters.localCount, 2);
});

test("dashboard diagnostics expose invalid and duplicate manifests without parsing again", () => {
  const validManifest = JSON.stringify({ schema_version: "1.1", episodio: { id: "CTC_T5E09", tipo: "regular", temporada: 5, numero: 9, titulo: "Importado", descripcion: "", fecha: "2026-09-09", participantes: [] }, publicacion: { thumbnail: "https://example.test/cover.jpg", plataformas: {} } });
  const imports = importEpisodeManifestSources([{ source: "broken.json", contents: "{" }, { source: "first.json", contents: validManifest }, { source: "duplicate.json", contents: validManifest }]);
  const summary = createEpisodeEditorialSummary(episode, { importedManifests: imports, importedTranscripts: [importTranscriptFile({ filename: "CTC_T5E01_TRANSCRIPCION.txt", contents: "", metadata: {} })] });
  assert.equal(summary.diagnostics.manifests.length, 3);
  assert.ok(summary.diagnostics.manifests.some((item) => item.status === "duplicate"));
  assert.ok(summary.diagnostics.warnings.length > 0);
});

test("local chapter reader ignores unrelated filenames", async () => {
  const summary = await loadLocalChapterSources(episode, "/definitely-missing-editor-directory");
  assert.deepEqual(summary, []);
});
