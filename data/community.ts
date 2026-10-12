export type CommunitySpaceSlug = "acb" | "bcl";

export type CommunitySpace = {
  slug: CommunitySpaceSlug;
  eyebrow: string;
  title: string;
  description: string;
  detail: string;
};

/** A resolved mention retains its canonical match key but displays a friendly name. */
export type CommunityMention = {
  username: string;
  displayName: string;
};

export type CommunityMessage = {
  id?: string;
  authorId?: string;
  author: string;
  initials: string;
  publishedAt: string;
  body: string;
  /** Canonical data used only by reply controls; the UI displays displayName. */
  authorMention?: CommunityMention & { id: string };
  /** The original topic title when this message was migrated into a root thread. */
  legacyTitle?: string;
  /** Resolved mentions; unresolved text stays plain. */
  mentions?: CommunityMention[];
};

export type CommunityTopic = {
  id?: string;
  slug: string;
  space: CommunitySpaceSlug;
  title: string;
  excerpt: string;
  author: string;
  initials: string;
  replies: number;
  following?: boolean;
  unreadReplies?: number;
  mentions?: CommunityMention[];
  lastActivity: string;
  messages: CommunityMessage[];
};

export const communitySpaces: CommunitySpace[] = [
  {
    slug: "acb",
    eyebrow: "Liga Endesa",
    title: "UCAM Murcia en ACB",
    description:
      "El hilo principal para seguir la actualidad, los partidos y el día a día del UCAM Murcia en Liga Endesa.",
    detail:
      "Una conversación continua para comentar la temporada del UCAM Murcia en ACB con calma, criterio y pasión por el baloncesto.",
  },
  {
    slug: "bcl",
    eyebrow: "Basketball Champions League",
    title: "UCAM Murcia en BCL",
    description:
      "El hilo principal para vivir las previas, análisis y noches europeas del UCAM Murcia.",
    detail:
      "Una conversación continua para acompañar al UCAM Murcia en Europa, desde la previa hasta el último comentario tras el partido.",
  },
];

export const communityRootTopicSlugs = {
  acb: "ucam-murcia-en-acb",
  bcl: "ucam-murcia-en-bcl",
} as const satisfies Record<CommunitySpaceSlug, string>;

export function isCommunityRootTopicSlug(value: string): value is typeof communityRootTopicSlugs[CommunitySpaceSlug] {
  return Object.values(communityRootTopicSlugs).includes(
    value as typeof communityRootTopicSlugs[CommunitySpaceSlug],
  );
}

export function getCommunityRootTopicSlug(space: CommunitySpaceSlug): string {
  return communityRootTopicSlugs[space];
}

/**
 * These read-only fixtures mirror the permanent-thread UX when Supabase is not
 * configured. Production data is loaded from the two canonical root topics.
 */
export const communityTopics: CommunityTopic[] = [
  {
    slug: communityRootTopicSlugs.acb,
    space: "acb",
    title: "UCAM Murcia en ACB",
    excerpt: "Conversación continua sobre el UCAM Murcia en Liga Endesa.",
    author: "Comunidad CTC",
    initials: "CTC",
    replies: 3,
    lastActivity: "Hace 28 min",
    messages: [
      {
        id: "fixture-acb-3",
        legacyTitle: "La defensa como punto de partida",
        author: "Tiempo Muerto",
        initials: "TM",
        publishedAt: "Lunes, 19:03",
        body:
          "Cuando el equipo aprieta en primera línea, todo el partido cambia de tono. Esa energía es una de las cosas más reconocibles del UCAM Murcia.",
      },
      {
        id: "fixture-acb-1",
        legacyTitle: "¿Qué esperáis del próximo partido en ACB?",
        author: "Pabellón Norte",
        initials: "PN",
        publishedAt: "Hoy, 12:16",
        body:
          "Me apetece ver un partido con más ritmo desde el inicio. Si el equipo encuentra continuidad atrás, tendremos muchas opciones de competir hasta el final.",
      },
      {
        id: "fixture-acb-2",
        author: "Rojo y Universitario",
        initials: "RU",
        publishedAt: "Hoy, 12:34",
        body:
          "Estoy de acuerdo. La clave para mí estará en no regalar segundas oportunidades y en correr cuando haya rebote defensivo.",
      },
    ],
  },
  {
    slug: communityRootTopicSlugs.bcl,
    space: "bcl",
    title: "UCAM Murcia en BCL",
    excerpt: "Conversación continua sobre el UCAM Murcia en Basketball Champions League.",
    author: "Comunidad CTC",
    initials: "CTC",
    replies: 3,
    lastActivity: "Hace 1 h",
    messages: [
      {
        id: "fixture-bcl-3",
        legacyTitle: "Claves para la próxima cita de BCL",
        author: "Zona 2-3",
        initials: "Z23",
        publishedAt: "Ayer, 18:15",
        body:
          "En Europa los partidos se deciden a menudo en posesiones muy cortas. Cuidar el rebote y las pérdidas será fundamental.",
      },
      {
        id: "fixture-bcl-1",
        legacyTitle: "Una noche europea para recordar",
        author: "Viajando con el UCAM",
        initials: "VU",
        publishedAt: "Hoy, 11:22",
        body:
          "Hay noches europeas que se viven de otra manera. Desde la presentación hasta el último minuto se notó algo especial en la grada.",
      },
      {
        id: "fixture-bcl-2",
        author: "Europa en Rojo",
        initials: "ER",
        publishedAt: "Hoy, 11:48",
        body:
          "La BCL le da un contexto distinto a cada detalle. Disfrutar de estas eliminatorias también es parte del camino.",
      },
    ],
  },
];

export function getCommunitySpace(slug: string) {
  return communitySpaces.find((space) => space.slug === slug);
}

export function getCommunityTopic(slug: string) {
  return communityTopics.find((topic) => topic.slug === slug);
}
