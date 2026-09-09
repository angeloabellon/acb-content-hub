import assert from "node:assert/strict";
import test from "node:test";

import { demoEspecialCopaDel96Chapters } from "../data/chapters/demo-especial-copa-del-96.ts";
import {
  formatChapterTimestamp,
  getChapterAnchor,
  getChaptersByEpisodeId,
  getRenderableChaptersByEpisodeId,
  getTranscriptSegmentsForChapter,
  getYouTubeTimestampUrl,
  validateChapters,
} from "../lib/chapters.ts";
import { demoEspecialCopaDel96Transcript } from "../data/transcripts/demo-especial-copa-del-96.ts";
import type { Chapter } from "../types/chapter.ts";

const validChapters: readonly Chapter[] = [
  { id: "opening", episodeId: "CTC_T5E01", title: "Apertura", startSeconds: 0, endSeconds: 10, visibility: "public" },
  { id: "context", episodeId: "CTC_T5E01", title: "Contexto", startSeconds: 10, visibility: "public" },
];

test("valid chapters are strictly ordered and use stable anchors", () => {
  assert.deepEqual(validateChapters(validChapters, { episodeId: "CTC_T5E01" }), []);
  assert.equal(getChapterAnchor(validChapters[0]), "chapter-opening");
  assert.equal(formatChapterTimestamp(3661), "1:01:01");
});

test("chapter validation rejects invalid timing, titles, ordering and duplicate ids", () => {
  const cases: Array<[readonly Chapter[], string]> = [
    [[{ ...validChapters[0], startSeconds: -1 }], "invalid_start_seconds"],
    [[{ ...validChapters[0], title: "  " }], "empty_title"],
    [[{ ...validChapters[0] }, { ...validChapters[1], id: "opening" }], "duplicate_id"],
    [[{ ...validChapters[0], endSeconds: 0 }], "invalid_end_seconds"],
    [[{ ...validChapters[0], endSeconds: 20 }, { ...validChapters[1], startSeconds: 10 }], "overlapping_chapters"],
    [[{ ...validChapters[0], startSeconds: 10 }, { ...validChapters[1], startSeconds: 10 }], "unordered_start"],
  ];
  for (const [chapters, expected] of cases) {
    assert.ok(validateChapters(chapters, { episodeId: "CTC_T5E01" }).some((diagnostic) => diagnostic.code === expected), expected);
  }
});

test("chapter episode and transcript references must match the same episode", () => {
  const wrongEpisode = [{ ...validChapters[0], episodeId: "CTC_T5E02" }];
  assert.ok(validateChapters(wrongEpisode, { episodeId: "CTC_T5E01" }).some((diagnostic) => diagnostic.code === "invalid_episode_id"));

  const missingSegment = [{ ...validChapters[0], transcriptSegmentIds: ["missing"] }];
  assert.ok(validateChapters(missingSegment, { episodeId: "CTC_T5E01", transcript: demoEspecialCopaDel96Transcript }).some((diagnostic) => diagnostic.code === "unknown_transcript_segment"));
  assert.ok(validateChapters([{ ...validChapters[0], transcriptSegmentIds: ["demo-introduccion"] }], { episodeId: "CTC_T5E01" }).some((diagnostic) => diagnostic.code === "transcript_not_available"));
  assert.ok(validateChapters([{ ...validChapters[0], transcriptSegmentIds: ["demo-introduccion"] }], { episodeId: "CTC_T5E01", transcript: { ...demoEspecialCopaDel96Transcript, episodeId: "CTC_T5E02" } }).some((diagnostic) => diagnostic.code === "transcript_not_available"));
});

test("chapter transcript evidence resolves only from its own episode", () => {
  const chapter = demoEspecialCopaDel96Chapters[0];
  assert.deepEqual(getTranscriptSegmentsForChapter(chapter, demoEspecialCopaDel96Transcript).map((segment) => segment.id), ["demo-introduccion"]);
  assert.deepEqual(getTranscriptSegmentsForChapter(chapter, { ...demoEspecialCopaDel96Transcript, episodeId: "CTC_T5E02" }), []);
});

test("timestamp URLs support watch links, short links and existing query parameters", () => {
  assert.equal(getYouTubeTimestampUrl("https://www.youtube.com/watch?v=abc", 65), "https://www.youtube.com/watch?v=abc&t=65s");
  assert.equal(getYouTubeTimestampUrl("https://youtu.be/abc?feature=share", 3), "https://youtu.be/abc?feature=share&t=3s");
  assert.equal(getYouTubeTimestampUrl("https://www.youtube.com/watch?v=abc&list=playlist#section", 0), "https://www.youtube.com/watch?v=abc&list=playlist&t=0s#section");
  assert.equal(getYouTubeTimestampUrl("https://example.com/watch?v=abc", 5), undefined);
});

test("chapters remain separate from episodes and demo chapters are opt-in", () => {
  assert.equal(getChaptersByEpisodeId("CTC_T5E01").length, 2);
  assert.deepEqual(getChaptersByEpisodeId("CTC_UNKNOWN"), []);
  assert.deepEqual(getRenderableChaptersByEpisodeId("CTC_T5E01"), []);

  const previousFlag = process.env.NEXT_PUBLIC_ENABLE_DEMO_TRANSCRIPTS;
  process.env.NEXT_PUBLIC_ENABLE_DEMO_TRANSCRIPTS = "true";
  try {
    assert.equal(getRenderableChaptersByEpisodeId("CTC_T5E01").length, 2);
  } finally {
    if (previousFlag === undefined) delete process.env.NEXT_PUBLIC_ENABLE_DEMO_TRANSCRIPTS;
    else process.env.NEXT_PUBLIC_ENABLE_DEMO_TRANSCRIPTS = previousFlag;
  }
});
