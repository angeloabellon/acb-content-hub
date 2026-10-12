import type {
  CommunityMention,
  CommunityMessage,
  CommunityTopic,
  CommunityConversationKey,
} from "@/data/community";
import {
  communityTopics,
  communityRootTopicSlugs,
  getCommunityTopic as getCommunityFixtureTopic,
  isCommunityRootTopicSlug,
} from "@/data/community";
import {
  createSupabaseServerClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import type { CommunityFollowStatus } from "@/lib/community-follow";
import { extractCommunityMentionHandles } from "@/lib/community-mentions";
export {
  getCommunityViewerIdentity,
  type CommunityViewerIdentity,
} from "@/lib/community-viewer";
export {
  getRetiredCommunityPath,
  getSafeCommunityPath,
  isCommunityConversationKey,
} from "@/lib/community-validation";

type ProfileRow =
  | { id: string; display_name: string | null; username: string | null }
  | { id: string; display_name: string | null; username: string | null }[]
  | null;

type TopicRow = {
  id: string;
  slug: string;
  space_slug: CommunityConversationKey;
  title: string;
  body: string;
  reply_count: number;
  last_activity_at: string;
  created_at: string;
  author: ProfileRow;
};

type PostRow = {
  id: string;
  body: string;
  legacy_topic_title: string | null;
  legacy_message_order: number;
  created_at: string;
  author: ProfileRow;
};

type MentionProfileRow = {
  username: string | null;
  display_name: string | null;
};

type MentionAliasRow = {
  username: string;
  profile: MentionProfileRow | MentionProfileRow[] | null;
};

type FollowStatusRow = {
  topic_id: string;
  unread_reply_count: number | string | null;
};

export type CommunityViewer = {
  id: string;
  username?: string;
  displayName?: string;
  email?: string;
};

/** Public profile data used by the composer. Canonical usernames stay internal. */
export type CommunityMentionableProfile = {
  id: string;
  username: string;
  displayName: string;
};

function firstProfile(profile: ProfileRow) {
  return Array.isArray(profile) ? profile[0] : profile;
}

function authorName(profile: ProfileRow): string {
  const value = firstProfile(profile);
  return value?.display_name?.trim() || "Aficionado CTC";
}

function authorMention(profile: ProfileRow): CommunityMentionableProfile | undefined {
  const value = firstProfile(profile);
  const username = value?.username?.trim().toLowerCase();
  if (!value?.id || !username) return undefined;
  return {
    id: value.id,
    username,
    displayName: value.display_name?.trim() || "Miembro de la Comunidad",
  };
}

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "CTC";
}

function excerptFor(body: string): string {
  const compact = body.replace(/\s+/g, " ").trim();
  return compact.length > 180 ? `${compact.slice(0, 177)}…` : compact;
}

function dateLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "Reciente";

  const difference = Date.now() - date.valueOf();
  const minutes = Math.max(0, Math.floor(difference / 60_000));
  if (minutes < 60) return `Hace ${Math.max(1, minutes)} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Hace ${days} días`;
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(date);
}

function fullDateLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "Recientemente";
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function mapTopic(
  row: TopicRow,
  followStatus?: CommunityFollowStatus,
): CommunityTopic {
  const author = authorName(row.author);
  return {
    id: row.id,
    slug: row.slug,
    conversation: row.space_slug,
    title: row.title,
    excerpt: excerptFor(row.body),
    author,
    initials: initialsFor(author),
    replies: row.reply_count,
    ...(followStatus?.isFollowing
      ? {
        following: true,
        unreadReplies: followStatus.unreadReplies,
      }
      : {}),
    lastActivity: dateLabel(row.last_activity_at),
    messages: [],
  };
}

async function getCommunityFollowStatuses(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
): Promise<Map<string, CommunityFollowStatus>> {
  const { data, error } = await supabase.rpc("community_topic_follow_statuses");
  if (error || !data) return new Map();

  return new Map(
    (data as FollowStatusRow[]).map((row) => [
      row.topic_id,
      {
        isFollowing: true,
        unreadReplies: Math.max(0, Number(row.unread_reply_count) || 0),
      },
    ]),
  );
}

async function getCommunityMentions(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  bodies: string[],
): Promise<CommunityMention[]> {
  const handles = [...new Set(bodies.flatMap(extractCommunityMentionHandles))];
  if (!handles.length) return [];

  const [profilesResult, aliasesResult] = await Promise.all([
    supabase
      .from("community_profiles")
      .select("username, display_name")
      .in("username", handles),
    supabase
      .from("community_username_aliases")
      .select("username, profile:community_profiles!community_username_aliases_profile_id_fkey(username, display_name)")
      .in("username", handles),
  ]);

  const mentions = new Map<string, CommunityMention>();
  if (!profilesResult.error && profilesResult.data) {
    for (const profile of profilesResult.data as MentionProfileRow[]) {
      if (!profile.username) continue;
      mentions.set(profile.username.toLowerCase(), {
        username: profile.username.toLowerCase(),
        displayName: profile.display_name?.trim() || "Miembro de la Comunidad",
      });
    }
  }
  if (!aliasesResult.error && aliasesResult.data) {
    for (const alias of aliasesResult.data as MentionAliasRow[]) {
      const profile = Array.isArray(alias.profile) ? alias.profile[0] : alias.profile;
      if (!profile || !alias.username) continue;
      mentions.set(alias.username.toLowerCase(), {
        username: alias.username.toLowerCase(),
        displayName: profile.display_name?.trim() || "Miembro de la Comunidad",
      });
    }
  }

  return [...mentions.values()];
}

/** Lists a bounded set of public names for local, incremental composer search. */
export async function listCommunityMentionableProfiles(): Promise<CommunityMentionableProfile[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("community_profiles")
      .select("id, username, display_name")
      .not("username", "is", null)
      .order("display_name", { ascending: true })
      .limit(100);
    if (error || !data) return [];

    return (data as Array<{ id: string; username: string | null; display_name: string | null }>)
      .flatMap((profile) => {
        const username = profile.username?.trim().toLowerCase();
        if (!username) return [];
        return [{
          id: profile.id,
          username,
          displayName: profile.display_name?.trim() || "Miembro de la Comunidad",
        }];
      });
  } catch {
    return [];
  }
}

/** Returns a verified identity only when the Supabase integration is configured. */
export async function getCommunityViewer(): Promise<CommunityViewer | undefined> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return undefined;

  const { data, error } = await supabase.auth.getClaims();
  const subject = data?.claims?.sub;
  if (error || typeof subject !== "string" || !subject) return undefined;

  const { data: profile } = await supabase
    .from("community_profiles")
    .select("username, display_name")
    .eq("id", subject)
    .maybeSingle();
  const username = profile?.username?.trim();
  const displayName = profile?.display_name?.trim();
  const email = data.claims.email;

  return {
    id: subject,
    ...(username ? { username } : {}),
    ...(displayName ? { displayName } : {}),
    // This fallback only supports a profile that was just created but has not
    // become visible yet; normal UI uses the public profile name above.
    ...(!username && !displayName && typeof email === "string" ? { email } : {}),
  };
}

export function isCommunityBackendConfigured(): boolean {
  return isSupabaseConfigured();
}

/**
 * Returns the three permanent conversations in their deliberate card order. Fixtures
 * remain a deliberate read-only fallback until the migration is live.
 */
export async function listCommunityRootTopics(): Promise<CommunityTopic[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return communityTopics;

  try {
    const { data, error } = await supabase
      .from("community_topics")
      .select(
        "id, slug, space_slug, title, body, reply_count, last_activity_at, created_at, author:community_profiles!community_topics_author_id_fkey(id, display_name, username)",
      )
      .eq("is_visible", true)
      .in("slug", Object.values(communityRootTopicSlugs));

    if (error || !data) throw error;

    const viewer = await getCommunityViewer();
    const followStatuses = viewer
      ? await getCommunityFollowStatuses(supabase)
      : new Map<string, CommunityFollowStatus>();

    const rows = data as TopicRow[];
    const mentions = await getCommunityMentions(
      supabase,
      rows.flatMap((row) => [row.title, row.body]),
    );
    const topics = rows.map((row) => ({
      ...mapTopic(row, followStatuses.get(row.id)),
      mentions,
    }));
    const orderedTopics: CommunityTopic[] = [];
    for (const slug of Object.values(communityRootTopicSlugs)) {
      const topic = topics.find((candidate) => candidate.slug === slug);
      if (topic) orderedTopics.push(topic);
    }
    return orderedTopics;
  } catch {
    return communityTopics;
  }
}

/** Resolves a legacy topic URL before rendering its canonical root thread. */
export async function getCommunityTopicRedirectSlug(
  slug: string,
): Promise<string | undefined> {
  if (isCommunityRootTopicSlug(slug)) return undefined;

  const supabase = await createSupabaseServerClient();
  if (!supabase) return undefined;

  try {
    const { data, error } = await supabase
      .from("community_topic_legacy_routes")
      .select("canonical_slug")
      .eq("legacy_slug", slug)
      .maybeSingle();

    if (error || !data || !isCommunityRootTopicSlug(data.canonical_slug)) return undefined;
    return data.canonical_slug;
  } catch {
    return undefined;
  }
}

export async function getCommunityTopicBySlug(
  slug: string,
): Promise<CommunityTopic | undefined> {
  if (!isCommunityRootTopicSlug(slug)) return undefined;

  const supabase = await createSupabaseServerClient();
  if (!supabase) return getCommunityFixtureTopic(slug);

  try {
    const { data: topicData, error: topicError } = await supabase
      .from("community_topics")
      .select(
        "id, slug, space_slug, title, body, reply_count, last_activity_at, created_at, author:community_profiles!community_topics_author_id_fkey(id, display_name, username)",
      )
      .eq("slug", slug)
      .eq("is_visible", true)
      .maybeSingle();

    if (topicError || !topicData) return getCommunityFixtureTopic(slug);

    const row = topicData as TopicRow;
    const viewer = await getCommunityViewer();
    const followStatuses = viewer
      ? await getCommunityFollowStatuses(supabase)
      : new Map<string, CommunityFollowStatus>();
    const topic = mapTopic(row, followStatuses.get(row.id));
    const openingAuthor = authorName(row.author);
    const openingMessage: CommunityMessage = {
      id: row.id,
      authorId: firstProfile(row.author)?.id,
      author: openingAuthor,
      initials: initialsFor(openingAuthor),
      publishedAt: fullDateLabel(row.created_at),
      body: row.body,
      authorMention: authorMention(row.author),
    };

    const { data: postData, error: postError } = await supabase
      .from("community_posts")
      .select(
        "id, body, legacy_topic_title, legacy_message_order, created_at, author:community_profiles!community_posts_author_id_fkey(id, display_name, username)",
      )
      .eq("topic_id", row.id)
      .eq("is_visible", true)
      .order("created_at", { ascending: true })
      .order("legacy_message_order", { ascending: true })
      .order("id", { ascending: true });

    if (postError) throw postError;
    const replies: CommunityMessage[] = (postData as PostRow[] | null ?? []).map((post) => {
      const author = authorName(post.author);
      return {
        id: post.id,
        authorId: firstProfile(post.author)?.id,
        author,
        initials: initialsFor(author),
        publishedAt: fullDateLabel(post.created_at),
        body: post.body,
        authorMention: authorMention(post.author),
        ...(post.legacy_topic_title ? { legacyTitle: post.legacy_topic_title } : {}),
      };
    });

    const mentions = await getCommunityMentions(
      supabase,
      [
        row.title,
        openingMessage.body,
        ...replies.flatMap((reply) => [reply.legacyTitle ?? "", reply.body]),
      ],
    );
    topic.mentions = mentions;
    openingMessage.mentions = mentions;
    replies.forEach((reply) => { reply.mentions = mentions; });

    return {
      ...topic,
      // The canonical row is a container for the permanent conversation. Its
      // generated body is intentionally not a faux member message.
      messages: isCommunityRootTopicSlug(row.slug) ? replies : [openingMessage, ...replies],
    };
  } catch {
    return getCommunityFixtureTopic(slug);
  }
}
