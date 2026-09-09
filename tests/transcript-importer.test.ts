import assert from "node:assert/strict";
import test from "node:test";

import {
  getImportedTranscriptByEpisodeId,
  hashTranscriptContents,
  importTranscriptFile,
  parseTranscriptSrt,
  parseTranscriptTxt,
} from "../lib/transcript-importer.ts";

const metadata = { episodeId: "CTC_T5E01", source: "test", version: "v1" };

test("TXT imports non-empty paragraphs as deterministic timing-free segments", () => {
  const input = "  Primer párrafo.  \n\nSegundo\npárrafo.\n\n\tTercero.";
  const first = parseTranscriptTxt(input, metadata);
  const second = parseTranscriptTxt(input, metadata);
  assert.equal(first.diagnostics.length, 0);
  assert.deepEqual(first.transcript?.segments.map((segment) => segment.text), ["Primer párrafo.", "Segundo párrafo.", "Tercero."]);
  assert.deepEqual(first.transcript?.segments.map((segment) => segment.id), second.transcript?.segments.map((segment) => segment.id));
  assert.equal(first.transcript?.segments[0].startSeconds, undefined);
});

test("empty TXT is invalid", () => {
  const result = parseTranscriptTxt(" \n\t ", metadata);
  assert.equal(result.transcript, undefined);
  assert.equal(result.diagnostics[0].code, "empty_input");
});

test("valid multi-cue SRT converts timestamps and preserves cue line breaks", () => {
  const result = parseTranscriptSrt("1\n00:00:01,250 --> 00:00:03,500\nPrimera línea\nsegunda línea\n\n2\n00:00:04,000 --> 00:00:05,000\nFinal", metadata);
  assert.equal(result.diagnostics.length, 0);
  assert.equal(result.transcript?.segments[0].startSeconds, 1.25);
  assert.equal(result.transcript?.segments[0].endSeconds, 3.5);
  assert.equal(result.transcript?.segments[0].text, "Primera línea\nsegunda línea");
});

test("SRT rejects non-correlative indices, malformed times, invalid ranges, regressions and empty cues", () => {
  const cases = [
    ["2\n00:00:00,000 --> 00:00:01,000\nTexto", "invalid_srt_index"],
    ["1\n0:00:00,000 --> 00:00:01,000\nTexto", "invalid_srt_timestamp"],
    ["1\n00:00:01,000 --> 00:00:01,000\nTexto", "invalid_srt_range"],
    ["1\n00:00:03,000 --> 00:00:04,000\nUno\n\n2\n00:00:02,000 --> 00:00:05,000\nDos", "non_monotonic_srt"],
    ["1\n00:00:00,000 --> 00:00:01,000\n\n", "empty_srt_cue"],
  ] as const;
  for (const [input, expected] of cases) {
    const result = parseTranscriptSrt(input, metadata);
    assert.equal(result.transcript, undefined, expected);
    assert.ok(result.diagnostics.some((diagnostic) => diagnostic.code === expected), expected);
  }
});

test("file imports demand an exact controlled filename and matching episode", () => {
  const mismatched = importTranscriptFile({ filename: "DEMO_CTC_T5E01_TRANSCRIPCION.txt", contents: "Texto", metadata: { episodeId: "CTC_T5E02" } });
  const arbitrary = importTranscriptFile({ filename: "../CTC_T5E01_TRANSCRIPCION.txt", contents: "Texto" });
  const wrongPair = importTranscriptFile({ filename: "DEMO_CTC_T5E01_SUBTITULOS.txt", contents: "Texto" });
  assert.equal(mismatched.status, "invalid");
  assert.equal(mismatched.diagnostics[0].code, "filename_mismatch");
  assert.equal(arbitrary.diagnostics[0].code, "unsupported_filename");
  assert.equal(wrongPair.diagnostics[0].code, "unsupported_filename");
});

test("hashes and imported segment IDs are deterministic", () => {
  assert.equal(hashTranscriptContents("mismo contenido"), hashTranscriptContents("mismo contenido"));
  assert.notEqual(hashTranscriptContents("uno"), hashTranscriptContents("dos"));
  const imported = importTranscriptFile({ filename: "DEMO_CTC_T5E01_TRANSCRIPCION.txt", contents: "Texto estable" });
  const repeated = importTranscriptFile({ filename: "DEMO_CTC_T5E01_TRANSCRIPCION.txt", contents: "Texto estable" });
  assert.equal(imported.status, "valid");
  assert.equal(imported.source.sha256.length, 64);
  assert.equal(imported.transcript?.segments[0].id, repeated.transcript?.segments[0].id);
});

test("a bad import remains isolated from other valid imports and future lookup", () => {
  const good = importTranscriptFile({ filename: "DEMO_CTC_T5E01_TRANSCRIPCION.txt", contents: "Bueno" });
  const bad = importTranscriptFile({ filename: "DEMO_CTC_T5E02_SUBTITULOS.srt", contents: "1\n00:00:02,000 --> 00:00:01,000\nMalo" });
  assert.equal(good.status, "valid");
  assert.equal(bad.status, "invalid");
  assert.equal(getImportedTranscriptByEpisodeId([bad, good], "CTC_T5E01")?.segments[0].text, "Bueno");
  assert.equal(getImportedTranscriptByEpisodeId([bad, good], "CTC_T5E02"), undefined);
});
