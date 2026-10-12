export type CommunityConversationKey =
  | "acb"
  | "unicaja-malaga"
  | "hozono-global-jairis";

/**
 * Visual tokens keep every club page in the Cast To Cast visual system while
 * allowing its own colour to carry the conversation identity.
 */
export type CommunityConversationTheme = {
  heroSurface: string;
  heroGlow: string;
  cardSurface: string;
  cardGlow: string;
  competitionText: string;
  accentText: string;
  groupHoverText: string;
  hoverText: string;
  accentBorder: string;
  accentBadge: string;
  avatar: string;
  primaryButton: string;
  secondaryButton: string;
  focusRing: string;
  logoShadow: string;
};

export const communityConversationThemes = {
  acb: {
    heroSurface: "border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] shadow-[0_10px_40px_rgba(122,12,12,0.22)]",
    heroGlow: "bg-red-600/15",
    cardSurface: "border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] shadow-[0_10px_40px_rgba(122,12,12,0.14)]",
    cardGlow: "bg-red-800/15",
    competitionText: "text-red-100",
    accentText: "text-orange-300",
    groupHoverText: "group-hover:text-orange-300",
    hoverText: "hover:text-orange-300",
    accentBorder: "border-red-900/40",
    accentBadge: "border-orange-400/35 bg-orange-300/10 text-orange-200",
    avatar: "border-red-700/40 bg-red-950/50 text-red-100",
    primaryButton: "border-red-900/40 bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 hover:text-orange-300",
    secondaryButton: "border-red-900/40 bg-white/[0.06] hover:border-orange-400/40 hover:text-orange-300",
    focusRing: "focus:border-orange-400/60 focus:ring-orange-300/60",
    logoShadow: "drop-shadow-[0_12px_20px_rgba(224,19,16,0.3)]",
  },
  "unicaja-malaga": {
    heroSurface: "border-emerald-900/35 bg-gradient-to-br from-[#03170d] via-black to-[#062315] shadow-[0_10px_40px_rgba(5,98,61,0.22)]",
    heroGlow: "bg-emerald-500/15",
    cardSurface: "border-emerald-900/35 bg-gradient-to-br from-[#03170d] via-black to-[#062315] shadow-[0_10px_40px_rgba(5,98,61,0.14)]",
    cardGlow: "bg-emerald-700/15",
    competitionText: "text-emerald-50",
    accentText: "text-emerald-300",
    groupHoverText: "group-hover:text-emerald-300",
    hoverText: "hover:text-emerald-300",
    accentBorder: "border-emerald-800/45",
    accentBadge: "border-emerald-300/35 bg-emerald-300/10 text-emerald-100",
    avatar: "border-emerald-600/40 bg-emerald-950/50 text-emerald-100",
    primaryButton: "border-emerald-800/45 bg-gradient-to-r from-[#075c37]/85 to-[#16a36d]/80 hover:text-emerald-50",
    secondaryButton: "border-emerald-800/45 bg-white/[0.06] hover:border-emerald-300/50 hover:text-emerald-200",
    focusRing: "focus:border-emerald-300/60 focus:ring-emerald-300/60",
    logoShadow: "drop-shadow-[0_12px_20px_rgba(16,185,129,0.3)]",
  },
  "hozono-global-jairis": {
    heroSurface: "border-amber-800/40 bg-gradient-to-br from-[#211603] via-black to-[#2a1b03] shadow-[0_10px_40px_rgba(146,94,8,0.22)]",
    heroGlow: "bg-amber-300/15",
    cardSurface: "border-amber-800/40 bg-gradient-to-br from-[#211603] via-black to-[#2a1b03] shadow-[0_10px_40px_rgba(146,94,8,0.14)]",
    cardGlow: "bg-amber-500/15",
    competitionText: "text-amber-50",
    accentText: "text-amber-200",
    groupHoverText: "group-hover:text-amber-200",
    hoverText: "hover:text-amber-200",
    accentBorder: "border-amber-800/45",
    accentBadge: "border-amber-300/40 bg-amber-300/10 text-amber-100",
    avatar: "border-amber-500/40 bg-amber-950/45 text-amber-100",
    primaryButton: "border-amber-700/50 bg-gradient-to-r from-[#8a5a08]/85 to-[#d99b1c]/80 hover:text-amber-50",
    secondaryButton: "border-amber-800/45 bg-white/[0.06] hover:border-amber-300/55 hover:text-amber-100",
    focusRing: "focus:border-amber-200/65 focus:ring-amber-200/65",
    logoShadow: "drop-shadow-[0_12px_20px_rgba(251,191,36,0.3)]",
  },
} as const satisfies Record<CommunityConversationKey, CommunityConversationTheme>;

export const defaultCommunityConversationTheme = communityConversationThemes.acb;

/**
 * Presentation data for the three fixed conversations. `space_slug` remains a
 * database compatibility field, but the product deliberately exposes only
 * conversations—there is no public space or sub-topic level.
 */
export type CommunityConversation = {
  key: CommunityConversationKey;
  title: string;
  description: string;
  theme: CommunityConversationTheme;
  logo: {
    src: string;
    alt: string;
    width: number;
    height: number;
    className: string;
  };
  competitions: {
    name: string;
    src: string;
    alt: string;
    width: number;
    height: number;
  }[];
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
    title: "UCAM Murcia",
    description: "Un punto de encuentro para seguir la actualidad, los partidos y el día a día del UCAM Murcia.",
    theme: communityConversationThemes.acb,
    logo: { src: "/logoUCAM.png", alt: "UCAM Murcia", width: 82, height: 82, className: "h-16 w-16" },
    competitions: [
      { name: "Liga Endesa", src: "/logoEndesa.png", alt: "Logotipo de Liga Endesa", width: 160, height: 92 },
      { name: "Basketball Champions League", src: "/logoBCL.png", alt: "Logotipo de Basketball Champions League", width: 2048, height: 666 },
    ],
  },
  {
    key: "unicaja-malaga",
    title: "Unicaja Málaga",
    description: "Comparte análisis, sensaciones y todo lo que deje la temporada del Unicaja Málaga.",
    theme: communityConversationThemes["unicaja-malaga"],
    logo: { src: "/logoUnicaja.png", alt: "Unicaja Málaga", width: 82, height: 82, className: "h-16 w-16" },
    competitions: [
      { name: "Liga Endesa", src: "/logoEndesa.png", alt: "Logotipo de Liga Endesa", width: 160, height: 92 },
      { name: "Basketball Champions League", src: "/logoBCL.png", alt: "Logotipo de Basketball Champions League", width: 2048, height: 666 },
    ],
  },
  {
    key: "hozono-global-jairis",
    title: "Hozono Global Jairis",
    description: "Toda la actualidad del Hozono Global Jairis: partidos, protagonistas y el pulso de la temporada.",
    theme: communityConversationThemes["hozono-global-jairis"],
    logo: { src: "/logoJairis.png", alt: "Hozono Global Jairis", width: 82, height: 82, className: "h-16 w-16" },
    competitions: [
      { name: "Liga Femenina Endesa", src: "/logoFemenina.png", alt: "Logotipo de Liga Femenina Endesa", width: 192, height: 128 },
      { name: "EuroCup Women", src: "/logoEuroCupWomen.png", alt: "Logotipo de EuroCup Women", width: 1726, height: 778 },
    ],
  },
];

export const communityRootTopicSlugs = {
  acb: "ucam-murcia-en-acb",
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
