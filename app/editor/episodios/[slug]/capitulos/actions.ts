"use server";

import { getChapterEditorPreview } from "@/lib/chapter-editor";
import { persistApprovedChapters } from "@/lib/chapter-editor-storage";
import { getEpisodeBySlug } from "@/lib/episodes";
import { getTranscriptByEpisodeId } from "@/lib/transcripts";
import type { ChapterProposal } from "@/types/chapter-proposal";
import { requireEditor } from "@/lib/require-editor";

export type SaveChapterEditorResult = { ok: boolean; message: string; conflict?: boolean };

export async function saveApprovedChapterProposals(
  slug: string,
  proposals: readonly ChapterProposal[],
  allowVersionedFile = false,
): Promise<SaveChapterEditorResult> {
  await requireEditor(`/editor/episodios/${slug}/capitulos`);
  const episode = getEpisodeBySlug(slug);
  if (!episode) return { ok: false, message: "Episodio desconocido." };
  const transcript = getTranscriptByEpisodeId(episode.id);
  if (!transcript) return { ok: false, message: "No hay transcripción disponible." };
  const preview = getChapterEditorPreview(proposals, transcript);
  if (preview.diagnostics.length || preview.chapterDiagnostics.length || !preview.chapters.length) {
    return { ok: false, message: "Los capítulos aprobados no superan la validación." };
  }
  const saved = await persistApprovedChapters({ episodeId: episode.id, slug, chapters: preview.chapters, transcript }, { allowVersionedFile });
  if (saved.ok) return { ok: true, message: "Capítulos guardados localmente. No se han publicado." };
  const messages = {
    not_writable_environment: "El guardado solo está disponible en desarrollo local con el almacenamiento de desarrollo habilitado.",
    invalid_identifier: "Identificador de episodio no válido.",
    invalid_chapters: "Los capítulos no superan la validación.",
    conflict: "Ya existe un archivo para este episodio; no se ha sobrescrito.",
    write_failed: "No se pudo escribir el archivo local.",
  };
  return { ok: false, message: messages[saved.reason], ...(saved.reason === "conflict" ? { conflict: true } : {}) };
}
