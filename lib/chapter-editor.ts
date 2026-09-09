import { convertAcceptedProposalsToChapters } from "./chapter-proposals.ts";
import type { ChapterProposal } from "../types/chapter-proposal.ts";
import type { Transcript } from "../types/transcript.ts";

/** Development gate; it intentionally is not authentication. */
export function isChapterEditorEnabled(environment: NodeJS.ProcessEnv = process.env): boolean {
  return environment.ENABLE_EDITOR === "true";
}

/** Keeps the component and persistence action on the same business conversion path. */
export function getChapterEditorPreview(
  proposals: readonly ChapterProposal[],
  transcript: Transcript,
) {
  return convertAcceptedProposalsToChapters(proposals, transcript);
}
