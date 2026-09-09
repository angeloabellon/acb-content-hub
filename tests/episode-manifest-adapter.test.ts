import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  EpisodeManifestValidationError,
  episodeFromManifest,
  parseEpisodeManifest,
} from "../lib/episode-manifest-adapter.ts";

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(new URL(`./fixtures/episode-manifests/${name}.json`, import.meta.url), "utf8"));
}

test("accepts known schemas and maps regular episode identity", () => {
  const manifest = parseEpisodeManifest(fixture("regular"));
  assert.equal(manifest.schemaVersion, "1.1");
  assert.deepEqual(
    { id: manifest.id, kind: manifest.kind, season: manifest.season, episodeNumber: manifest.episodeNumber },
    { id: "CTC_T5E02", kind: "episode", season: 5, episodeNumber: 2 },
  );
  assert.deepEqual(manifest.platforms, {
    youtube: "https://www.youtube.com/watch?v=regular02",
    ivoox: "https://www.ivoox.com/regular02",
  });
  assert.ok(manifest.diagnostics.some((item) => item.field === "publicacion.plataformas.spotify"));
});

test("normalizes special and interview types and preserves an empty participant list", () => {
  assert.equal(parseEpisodeManifest(fixture("special")).kind, "special");
  assert.deepEqual(parseEpisodeManifest(fixture("interview")).participants, []);
  assert.equal(parseEpisodeManifest(fixture("interview")).kind, "interview");
});

test("rejects unknown schemas instead of silently coercing them", () => {
  assert.throws(
    () => parseEpisodeManifest(fixture("unknown-schema")),
    (error: unknown) => error instanceof EpisodeManifestValidationError && error.message.includes("Unsupported schema_version"),
  );
});

test("returns a partial result and diagnostics when fields are absent", () => {
  const result = episodeFromManifest(parseEpisodeManifest(fixture("incomplete")));
  assert.equal(result.episode, undefined);
  assert.equal(result.partial.id, "CTC_T5E04");
  assert.equal(result.partial.platforms?.youtube, undefined);
  assert.ok(result.diagnostics.some((item) => item.code === "missing_field" && item.field === "title"));
});

test("web editorial overrides win only for presentation fields", () => {
  const result = episodeFromManifest(parseEpisodeManifest(fixture("regular")), {
    slug: "jornada-decisiva-cast-to-cast",
    title: "La jornada decisiva — edición web",
    description: "Copy editorial para la web.",
    thumbnail: "https://cdn.example.test/editorial.jpg",
  });
  assert.equal(result.episode?.id, "CTC_T5E02");
  assert.equal(result.episode?.season, 5);
  assert.equal(result.episode?.title, "La jornada decisiva — edición web");
  assert.equal(result.episode?.slug, "jornada-decisiva-cast-to-cast");
  assert.equal(result.episode?.platforms.youtube, "https://www.youtube.com/watch?v=regular02");
});

test("uses a stable deterministic slug when no editorial slug exists", () => {
  const manifest = parseEpisodeManifest(fixture("special"));
  assert.equal(episodeFromManifest(manifest).partial.slug, "especial-copa-del-96");
  assert.equal(episodeFromManifest(manifest).partial.slug, "especial-copa-del-96");
});

test("reports invalid conflicting publication values instead of publishing them", () => {
  const manifest = parseEpisodeManifest({
    schema_version: "1.1",
    episodio: { id: "CTC_T5E05", tipo: "regular", temporada: 5, numero: 5 },
    publicacion: { plataformas: { youtube: "javascript:alert(1)" } },
  });
  assert.equal(manifest.platforms, undefined);
  assert.ok(manifest.diagnostics.some((item) => item.code === "invalid_field"));
});
