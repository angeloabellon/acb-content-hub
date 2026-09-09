import type { Transcript } from "../../types/transcript";

/**
 * Technical UI fixture only. It is not a transcript of the published episode
 * and must remain development-only until a verified source is imported.
 */
export const demoEspecialCopaDel96Transcript: Transcript = {
  episodeId: "CTC_T5E01",
  language: "es",
  source: "fixture técnico local",
  version: "demo-1",
  visibility: "development-only",
  isDemo: true,
  segments: [
    {
      id: "demo-introduccion",
      startSeconds: 0,
      endSeconds: 8,
      speaker: "Demo técnica",
      text: "Este texto de prueba verifica la presentación de una transcripción; no corresponde al contenido del episodio.",
    },
    {
      id: "demo-sin-timestamp",
      text: "Los segmentos pueden conservarse aunque la fuente todavía no aporte marcas de tiempo ni interlocutor.",
    },
  ],
};
