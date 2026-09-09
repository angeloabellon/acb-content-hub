import { convertAcceptedProposalsToChapters } from "./chapter-proposals.ts";
import type { ChapterProposal } from "../types/chapter-proposal.ts";
import type { Transcript } from "../types/transcript.ts";

/** Keeps the component and persistence action on the same business conversion path. */
export function getChapterEditorPreview(
  proposals: readonly ChapterProposal[],
  transcript: Transcript,
) {
  return convertAcceptedProposalsToChapters(proposals, transcript);
}
