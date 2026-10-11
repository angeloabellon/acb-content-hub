import type { CommunityMessage, CommunityTopic } from "@/data/community";
import {
  communityTopics,
  getCommunityTopic as getCommunityFixtureTopic,
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
export { getSafeCommunityPath, isCommunitySpace } from "@/lib/community-validation";

type ProfileRow =
  | { display_name: string | null; username: string | null }
  | { display_name: string | null; username: string | null }[]
  | null;

type TopicRow = {
  id: string;
  slug: string;
  space_slug: "acb" | "bcl";
  title: string;
  body: string;
  reply_count: number;
  last_activity_at: string;
  created_at: string;
  author: ProfileRow;
};

type PostRow = {
  body: string;
  created_at: string;
  author: ProfileRow;
};

type MentionProfileRow = { username: string | null };

type FollowStatusRow = {
  topic_id: string;
  unread_reply_count: number | string | null;
};

export type CommunityViewer = {
  id: string;
  email?: string;
};

function authorName(profile: ProfileRow): string {
  const value = Array.isArray(profile) ? profile[0] : profile;
  return value?.display_name?.trim() || value?.username?.trim() || "Aficionado CTC";
}

function authorUsername(profile: ProfileRow): string | undefined {
  const value = Array.isArray(profile) ? profile[0] : profile;
  return value?.username?.trim().toLowerCase() || undefined;
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
  const username = authorUsername(row.author);
  return {
    id: row.id,
    slug: row.slug,
    space: row.space_slug,
    title: row.title,
    excerpt: excerptFor(row.body),
    author,
    ...(username ? { authorUsername: username } : {}),
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

async function getMentionUsernames(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  bodies: string[],
): Promise<string[]> {
  const handles = [...new Set(bodies.flatMap(extractCommunityMentionHandles))];
  if (!handles.length) return [];

  const { data, error } = await supabase
    .from("community_profiles")
    .select("username")
    .in("username", handles);

  if (error || !data) return [];
  return (data as MentionProfileRow[])
    .flatMap((profile) => profile.username ? [profile.username.toLowerCase()] : []);
}

/** Returns a verified identity only when the Supabase integration is configured. */
export async function getCommunityViewer(): Promise<CommunityViewer | undefined> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return undefined;

  const { data, error } = await supabase.auth.getClaims();
  const subject = data?.claims?.sub;
  if (error || typeof subject !== "string" || !subject) return undefined;

  const email = data.claims.email;
  return { id: subject, ...(typeof email === "string" ? { email } : {}) };
}

export function isCommunityBackendConfigured(): boolean {
  return isSupabaseConfigured();
}

/**
 * Uses published Community rows when Supabase is available. Fixtures remain a
 * deliberate read-only fallback until the migration and environment are live.
 */
export async function listCommunityTopics(): Promise<CommunityTopic[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return communityTopics;

  try {
    const { data, error } = await supabase
      .from("community_topics")
      .select(
        "id, slug, space_slug, title, body, reply_count, last_activity_at, created_at, author:community_profiles!community_topics_author_id_fkey(display_name, username)",
      )
      .eq("is_visible", true)
      .order("last_activity_at", { ascending: false });

    if (error || !data) throw error;

    const viewer = await getCommunityViewer();
    const followStatuses = viewer
      ? await getCommunityFollowStatuses(supabase)
      : new Map<string, CommunityFollowStatus>();

    const rows = data as TopicRow[];
    const mentionUsernames = await getMentionUsernames(
      supabase,
      rows.flatMap((row) => [row.title, row.body]),
    );
    return rows.map((row) => ({
      ...mapTopic(row, followStatuses.get(row.id)),
      mentionUsernames,
    }));
  } catch {
    return communityTopics;
  }
}

export async function getCommunityTopicBySlug(
  slug: string,
): Promise<CommunityTopic | undefined> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return getCommunityFixtureTopic(slug);

  try {
    const { data: topicData, error: topicError } = await supabase
      .from("community_topics")
      .select(
        "id, slug, space_slug, title, body, reply_count, last_activity_at, created_at, author:community_profiles!community_topics_author_id_fkey(display_name, username)",
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
    const openingUsername = authorUsername(row.author);
    const openingMessage: CommunityMessage = {
      author: openingAuthor,
      ...(openingUsername ? { username: openingUsername } : {}),
      initials: initialsFor(openingAuthor),
      publishedAt: fullDateLabel(row.created_at),
      body: row.body,
    };

    const { data: postData, error: postError } = await supabase
      .from("community_posts")
      .select(
        "body, created_at, author:community_profiles!community_posts_author_id_fkey(display_name, username)",
      )
      .eq("topic_id", row.id)
      .eq("is_visible", true)
      .order("created_at", { ascending: true });

    if (postError) throw postError;
    const replies: CommunityMessage[] = (postData as PostRow[] | null ?? []).map((post) => {
      const author = authorName(post.author);
      const username = authorUsername(post.author);
      return {
        author,
        ...(username ? { username } : {}),
        initials: initialsFor(author),
        publishedAt: fullDateLabel(post.created_at),
        body: post.body,
      };
    });

    const mentionUsernames = await getMentionUsernames(
      supabase,
      [row.title, openingMessage.body, ...replies.map((reply) => reply.body)],
    );
    topic.mentionUsernames = mentionUsernames;
    openingMessage.mentionUsernames = mentionUsernames;
    replies.forEach((reply) => { reply.mentionUsernames = mentionUsernames; });

    return { ...topic, messages: [openingMessage, ...replies] };
  } catch {
    return getCommunityFixtureTopic(slug);
  }
}
