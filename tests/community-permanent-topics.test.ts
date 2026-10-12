import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  communityRootTopicSlugs,
  communityTopics,
  getCommunityRootTopicSlug,
  isCommunityRootTopicSlug,
} from "../data/community.ts";
import { planCommunityThreadMigration } from "../lib/community-migration-plan.ts";

test("migration plan preserves authors, timestamps, original headings, and chronological order", () => {
  const result = planCommunityThreadMigration(
    [
      {
        id: "topic-a", slug: "previa-acb", space: "acb", title: "Previa ACB",
        body: "Mensaje inicial ACB", authorId: "ana", createdAt: "2026-10-01T10:00:00.000Z",
      },
      {
        id: "topic-b", slug: "post-partido-acb", space: "acb", title: "Post partido ACB",
        body: "Mensaje inicial posterior", authorId: "bea", createdAt: "2026-10-01T12:00:00.000Z",
      },
    ],
    [
      {
        id: "reply-1", topicId: "topic-a", body: "Respuesta de Carlos", authorId: "carlos",
        createdAt: "2026-10-01T11:00:00.000Z",
      },
      {
        id: "reply-2", topicId: "topic-b", body: "Respuesta de Ana", authorId: "ana",
        createdAt: "2026-10-01T12:30:00.000Z",
      },
    ],
    [],
  );

  assert.deepEqual(result.messages.map((message) => ({
    title: message.legacyTitle,
    authorId: message.authorId,
    createdAt: message.createdAt,
  })), [
    { title: "Previa ACB", authorId: "ana", createdAt: "2026-10-01T10:00:00.000Z" },
    { title: undefined, authorId: "carlos", createdAt: "2026-10-01T11:00:00.000Z" },
    { title: "Post partido ACB", authorId: "bea", createdAt: "2026-10-01T12:00:00.000Z" },
    { title: undefined, authorId: "ana", createdAt: "2026-10-01T12:30:00.000Z" },
  ]);
  assert.ok(result.messages.every((message) => message.rootSlug === communityRootTopicSlugs.acb));
});

test("merged follows deduplicate conservatively and legacy routes target their root", () => {
  const result = planCommunityThreadMigration(
    [
      {
        id: "topic-a", slug: "previa-acb", space: "acb", title: "Previa ACB",
        body: "Mensaje inicial ACB", authorId: "ana", createdAt: "2026-10-01T10:00:00.000Z",
      },
      {
        id: "topic-b", slug: "rotacion-acb", space: "acb", title: "Rotación ACB",
        body: "Otro inicio ACB", authorId: "bea", createdAt: "2026-10-01T11:00:00.000Z",
      },
    ],
    [],
    [
      { userId: "maria", topicId: "topic-a", createdAt: "2026-10-01T10:00:00.000Z", lastReadAt: "2026-10-01T10:30:00.000Z" },
      { userId: "maria", topicId: "topic-b", createdAt: "2026-10-01T11:00:00.000Z", lastReadAt: "2026-10-01T11:30:00.000Z" },
    ],
  );

  assert.deepEqual(result.follows, [{
    userId: "maria",
    topicId: communityRootTopicSlugs.acb,
    createdAt: "2026-10-01T10:00:00.000Z",
    lastReadAt: "2026-10-01T10:30:00.000Z",
  }]);
  assert.deepEqual(result.redirects, [
    { legacySlug: "previa-acb", canonicalSlug: communityRootTopicSlugs.acb },
    { legacySlug: "rotacion-acb", canonicalSlug: communityRootTopicSlugs.acb },
  ]);
});

test("only the two permanent conversations are available in the UI fallback", () => {
  assert.deepEqual(communityTopics.map(({ slug }) => slug), [
    communityRootTopicSlugs.acb,
    communityRootTopicSlugs.bcl,
  ]);
  assert.equal(getCommunityRootTopicSlug("acb"), "ucam-murcia-en-acb");
  assert.equal(isCommunityRootTopicSlug("ucam-murcia-en-bcl"), true);
  assert.equal(isCommunityRootTopicSlug("previa-acb"), false);
});

test("SQL migration is idempotent and protects the two-root model", async () => {
  const sql = await readFile(
    new URL("../supabase/migrations/202610120001_flatten_community_into_permanent_topics.sql", import.meta.url),
    "utf8",
  );

  assert.match(sql, /create table if not exists public\.community_topic_legacy_routes/i);
  assert.match(sql, /create table if not exists public\.community_topic_migrations/i);
  assert.match(sql, /on conflict \(legacy_slug\) do update/i);
  assert.match(sql, /on conflict \(legacy_topic_id\) do update/i);
  assert.match(sql, /on conflict \(id\) do nothing/i);
  assert.match(sql, /legacy_topic_title text/i);
  assert.match(sql, /legacy_message_order smallint not null default 1/i);
  assert.match(sql, /min\(follows\.last_read_at\)/i);
  assert.match(sql, /update public\.community_notifications as notification/i);
  assert.match(sql, /reply_count = \(/i);
  assert.match(sql, /last_activity_at = coalesce/i);
  assert.match(sql, /community_topics_only_permanent_conversations/i);
  assert.match(sql, /revoke insert on public\.community_topics from authenticated/i);
  assert.match(sql, /slug in \('ucam-murcia-en-acb', 'ucam-murcia-en-bcl'\)/i);
});

test("legacy routes and retired entry points redirect to canonical conversations", async () => {
  const [homePage, topicPage, acbPage, bclPage, newTopicPage] = await Promise.all([
    readFile(new URL("../app/comunidad/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/comunidad/tema/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/comunidad/acb/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/comunidad/bcl/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/comunidad/nuevo/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(homePage, /Nuevo tema|crear nuevo tema/i);
  assert.match(topicPage, /getCommunityTopicRedirectSlug/);
  assert.match(topicPage, /permanentRedirect\(`/);
  assert.match(acbPage, /permanentRedirect/);
  assert.match(bclPage, /permanentRedirect/);
  assert.match(newTopicPage, /permanentRedirect\("\/comunidad"\)/);
});
