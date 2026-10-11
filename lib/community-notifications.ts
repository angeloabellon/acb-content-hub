import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CommunityViewer } from "@/lib/community";

type ProfileRow =
  | { display_name: string | null; username: string | null }
  | { display_name: string | null; username: string | null }[]
  | null;

type TopicRow =
  | { id: string; slug: string; title: string }
  | { id: string; slug: string; title: string }[]
  | null;

type NotificationRow = {
  id: string;
  notification_type: "mention" | "reply";
  created_at: string;
  read_at: string | null;
  actor: ProfileRow;
  topic: TopicRow;
};

export type CommunityNotification = {
  id: string;
  type: "mention" | "reply";
  createdAt: string;
  readAt: string | null;
  actorName: string;
  actorUsername?: string;
  topicId: string;
  topicSlug: string;
  topicTitle: string;
};

export type CommunityNotificationSummary = {
  notifications: CommunityNotification[];
  unreadCount: number;
};

function single<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function profileName(profile: ProfileRow): string {
  const value = single(profile);
  return value?.display_name?.trim() || value?.username?.trim() || "Un miembro de la Comunidad";
}

/** Gets only the current viewer's compact notification feed; RLS remains the final guard. */
export async function getCommunityNotificationSummary(
  viewer?: CommunityViewer,
): Promise<CommunityNotificationSummary> {
  if (!viewer) return { notifications: [], unreadCount: 0 };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { notifications: [], unreadCount: 0 };

  const [notificationsResult, unreadResult] = await Promise.all([
    supabase
      .from("community_notifications")
      .select("id, notification_type, created_at, read_at, actor:community_profiles!community_notifications_actor_id_fkey(display_name, username), topic:community_topics!community_notifications_topic_id_fkey(id, slug, title)")
      .eq("recipient_id", viewer.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("community_notifications")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", viewer.id)
      .is("read_at", null),
  ]);

  if (notificationsResult.error) return { notifications: [], unreadCount: 0 };

  const notifications = ((notificationsResult.data ?? []) as NotificationRow[])
    .flatMap((row) => {
      const topic = single(row.topic);
      if (!topic) return [];
      const actor = single(row.actor);
      return [{
        id: row.id,
        type: row.notification_type,
        createdAt: row.created_at,
        readAt: row.read_at,
        actorName: profileName(row.actor),
        ...(actor?.username ? { actorUsername: actor.username } : {}),
        topicId: topic.id,
        topicSlug: topic.slug,
        topicTitle: topic.title,
      }];
    });

  return {
    notifications,
    unreadCount: unreadResult.error ? 0 : unreadResult.count ?? 0,
  };
}
