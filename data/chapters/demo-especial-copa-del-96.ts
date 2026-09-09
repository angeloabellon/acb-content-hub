import type { Chapter } from "../../types/chapter";

/**
 * Technical UI fixture only. These labels are not editorial chapters for the
 * published episode and remain hidden unless demo transcripts are enabled.
 */
export const demoEspecialCopaDel96Chapters: readonly Chapter[] = [
  {
    id: "demo-apertura",
    episodeId: "CTC_T5E01",
    title: "Apertura de demostración",
    startSeconds: 0,
    endSeconds: 8,
    description: "Capítulo técnico vinculado al primer fragmento de prueba.",
    transcriptSegmentIds: ["demo-introduccion"],
    source: "editorial",
    version: "demo-1",
    reviewed: true,
    visibility: "development-only",
    isDemo: true,
  },
  {
    id: "demo-segmento-sin-tiempo",
    episodeId: "CTC_T5E01",
    title: "Segmento sin marca de tiempo",
    startSeconds: 8,
    description: "Comprueba que un capítulo puede referenciar texto sin timing.",
    transcriptSegmentIds: ["demo-sin-timestamp"],
    source: "editorial",
    version: "demo-1",
    reviewed: true,
    visibility: "development-only",
    isDemo: true,
  },
];
