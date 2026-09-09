import { notFound } from "next/navigation";

import { saveApprovedChapterProposals } from "./actions";
import { ChapterProposalEditor } from "@/components/editor/ChapterProposalEditor";
import { isChapterEditorStorageAvailable } from "@/lib/chapter-editor-storage";
import { generateChapterProposals } from "@/lib/chapter-proposals";
import { getEpisodeBySlug } from "@/lib/episodes";
import { getTranscriptByEpisodeId } from "@/lib/transcripts";
import { requireEditor } from "@/lib/require-editor";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

function excerptForProposal(segmentIds: readonly string[], segments: readonly { id: string; text: string }[]): string {
  const byId = new Map(segments.map((segment) => [segment.id, segment.text]));
  return segmentIds.slice(0, 2).flatMap((id) => byId.get(id) ? [byId.get(id)!] : []).join(" ").slice(0, 240);
}

export default async function ChapterEditorPage({ params }: PageProps) {
  const { slug } = await params;
  await requireEditor(`/editor/episodios/${slug}/capitulos`);
  const episode = getEpisodeBySlug(slug);
  if (!episode) notFound();
  const transcript = getTranscriptByEpisodeId(episode.id);
  if (!transcript) {
    return <main><h1>Editor de capítulos</h1><p>No hay transcripción disponible para este episodio.</p></main>;
  }
  const generated = generateChapterProposals(transcript);
  if (!generated.proposals.length) {
    return <main><h1>Editor de capítulos</h1><p>No se pueden generar propuestas.</p><ul>{generated.diagnostics.map((item) => <li key={item.code}>{item.message}</li>)}</ul></main>;
  }
  const excerpts = Object.fromEntries(generated.proposals.map((proposal) => [proposal.id, excerptForProposal(proposal.transcriptSegmentIds, transcript.segments)]));
  return <main className="max-w-5xl mx-auto px-6 py-12"><p className="text-sm font-semibold uppercase tracking-widest text-orange-300">Editor privado</p><h1 className="mt-3">Capítulos: {episode.title}</h1><p className="text-white/70">Propuestas locales deterministas basadas en la transcripción. No forman parte de la ficha pública.</p><ChapterProposalEditor slug={slug} transcript={transcript} initialProposals={generated.proposals} excerpts={excerpts} storageAvailable={isChapterEditorStorageAvailable()} saveAction={saveApprovedChapterProposals} /></main>;
}
