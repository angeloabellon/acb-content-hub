export type CommunityConversationKey =
  | "acb"
  | "bcl"
  | "unicaja-malaga"
  | "hozono-global-jairis";

/**
 * Presentation data for the four fixed conversations. `space_slug` remains a
 * database compatibility field, but the product deliberately exposes only
 * conversations—there is no public space or sub-topic level.
 */
export type CommunityConversation = {
  key: CommunityConversationKey;
  eyebrow: string;
  title: string;
  description: string;
  logo: {
    src: string;
    alt: string;
    width: number;
    height: number;
    className: string;
  };
  competitionLogo?: {
    src: string;
    alt: string;
    width: number;
    height: number;
    className: string;
  };
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
  conversation: CommunityConversationKey;
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

export const communityConversations: CommunityConversation[] = [
  {
    key: "acb",
    eyebrow: "Liga Endesa",
    title: "UCAM Murcia en ACB",
    description: "La conversación continua para seguir la actualidad, los partidos y el día a día del UCAM Murcia en Liga Endesa.",
    logo: { src: "/logoUCAM.png", alt: "UCAM Murcia", width: 82, height: 82, className: "h-16 w-16" },
    competitionLogo: { src: "/logoEndesa.png", alt: "Liga Endesa", width: 76, height: 36, className: "h-9" },
  },
  {
    key: "bcl",
    eyebrow: "Basketball Champions League",
    title: "UCAM Murcia en BCL",
    description: "La conversación continua para vivir las previas, análisis y noches europeas del UCAM Murcia.",
    logo: { src: "/logoUCAM.png", alt: "UCAM Murcia", width: 82, height: 82, className: "h-16 w-16" },
    competitionLogo: { src: "/logoBCL.png", alt: "Basketball Champions League", width: 118, height: 38, className: "h-8 max-w-[7.5rem]" },
  },
  {
    key: "unicaja-malaga",
    eyebrow: "Actualidad del equipo",
    title: "Unicaja Málaga",
    description: "La conversación continua para comentar la actualidad, los partidos y la temporada del Unicaja Málaga.",
    logo: { src: "/logoUnicaja.png", alt: "Unicaja Málaga", width: 82, height: 82, className: "h-16 w-16" },
  },
  {
    key: "hozono-global-jairis",
    eyebrow: "Baloncesto femenino",
    title: "Hozono Global Jairis",
    description: "La conversación continua para seguir la actualidad, los partidos y la temporada del Hozono Global Jairis.",
    logo: { src: "/logoJairis.png", alt: "Hozono Global Jairis", width: 82, height: 82, className: "h-16 w-16" },
    competitionLogo: { src: "/logoFemenina.png", alt: "Liga Femenina Endesa", width: 76, height: 36, className: "h-9" },
  },
];

export const communityRootTopicSlugs = {
  acb: "ucam-murcia-en-acb",
  bcl: "ucam-murcia-en-bcl",
  "unicaja-malaga": "unicaja-malaga",
  "hozono-global-jairis": "hozono-global-jairis",
} as const satisfies Record<CommunityConversationKey, string>;

export function isCommunityRootTopicSlug(value: string): value is typeof communityRootTopicSlugs[CommunityConversationKey] {
  return Object.values(communityRootTopicSlugs).includes(
    value as typeof communityRootTopicSlugs[CommunityConversationKey],
  );
}

export function getCommunityRootTopicSlug(conversation: CommunityConversationKey): string {
  return communityRootTopicSlugs[conversation];
}

/**
 * Read-only fallback for an unconfigured local environment. Root rows are
 * system-owned containers, so their sample state intentionally has no replies.
 */
export const communityTopics: CommunityTopic[] = communityConversations.map((conversation) => ({
  slug: getCommunityRootTopicSlug(conversation.key),
  conversation: conversation.key,
  title: conversation.title,
  excerpt: conversation.description,
  author: "Comunidad CTC",
  initials: "CTC",
  replies: 0,
  lastActivity: "Sin respuestas todavía",
  messages: [],
}));

export function getCommunityConversation(key: string) {
  return communityConversations.find((conversation) => conversation.key === key);
}

export function getCommunityTopic(slug: string) {
  return communityTopics.find((topic) => topic.slug === slug);
}
