import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  countUnreadCommunityReplies,
  createAuthorTopicFollow,
  formatCommunityUnreadReplyCount,
} from "../lib/community-follow.ts";

test("following a topic starts its author at the opening post", () => {
  assert.deepEqual(
    createAuthorTopicFollow("author-1", "topic-1", "2026-10-10T10:00:00.000Z"),
    {
      userId: "author-1",
      topicId: "topic-1",
      lastReadAt: "2026-10-10T10:00:00.000Z",
    },
  );
});

test("unread reply counts exclude old and own replies", () => {
  const unread = countUnreadCommunityReplies(
    "2026-10-10T10:00:00.000Z",
    [
      { authorId: "other", createdAt: "2026-10-10T09:59:59.000Z" },
      { authorId: "viewer", createdAt: "2026-10-10T10:01:00.000Z" },
      { authorId: "other", createdAt: "2026-10-10T10:02:00.000Z" },
      { authorId: "another", createdAt: "2026-10-10T10:03:00.000Z" },
    ],
    "viewer",
  );

  assert.equal(unread, 2);
  assert.equal(formatCommunityUnreadReplyCount(unread), "2 nuevas");
  assert.equal(formatCommunityUnreadReplyCount(1), "1 nueva");
});

test("follow migration makes follow, unfollow, read state, and author defaults private", async () => {
  const sql = await readFile(
    new URL("../supabase/migrations/202610100001_add_community_topic_follows.sql", import.meta.url),
    "utf8",
  );

  assert.match(sql, /create table if not exists public\.community_topic_follows/i);
  assert.match(sql, /primary key \(user_id, topic_id\)/i);
  assert.match(sql, /alter table public\.community_topic_follows enable row level security/i);
  assert.match(sql, /for select to authenticated using \(auth\.uid\(\) = user_id\)/i);
  assert.match(sql, /for insert to authenticated with check \(\s*auth\.uid\(\) = user_id/i);
  assert.match(sql, /for update to authenticated using \(auth\.uid\(\) = user_id\)/i);
  assert.match(sql, /for delete to authenticated using \(auth\.uid\(\) = user_id\)/i);
  assert.match(sql, /create trigger on_community_topic_created_follow_author/i);
  assert.match(sql, /insert into public\.community_topic_follows \(user_id, topic_id, last_read_at\)\s*values \(new\.author_id, new\.id, new\.created_at\)/i);
});
