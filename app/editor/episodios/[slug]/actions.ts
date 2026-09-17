"use server";

import { revalidatePath } from "next/cache";

import { getChaptersByEpisodeId } from "@/lib/chapters";
import { buildPublicEpisodeCandidate, approvePublicEpisodeCandidate } from "@/lib/episode-promotion";
import { persistApprovedPublicEpisodeCandidate } from "@/lib/episode-promotion-storage";
import { createPromotionPreview, findLatestApprovedPromotionArtifact, persistPromotionPreview } from "@/lib/promote-to-public";
import { getEpisodeBySlug } from "@/lib/episodes";
import { loadImportedEpisodeManifests } from "@/lib/episode-manifest-importer";
import { requireEditor } from "@/lib/require-editor";
import { getTranscriptByEpisodeId } from "@/lib/transcripts";

/** Server-side reconstruction prevents a client preview from selecting sources or bypassing validation. */
export async function generateApprovedPromotionArtifact(slug: string, approvedForPreview: boolean): Promise<{ ok: boolean; message: string }> {
  await requireEditor(`/editor/episodios/${slug}`);
  const current = getEpisodeBySlug(slug);
  if (!current) return { ok: false, message: "Episodio desconocido." };
  if (!approvedForPreview) return { ok: false, message: "Aprueba primero el candidato en esta vista previa." };
  const manifests = await loadImportedEpisodeManifests();
  const imported = manifests.find((item) => item.episode?.id === current.id && item.status === "imported");
  const candidate = buildPublicEpisodeCandidate({
    current,
    ...(imported?.episode ? { manifestEpisode: imported.episode, manifestSource: imported.source } : {}),
    transcript: getTranscriptByEpisodeId(current.id),
    chapters: getChaptersByEpisodeId(current.id),
  });
  try {
    const approved = approvePublicEpisodeCandidate(candidate);
    const saved = await persistApprovedPublicEpisodeCandidate(approved);
    if (saved.ok) {
      revalidatePath(`/editor/episodios/${slug}`);
      return { ok: true, message: `Artefacto aprobado v${String(saved.version).padStart(2, "0")} generado localmente. No se ha publicado.` };
    }
    const messages = {
      not_writable_environment: "La generación solo está disponible en desarrollo local con el editor habilitado.",
      invalid_identifier: "El identificador del episodio no es seguro para almacenamiento.",
      not_approved: "El candidato no está aprobado o sigue bloqueado.",
      write_failed: "No se pudo crear un artefacto versionado.",
    };
    return { ok: false, message: messages[saved.reason] };
  } catch {
    return { ok: false, message: "El candidato tiene bloqueos y no se puede aprobar." };
  }
}

export type PublicPromotionPreviewResult = { ok: boolean; message: string; token?: string; operation?: "insert" | "update"; fields?: ReadonlyArray<{ field: string; before?: unknown; after: unknown; changed: boolean }> };

/** The client supplies only the route slug; artifact selection and paths remain server-side. */
export async function previewPublicPromotion(slug: string): Promise<PublicPromotionPreviewResult> {
  await requireEditor(`/editor/episodios/${slug}`);
  const current = getEpisodeBySlug(slug);
  if (!current) return { ok: false, message: "Episodio desconocido." };
  const artifact = await findLatestApprovedPromotionArtifact(current.id);
  if (!artifact) return { ok: false, message: "No hay un artefacto aprobado para este episodio." };
  try {
    const preview = await createPromotionPreview(artifact);
    return { ok: true, message: "Preview generado sin modificar data/episodes.ts.", token: preview.token, operation: preview.patch.operation, fields: preview.patch.fields };
  } catch { return { ok: false, message: "No se pudo generar un preview seguro del artefacto aprobado." }; }
}

export async function applyPublicPromotion(slug: string, token: string, confirmed: boolean): Promise<{ ok: boolean; message: string }> {
  await requireEditor(`/editor/episodios/${slug}`);
  if (!confirmed) return { ok: false, message: "Confirma explícitamente la promoción antes de aplicarla." };
  try {
    const result = await persistPromotionPreview(token);
    revalidatePath(`/editor/episodios/${slug}`);
    revalidatePath("/episodios");
    return { ok: true, message: `Promoción ${result.operation === "insert" ? "insertada" : "actualizada"}. Backup local: ${result.backupFile}` };
  } catch (error) { return { ok: false, message: error instanceof Error ? error.message : "No se pudo aplicar la promoción." }; }
}
