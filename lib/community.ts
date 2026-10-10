import type { CommunityMessage, CommunityTopic } from "@/data/community";
import {
  communityTopics,
  getCommunityTopic as getCommunityFixtureTopic,
} from "@/data/community";
import {
  createSupabaseServerClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
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

export type CommunityViewer = {
  id: string;
  email?: string;
};

function authorName(profile: ProfileRow): string {
  const value = Array.isArray(profile) ? profile[0] : profile;
  return value?.display_name?.trim() || value?.username?.trim() || "Aficionado CTC";
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

function mapTopic(row: TopicRow): CommunityTopic {
  const author = authorName(row.author);
  return {
    id: row.id,
    slug: row.slug,
    space: row.space_slug,
    title: row.title,
    excerpt: excerptFor(row.body),
    author,
    initials: initialsFor(author),
    replies: row.reply_count,
    lastActivity: dateLabel(row.last_activity_at),
    messages: [],
  };
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
    return (data as TopicRow[]).map(mapTopic);
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
    const topic = mapTopic(row);
    const openingAuthor = authorName(row.author);
    const openingMessage: CommunityMessage = {
      author: openingAuthor,
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
    const replies = (postData as PostRow[] | null ?? []).map((post) => {
      const author = authorName(post.author);
      return {
        author,
        initials: initialsFor(author),
        publishedAt: fullDateLabel(post.created_at),
        body: post.body,
      };
    });

    return { ...topic, messages: [openingMessage, ...replies] };
  } catch {
    return getCommunityFixtureTopic(slug);
  }
}
