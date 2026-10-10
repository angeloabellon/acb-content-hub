export type CommunityFollowStatus = {
  isFollowing: boolean;
  unreadReplies: number;
};

type CommunityReplyForReadStatus = {
  authorId: string;
  createdAt: string;
};

/**
 * Counts only replies posted after the viewer last read the followed topic.
 * A viewer's own reply is already known to them, so it is never a new reply.
 */
export function countUnreadCommunityReplies(
  lastReadAt: string | null,
  replies: CommunityReplyForReadStatus[],
  viewerId: string,
): number {
  if (!lastReadAt) return 0;

  const lastReadTime = Date.parse(lastReadAt);
  if (Number.isNaN(lastReadTime)) return 0;

  return replies.filter((reply) => (
    reply.authorId !== viewerId
    && Date.parse(reply.createdAt) > lastReadTime
  )).length;
}

export function formatCommunityUnreadReplyCount(count: number): string {
  const safeCount = Math.max(0, Math.floor(count));
  return `${safeCount} ${safeCount === 1 ? "nueva" : "nuevas"}`;
}

/** The initial state used when a topic author is followed automatically. */
export function createAuthorTopicFollow(
  userId: string,
  topicId: string,
  createdAt: string,
) {
  return { userId, topicId, lastReadAt: createdAt };
}
