import {
  getCommunityRootTopicSlug,
  type CommunitySpaceSlug,
} from "../data/community.ts";

export type LegacyCommunityTopic = {
  id: string;
  slug: string;
  space: CommunitySpaceSlug;
  title: string;
  body: string;
  authorId: string;
  createdAt: string;
};

export type LegacyCommunityPost = {
  id: string;
  topicId: string;
  body: string;
  authorId: string;
  createdAt: string;
};

export type LegacyCommunityFollow = {
  userId: string;
  topicId: string;
  createdAt: string;
  lastReadAt: string;
};

export type PlannedCommunityMessage = {
  rootSlug: string;
  authorId: string;
  createdAt: string;
  body: string;
  legacyTitle?: string;
  order: 0 | 1;
  id: string;
};

/**
 * A small in-memory mirror of the SQL migration, used to verify its important
 * lossless invariants without requiring a production database in unit tests.
 */
export function planCommunityThreadMigration(
  topics: LegacyCommunityTopic[],
  posts: LegacyCommunityPost[],
  follows: LegacyCommunityFollow[],
) {
  const topicById = new Map(topics.map((topic) => [topic.id, topic]));
  const rootForTopic = (topicId: string) => {
    const topic = topicById.get(topicId);
    return topic ? getCommunityRootTopicSlug(topic.space) : undefined;
  };

  const messages: PlannedCommunityMessage[] = [
    ...topics.map((topic) => ({
      rootSlug: getCommunityRootTopicSlug(topic.space),
      authorId: topic.authorId,
      createdAt: topic.createdAt,
      body: topic.body,
      legacyTitle: topic.title,
      order: 0 as const,
      id: `opening:${topic.id}`,
    })),
    ...posts.flatMap((post) => {
      const rootSlug = rootForTopic(post.topicId);
      return rootSlug ? [{
        rootSlug,
        authorId: post.authorId,
        createdAt: post.createdAt,
        body: post.body,
        order: 1 as const,
        id: post.id,
      }] : [];
    }),
  ].sort((left, right) => (
    left.createdAt.localeCompare(right.createdAt)
    || left.order - right.order
    || left.id.localeCompare(right.id)
  ));

  const mergedFollows = new Map<string, LegacyCommunityFollow>();
  for (const follow of follows) {
    const rootSlug = rootForTopic(follow.topicId);
    if (!rootSlug) continue;
    const key = `${follow.userId}:${rootSlug}`;
    const existing = mergedFollows.get(key);
    if (!existing) {
      mergedFollows.set(key, { ...follow, topicId: rootSlug });
      continue;
    }
    mergedFollows.set(key, {
      userId: follow.userId,
      topicId: rootSlug,
      createdAt: existing.createdAt < follow.createdAt ? existing.createdAt : follow.createdAt,
      // The earliest state is intentionally retained so merging cannot hide a
      // reply that was unread in any of the legacy conversations.
      lastReadAt: existing.lastReadAt < follow.lastReadAt ? existing.lastReadAt : follow.lastReadAt,
    });
  }

  return {
    messages,
    follows: [...mergedFollows.values()],
    redirects: topics.map((topic) => ({
      legacySlug: topic.slug,
      canonicalSlug: getCommunityRootTopicSlug(topic.space),
    })),
  };
}
