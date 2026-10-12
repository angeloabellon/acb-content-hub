import assert from "node:assert/strict";
import test from "node:test";

import {
  getRetiredCommunityPath,
  getSafeCommunityPath,
  isCommunityConversationKey,
} from "../lib/community-validation.ts";
import {
  COMMUNITY_TIME_ZONE,
  formatCommunityMessageDate,
  formatCommunityReplyCount,
  formatCommunityShortDate,
} from "../lib/community-format.ts";
import {
  getSupabasePublicConfig,
  isSupabaseConfigured,
} from "../lib/supabase/config.ts";

test("community conversation keys accept exactly the three permanent conversations", () => {
  assert.equal(isCommunityConversationKey("acb"), true);
  assert.equal(isCommunityConversationKey("unicaja-malaga"), true);
  assert.equal(isCommunityConversationKey("hozono-global-jairis"), true);
  assert.equal(isCommunityConversationKey("bcl"), false);
  assert.equal(isCommunityConversationKey("other"), false);
});

test("retired Community topic URLs return to the Community landing page", () => {
  assert.equal(getRetiredCommunityPath("ucam-murcia-en-bcl"), "/comunidad");
  assert.equal(getRetiredCommunityPath("ucam-murcia-en-acb"), undefined);
});

test("community redirect targets remain inside the community", () => {
  assert.equal(getSafeCommunityPath("/comunidad/nuevo"), "/comunidad/nuevo");
  assert.equal(getSafeCommunityPath("https://example.com"), "/comunidad");
  assert.equal(getSafeCommunityPath("//example.com"), "/comunidad");
});

test("community reply counts use the singular only for one reply", () => {
  assert.equal(formatCommunityReplyCount(0), "0 respuestas");
  assert.equal(formatCommunityReplyCount(1), "1 respuesta");
  assert.equal(formatCommunityReplyCount(2), "2 respuestas");
});

test("community timestamps consistently use the Europe/Madrid time zone", () => {
  assert.equal(COMMUNITY_TIME_ZONE, "Europe/Madrid");
  assert.equal(formatCommunityMessageDate("2026-10-12T12:11:00.000Z"), "12 oct, 14:11");
  assert.equal(formatCommunityMessageDate("2026-01-12T12:11:00.000Z"), "12 ene, 13:11");
  assert.equal(formatCommunityShortDate("2026-10-12T12:11:00.000Z"), "12 oct");
});

test("Supabase public configuration requires a valid URL and publishable key", () => {
  const configured = {
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
  } as NodeJS.ProcessEnv;

  assert.deepEqual(getSupabasePublicConfig(configured), {
    url: "https://example.supabase.co",
    publishableKey: "sb_publishable_example",
  });
  assert.equal(isSupabaseConfigured(configured), true);
  assert.equal(isSupabaseConfigured({ NEXT_PUBLIC_SUPABASE_URL: "not-a-url" }), false);
  assert.equal(isSupabaseConfigured({ NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co" }), false);
});
