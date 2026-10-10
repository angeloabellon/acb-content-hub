import assert from "node:assert/strict";
import test from "node:test";

import {
  getSafeCommunityPath,
  isCommunitySpace,
} from "../lib/community-validation.ts";
import { formatCommunityReplyCount } from "../lib/community-format.ts";
import {
  getSupabasePublicConfig,
  isSupabaseConfigured,
} from "../lib/supabase/config.ts";

test("community spaces are restricted to ACB and BCL", () => {
  assert.equal(isCommunitySpace("acb"), true);
  assert.equal(isCommunitySpace("bcl"), true);
  assert.equal(isCommunitySpace("other"), false);
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
