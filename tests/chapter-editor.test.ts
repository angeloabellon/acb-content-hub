import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { getChapterEditorPreview } from "../lib/chapter-editor.ts";
import { getSafeChapterFileName, isChapterEditorStorageAvailable, persistApprovedChapters } from "../lib/chapter-editor-storage.ts";
import { acceptChapterProposal, editChapterProposal, generateChapterProposals, rejectChapterProposal } from "../lib/chapter-proposals.ts";
import type { Transcript } from "../types/transcript.ts";

const transcript: Transcript = {
  episodeId: "CTC_EDITOR",
  language: "es",
  visibility: "development-only",
  segments: [
    { id: "a", startSeconds: 0, endSeconds: 80, text: "Apertura breve." },
    { id: "b", startSeconds: 150, endSeconds: 230, text: "Segundo bloque." },
  ],
};
const options = { minimumDurationSeconds: 30, targetDurationSeconds: 60, maximumDurationSeconds: 120, minimumGapSeconds: 40 };
const developmentEnvironment = { ENABLE_EDITOR: "true", NODE_ENV: "development" } as NodeJS.ProcessEnv;

test("editor generation, edits and transitions reuse proposal business logic", () => {
  const generated = generateChapterProposals(transcript, options);
  assert.equal(generated.diagnostics.length, 0);
  assert.equal(generated.proposals.length, 2);
  const edited = editChapterProposal(generated.proposals[0], { title: "Apertura revisada" }, transcript).proposal;
  const accepted = acceptChapterProposal(edited, transcript).proposal;
  assert.equal(accepted.status, "accepted");
  assert.equal(rejectChapterProposal(generated.proposals[1]).status, "rejected");
});

test("preview rejects overlapping or unordered approved proposals", () => {
  const proposals = generateChapterProposals(transcript, options).proposals.map((proposal) => acceptChapterProposal(proposal, transcript).proposal);
  const invalid = [{ ...proposals[0], endSeconds: 200 }, proposals[1]];
  const preview = getChapterEditorPreview(invalid, transcript);
  assert.equal(preview.chapters.length, 0);
  assert.ok(preview.diagnostics.some((diagnostic) => diagnostic.code === "overlapping_proposals"));
});

test("storage writes only valid chapters to an isolated controlled directory", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "chapter-editor-"));
  try {
    const accepted = generateChapterProposals(transcript, options).proposals.map((proposal) => acceptChapterProposal(proposal, transcript).proposal);
    const preview = getChapterEditorPreview(accepted, transcript);
    const saved = await persistApprovedChapters({ episodeId: transcript.episodeId, slug: "episodio-editor", chapters: preview.chapters, transcript }, { baseDirectory: directory, environment: developmentEnvironment });
    assert.equal(saved.ok, true);
    if (saved.ok) {
      const document = JSON.parse(await readFile(saved.filePath, "utf8"));
      assert.equal(document.episodeId, transcript.episodeId);
      assert.equal(document.chapters.length, 2);
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("storage rejects invalid chapters, traversal identifiers, conflicts and production", async () => {
  assert.equal(getSafeChapterFileName("../bad", "episodio"), undefined);
  assert.equal(getSafeChapterFileName("CTC_EDITOR", "../episodio"), undefined);
  assert.equal(isChapterEditorStorageAvailable({ ENABLE_EDITOR: "true", NODE_ENV: "production" }), false);
  const directory = await mkdtemp(path.join(os.tmpdir(), "chapter-editor-"));
  try {
    const accepted = generateChapterProposals(transcript, options).proposals.map((proposal) => acceptChapterProposal(proposal, transcript).proposal);
    const chapters = getChapterEditorPreview(accepted, transcript).chapters;
    const first = await persistApprovedChapters({ episodeId: transcript.episodeId, slug: "episodio-editor", chapters, transcript }, { baseDirectory: directory, environment: developmentEnvironment });
    assert.equal(first.ok, true);
    const conflict = await persistApprovedChapters({ episodeId: transcript.episodeId, slug: "episodio-editor", chapters, transcript }, { baseDirectory: directory, environment: developmentEnvironment });
    assert.deepEqual(conflict, { ok: false, reason: "conflict" });
    const versioned = await persistApprovedChapters({ episodeId: transcript.episodeId, slug: "episodio-editor", chapters, transcript }, { baseDirectory: directory, environment: developmentEnvironment, allowVersionedFile: true });
    assert.equal(versioned.ok, true);
    if (versioned.ok) assert.match(versioned.filePath, /-v2\.json$/);
    const invalid = await persistApprovedChapters({ episodeId: transcript.episodeId, slug: "episodio-otro", chapters: [{ ...chapters[0], startSeconds: -1 }], transcript }, { baseDirectory: directory, environment: developmentEnvironment });
    assert.equal(invalid.ok, false);
    if (!invalid.ok) assert.equal(invalid.reason, "invalid_chapters");
    const production = await persistApprovedChapters({ episodeId: transcript.episodeId, slug: "produccion", chapters, transcript }, { baseDirectory: directory, environment: { ENABLE_EDITOR: "true", NODE_ENV: "production" } });
    assert.deepEqual(production, { ok: false, reason: "not_writable_environment" });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
