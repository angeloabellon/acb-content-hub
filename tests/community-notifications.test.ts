import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  extractCommunityMentionHandles,
  formatCommunityMentionText,
  tokenizeCommunityMentions,
} from "../lib/community-mentions.ts";
import {
  countUnreadCommunityNotifications,
  markAllCommunityNotificationsReadInState,
  markCommunityNotificationReadInState,
} from "../lib/community-notification-state.ts";

test("community mentions accept only complete public handles and ignore email fragments", () => {
  assert.deepEqual(
    extractCommunityMentionHandles("Hola @Ana_23, @ana_23 otra vez; escribe a hola@ctc.es y no uses @ab."),
    ["ana_23"],
  );
  assert.deepEqual(
    tokenizeCommunityMentions("@Ana_23, ¿lo ves?").map((token) => token.value),
    ["@Ana_23", ", ¿lo ves?"],
  );
});

test("resolved mentions show the friendly profile name instead of a canonical handle", () => {
  const rendered = formatCommunityMentionText(
    "Gracias @aficionado-5be79f por el análisis.",
    [{ username: "aficionado-5be79f", displayName: "angel.otalora" }],
  );

  assert.equal(rendered, "Gracias @angel.otalora por el análisis.");
  assert.doesNotMatch(rendered, /aficionado-5be79f/);
});

test("notification read state supports individual and bulk marking", () => {
  const notifications = [
    { id: "one", readAt: null },
    { id: "two", readAt: "2026-10-11T10:00:00.000Z" },
    { id: "three", readAt: null },
  ];
  const timestamp = "2026-10-11T11:00:00.000Z";

  assert.equal(countUnreadCommunityNotifications(notifications), 2);
  const individuallyRead = markCommunityNotificationReadInState(notifications, "one", timestamp);
  assert.equal(countUnreadCommunityNotifications(individuallyRead), 1);
  assert.equal(individuallyRead[0].readAt, timestamp);

  const allRead = markAllCommunityNotificationsReadInState(individuallyRead, timestamp);
  assert.equal(countUnreadCommunityNotifications(allRead), 0);
  assert.equal(allRead[1].readAt, "2026-10-11T10:00:00.000Z");
});

test("notification migration keeps notifications private and makes event inserts idempotent", async () => {
  const sql = await readFile(
    new URL("../supabase/migrations/202610110001_add_community_notifications.sql", import.meta.url),
    "utf8",
  );

  assert.match(sql, /create table if not exists public\.community_notifications/i);
  assert.match(sql, /unique \(recipient_id, source_key\)/i);
  assert.match(sql, /alter table public\.community_notifications enable row level security/i);
  assert.match(sql, /grant select, delete on public\.community_notifications to authenticated/i);
  assert.match(sql, /grant update \(read_at\) on public\.community_notifications to authenticated/i);
  assert.match(sql, /for select to authenticated using \(auth\.uid\(\) = recipient_id\)/i);
  assert.match(sql, /for update to authenticated using \(auth\.uid\(\) = recipient_id\)/i);
  assert.match(sql, /for delete to authenticated using \(auth\.uid\(\) = recipient_id\)/i);
  assert.match(sql, /on conflict \(recipient_id, source_key\) do nothing/i);
  assert.match(sql, /'mention'/i);
  assert.match(sql, /'reply'/i);
  assert.match(sql, /create or replace function public\.community_default_username/i);
  assert.match(sql, /update public\.community_profiles\s+set username/i);
});

test("notification component keeps an explicit mobile-menu variant", async () => {
  const component = await readFile(
    new URL("../components/community/CommunityNotifications.tsx", import.meta.url),
    "utf8",
  );
  const styles = await readFile(
    new URL("../components/Header.css", import.meta.url),
    "utf8",
  );

  assert.match(component, /variant === "mobile-menu"/);
  assert.match(styles, /community-notifications--mobile-menu/);
  assert.match(styles, /@media \(max-width: 1150px\)/);
});

test("community surfaces do not render canonical usernames", async () => {
  const [notifications, topicPage, messageBody] = await Promise.all([
    readFile(new URL("../components/community/CommunityNotifications.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/comunidad/tema/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/community/CommunityMessageBody.tsx", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(notifications, /actorUsername/);
  assert.doesNotMatch(topicPage, /message\.username|authorUsername/);
  assert.doesNotMatch(messageBody, /username\s*=/);
});
