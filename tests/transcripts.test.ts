import assert from "node:assert/strict";
import test from "node:test";

import { demoEspecialCopaDel96Transcript } from "../data/transcripts/demo-especial-copa-del-96.ts";
import {
  formatTranscriptTimestamp,
  getRenderableTranscriptByEpisodeId,
  getTranscriptByEpisodeId,
  getTranscriptSegmentAnchor,
  getTranscriptSegments,
} from "../lib/transcripts.ts";
import type { Transcript } from "../types/transcript.ts";

test("an episode without a transcript has no renderable transcript module", () => {
  assert.equal(getTranscriptByEpisodeId("CTC_UNKNOWN"), undefined);
  assert.equal(getRenderableTranscriptByEpisodeId("CTC_UNKNOWN"), undefined);
  assert.deepEqual(getTranscriptSegments("CTC_UNKNOWN"), []);
});

test("the pilot fixture is scoped to its own technical episode", () => {
  assert.equal(getTranscriptByEpisodeId("CTC_T5E01")?.episodeId, "CTC_T5E01");
  assert.equal(getTranscriptByEpisodeId("CTC_T5E02"), undefined);
  assert.equal(getTranscriptSegments("CTC_T5E01").length, 2);
});

test("segments expose stable, SEO-friendly fragment anchors", () => {
  const segment = demoEspecialCopaDel96Transcript.segments[0];
  assert.equal(getTranscriptSegmentAnchor(segment), "transcript-demo-introduccion");
  assert.equal(getTranscriptSegmentAnchor({ id: "source-12" }), "transcript-source-12");
});

test("timestamps, speakers and timing-free segments remain optional", () => {
  const timed = demoEspecialCopaDel96Transcript.segments[0];
  const untimed = demoEspecialCopaDel96Transcript.segments[1];
  assert.equal(timed.startSeconds, 0);
  assert.equal(timed.speaker, "Demo técnica");
  assert.equal(untimed.startSeconds, undefined);
  assert.equal(untimed.speaker, undefined);
  assert.equal(formatTranscriptTimestamp(125), "2:05");
});

test("a valid transcript can have no timestamps at all", () => {
  const withoutTimestamps: Transcript = {
    episodeId: "CTC_TEST_NO_TIME",
    language: "es",
    visibility: "development-only",
    segments: [{ id: "opening", text: "Texto de prueba sin marca de tiempo." }],
  };
  assert.deepEqual(withoutTimestamps.segments[0], {
    id: "opening",
    text: "Texto de prueba sin marca de tiempo.",
  });
});

test("development-only fixtures are not rendered without explicit opt-in", () => {
  assert.equal(getRenderableTranscriptByEpisodeId("CTC_T5E01"), undefined);
});
