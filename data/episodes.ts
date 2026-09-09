import type { Episode } from "@/types/episode";

/**
 * Editorial seed data for the Episode entity.
 *
 * This is intentionally a small, local source while the manifest-to-web
 * integration is designed. Do not treat it as a copy of CTC Automation data.
 */
export const episodes: Episode[] = [
  {
    id: "CTC_T5E01",
    kind: "special",
    season: 5,
    episodeNumber: 1,
    slug: "especial-copa-del-96",
    title: 'Especial Cast To Cast: "Cuéntame cómo pasó... la Copa del 96"',
    // Pilot fixture: replace with the publication date from the episode
    // manifest when Automation is connected.
    date: "2026-09-09",
    description:
      "Un especial de Cast To Cast dedicado a la Copa del Rey de 1996 celebrada en Murcia, con recuerdos, contexto y voces que vivieron de cerca aquel torneo histórico.",
    thumbnail: "https://i.ytimg.com/vi/IE6ztcN8mJ4/maxresdefault.jpg",
    participants: [
      { name: "Cast To Cast Baloncesto", role: "Equipo editorial" },
    ],
    platforms: {
      youtube: "https://www.youtube.com/watch?v=IE6ztcN8mJ4",
    },
    // The text is deliberately stored separately. This technical fixture is
    // only rendered when NEXT_PUBLIC_ENABLE_DEMO_TRANSCRIPTS=true.
    transcript: {
      language: "es",
      source: "local-fixture",
      visibility: "development-only",
    },
  },
];
