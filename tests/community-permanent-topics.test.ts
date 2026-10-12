import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  communityConversations,
  communityConversationThemes,
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
        id: "topic-a", slug: "previa-acb", conversation: "acb", title: "Previa ACB",
        body: "Mensaje inicial ACB", authorId: "ana", createdAt: "2026-10-01T10:00:00.000Z",
      },
      {
        id: "topic-b", slug: "post-partido-acb", conversation: "acb", title: "Post partido ACB",
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
        id: "topic-a", slug: "previa-acb", conversation: "acb", title: "Previa ACB",
        body: "Mensaje inicial ACB", authorId: "ana", createdAt: "2026-10-01T10:00:00.000Z",
      },
      {
        id: "topic-b", slug: "rotacion-acb", conversation: "acb", title: "Rotación ACB",
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

test("exactly three permanent conversations are available in the UI fallback", () => {
  assert.deepEqual(communityConversations.map(({ title }) => title), [
    "UCAM Murcia",
    "Unicaja Málaga",
    "Hozono Global Jairis",
  ]);
  assert.deepEqual(communityTopics.map(({ slug }) => slug), [
    communityRootTopicSlugs.acb,
    communityRootTopicSlugs["unicaja-malaga"],
    communityRootTopicSlugs["hozono-global-jairis"],
  ]);
  assert.equal(getCommunityRootTopicSlug("acb"), "ucam-murcia-en-acb");
  assert.equal(getCommunityRootTopicSlug("unicaja-malaga"), "unicaja-malaga");
  assert.equal(getCommunityRootTopicSlug("hozono-global-jairis"), "hozono-global-jairis");
  assert.equal(isCommunityRootTopicSlug("ucam-murcia-en-bcl"), false);
  assert.equal(isCommunityRootTopicSlug("unicaja-malaga"), true);
  assert.equal(isCommunityRootTopicSlug("hozono-global-jairis"), true);
  assert.equal(isCommunityRootTopicSlug("previa-acb"), false);
});

test("each permanent conversation carries its own contained CTC accent theme", () => {
  assert.match(communityConversationThemes.acb.heroSurface, /#140303/);
  assert.match(communityConversationThemes["unicaja-malaga"].heroSurface, /#03170d/);
  assert.match(communityConversationThemes["hozono-global-jairis"].heroSurface, /#211603/);
  assert.equal(communityConversations[0]?.theme, communityConversationThemes.acb);
  assert.equal(communityConversations[1]?.theme, communityConversationThemes["unicaja-malaga"]);
  assert.equal(communityConversations[2]?.theme, communityConversationThemes["hozono-global-jairis"]);
});

test("community cards pair every club with its domestic and European competitions", async () => {
  const card = await readFile(
    new URL("../components/community/CommunityConversationCard.tsx", import.meta.url),
    "utf8",
  );

  assert.deepEqual(communityConversations.map((conversation) => ({
    title: conversation.title,
    competitions: conversation.competitions.map((competition) => competition.name),
  })), [
    {
      title: "UCAM Murcia",
      competitions: ["Liga Endesa", "Basketball Champions League"],
    },
    {
      title: "Unicaja Málaga",
      competitions: ["Liga Endesa", "Basketball Champions League"],
    },
    {
      title: "Hozono Global Jairis",
      competitions: ["Liga Femenina Endesa", "EuroCup Women"],
    },
  ]);
  assert.ok(communityConversations.every((conversation) => conversation.competitions.length === 2));
  assert.doesNotMatch(JSON.stringify(communityConversations), /Actualidad del equipo|Baloncesto femenino/i);
  assert.match(card, /conversation\.competitions\.map/);
  assert.match(card, /grid grid-cols-2 gap-3 border-b border-white\/10 pb-7 max-\[359px\]:grid-cols-1/);
  assert.match(card, /my-auto pt-9/);
  assert.doesNotMatch(card, /bg-white/);
  assert.doesNotMatch(card, /conversation\.eyebrow|competitionLogo/);
});

test("UCAM keeps its technical ACB keys while both Community records use the shorter visible title", async () => {
  const sql = await readFile(
    new URL("../supabase/migrations/202610120006_rename_ucam_community_space.sql", import.meta.url),
    "utf8",
  );

  assert.equal(getCommunityRootTopicSlug("acb"), "ucam-murcia-en-acb");
  assert.match(sql, /update public\.community_spaces/i);
  assert.match(sql, /where slug = 'acb'/i);
  assert.match(sql, /update public\.community_topics/i);
  assert.match(sql, /title = 'UCAM Murcia'/i);
  assert.match(sql, /where slug = 'ucam-murcia-en-acb'/i);
  assert.doesNotMatch(sql, /alter table|delete from|insert into/i);
});

test("three-root migration removes the retired root and preserves member reply features", async () => {
  const sql = await readFile(
    new URL("../supabase/migrations/202610120004_remove_bcl_permanent_root.sql", import.meta.url),
    "utf8",
  );

  assert.match(sql, /delete from public\.community_notifications/i);
  assert.match(sql, /delete from public\.community_topic_follows/i);
  assert.match(sql, /delete from public\.community_posts/i);
  assert.match(sql, /delete from public\.community_topics/i);
  assert.match(sql, /delete from public\.community_spaces/i);
  assert.match(sql, /community_topics_only_permanent_conversations/i);
  assert.match(sql, /community_spaces_slug_check/i);
  assert.match(sql, /community_topic_legacy_routes_canonical_slug_check/i);
  assert.match(sql, /set author_id = null/i);
  assert.match(sql, /'unicaja-malaga'/i);
  assert.match(sql, /'hozono-global-jairis'/i);
  assert.match(sql, /signed in users reply in permanent community conversations/i);
  assert.match(sql, /slug in \([\s\S]*'unicaja-malaga'[\s\S]*'hozono-global-jairis'/i);
});

test("manual reset clears user-derived data but retains the three system roots", async () => {
  const sql = await readFile(
    new URL("../supabase/manual/reset_community_production.sql", import.meta.url),
    "utf8",
  );

  assert.match(sql, /__REPLACE_WITH_YES_DELETE_ALL_COMMUNITY_USERS__/);
  assert.match(sql, /delete from public\.community_notifications/i);
  assert.match(sql, /delete from public\.community_topic_follows/i);
  assert.match(sql, /delete from public\.community_posts/i);
  assert.match(sql, /delete from public\.community_username_aliases/i);
  assert.match(sql, /delete from public\.community_profiles/i);
  assert.match(sql, /delete from auth\.users/i);
  assert.match(sql, /delete from public\.community_topics\s+where slug not in/i);
  assert.match(sql, /author_id = null/i);
  assert.match(sql, /reply_count = 0/i);
  assert.match(sql, /'after' as phase, 'auth\.users'/i);
  assert.match(sql, /post_count/i);
  assert.match(sql, /follow_count/i);
  assert.match(sql, /notification_count/i);
  assert.doesNotMatch(sql, /ucam-murcia-en-bcl/i);
});

test("historical consolidation migration remains idempotent", async () => {
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
  assert.match(topicPage, /getRetiredCommunityPath/);
  assert.match(topicPage, /permanentRedirect\(`/);
  assert.match(acbPage, /permanentRedirect/);
  assert.match(bclPage, /permanentRedirect/);
  assert.match(bclPage, /permanentRedirect\("\/comunidad"\)/);
  assert.match(newTopicPage, /permanentRedirect\("\/comunidad"\)/);
  assert.match(homePage, /communityConversations/);
  assert.doesNotMatch(homePage, /communitySpaces/);
  assert.match(homePage, /El baloncesto/);
  assert.match(homePage, /se habla aquí/);
  assert.match(homePage, /competición nacional y europea/);
  assert.match(homePage, /logoUCAM\.png/);
  assert.match(homePage, /logoUnicaja\.png/);
  assert.match(homePage, /logoJairis\.png/);
  assert.doesNotMatch(homePage, />\s*UCAM\s*<\/span>/);
  assert.doesNotMatch(homePage, />\s*Unicaja\s*<\/span>/);
  assert.doesNotMatch(homePage, />\s*Jairis\s*<\/span>/);
});
