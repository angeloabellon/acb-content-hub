import assert from "node:assert/strict";
import test from "node:test";

import {
  acceptChapterProposal,
  convertAcceptedProposalsToChapters,
  editChapterProposal,
  generateChapterProposals,
  rejectChapterProposal,
  validateChapterProposals,
} from "../lib/chapter-proposals.ts";
import type { Transcript } from "../types/transcript.ts";

const timedTranscript: Transcript = {
  episodeId: "CTC_PROPOSALS",
  language: "es",
  visibility: "development-only",
  segments: [
    { id: "s1", startSeconds: 0, endSeconds: 20, text: "Inicio técnico." },
    { id: "s2", startSeconds: 20, endSeconds: 100, speaker: "A", text: "Contexto." },
    { id: "s3", startSeconds: 180, endSeconds: 200, speaker: "B", text: "Cambio." },
    { id: "s4", startSeconds: 200, endSeconds: 220, speaker: "B", text: "Cierre." },
  ],
};

const testOptions = { minimumDurationSeconds: 60, targetDurationSeconds: 120, maximumDurationSeconds: 180, minimumGapSeconds: 45, maximumChapterCount: 6 };

test("timestamped transcripts generate deterministic, neutral proposals with evidence", () => {
  const first = generateChapterProposals(timedTranscript, testOptions);
  const second = generateChapterProposals(timedTranscript, testOptions);
  assert.deepEqual(first, second);
  assert.equal(first.diagnostics.length, 0);
  assert.deepEqual(first.proposals.map(({ title, transcriptSegmentIds, cutReason }) => ({ title, transcriptSegmentIds, cutReason })), [
    { title: "Bloque 1", transcriptSegmentIds: ["s1", "s2"], cutReason: undefined },
    { title: "Bloque 2", transcriptSegmentIds: ["s3", "s4"], cutReason: "gap" },
  ]);
});

test("a transcript without complete timestamps is unsupported and cannot yield publishable chapters", () => {
  const result = generateChapterProposals({ ...timedTranscript, segments: [{ id: "no-time", text: "Sin tiempo." }] });
  assert.equal(result.proposals.length, 0);
  assert.equal(result.diagnostics[0].code, "unsupported/no_timestamps");
});

test("maximum duration forces a cut and keeps segment ids as evidence", () => {
  const transcript: Transcript = { ...timedTranscript, segments: [
    { id: "a", startSeconds: 0, text: "A" }, { id: "b", startSeconds: 90, text: "B" }, { id: "c", startSeconds: 190, text: "C" },
  ] };
  const result = generateChapterProposals(transcript, { ...testOptions, maximumDurationSeconds: 150, minimumGapSeconds: 999 });
  assert.deepEqual(result.proposals.map((proposal) => proposal.transcriptSegmentIds), [["a", "b"], ["c"]]);
  assert.equal(result.proposals[1].cutReason, "duration_threshold");
});

test("accepted proposals convert through Chapter validation; rejected or edited ones do not", () => {
  const proposals = generateChapterProposals(timedTranscript, testOptions).proposals;
  const accepted = proposals.map((proposal) => acceptChapterProposal(proposal, timedTranscript).proposal);
  const conversion = convertAcceptedProposalsToChapters(accepted, timedTranscript);
  assert.equal(conversion.diagnostics.length, 0);
  assert.equal(conversion.chapterDiagnostics.length, 0);
  assert.equal(conversion.chapters[0].visibility, "development-only");

  const rejected = rejectChapterProposal(accepted[0]);
  assert.equal(convertAcceptedProposalsToChapters([rejected], timedTranscript).diagnostics[0].code, "proposal_not_accepted");
  const edited = editChapterProposal(accepted[0], { title: "Título revisado", startSeconds: 1 }, timedTranscript);
  assert.equal(edited.proposal.status, "edited");
  assert.equal(convertAcceptedProposalsToChapters([edited.proposal], timedTranscript).diagnostics[0].code, "proposal_not_accepted");
});

test("editing revalidates and invalid proposal ordering or overlap is rejected", () => {
  const proposals = generateChapterProposals(timedTranscript, testOptions).proposals;
  const invalidEdit = editChapterProposal(proposals[0], { endSeconds: 0 }, timedTranscript);
  assert.ok(invalidEdit.diagnostics.some((diagnostic) => diagnostic.code === "invalid_end_seconds"));
  const invalid = [{ ...proposals[0], startSeconds: 180, endSeconds: 200 }, { ...proposals[1], startSeconds: 100 }];
  const diagnostics = validateChapterProposals(invalid, timedTranscript);
  assert.ok(diagnostics.some((diagnostic) => diagnostic.code === "unordered_start"));
  assert.ok(diagnostics.some((diagnostic) => diagnostic.code === "overlapping_proposals"));
});
