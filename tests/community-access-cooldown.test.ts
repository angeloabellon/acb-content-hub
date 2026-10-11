import assert from "node:assert/strict";
import test from "node:test";

import {
  COMMUNITY_ACCESS_COOLDOWN_MS,
  createCommunityAccessCooldownUntil,
  getCommunityAccessCooldownRemainingSeconds,
  getStoredCommunityAccessCooldownUntil,
} from "../lib/community-access-cooldown.ts";

test("community access cooldown starts at 60 seconds and counts down without rounding down early", () => {
  const now = 1_700_000_000_000;
  const cooldownUntil = createCommunityAccessCooldownUntil(now);

  assert.equal(cooldownUntil, now + COMMUNITY_ACCESS_COOLDOWN_MS);
  assert.equal(getCommunityAccessCooldownRemainingSeconds(cooldownUntil, now), 60);
  assert.equal(getCommunityAccessCooldownRemainingSeconds(cooldownUntil, now + 1), 60);
  assert.equal(getCommunityAccessCooldownRemainingSeconds(cooldownUntil, now + 1_001), 59);
});

test("community access cooldown expires cleanly", () => {
  const now = 1_700_000_000_000;

  assert.equal(getCommunityAccessCooldownRemainingSeconds(now, now), 0);
  assert.equal(getCommunityAccessCooldownRemainingSeconds(now - 1, now), 0);
  assert.equal(getCommunityAccessCooldownRemainingSeconds(null, now), 0);
});

test("only a current one-minute cooldown is restored from the browser session", () => {
  const now = 1_700_000_000_000;
  const validCooldown = now + 42_000;

  assert.equal(
    getStoredCommunityAccessCooldownUntil(String(validCooldown), now),
    validCooldown,
  );
  assert.equal(getStoredCommunityAccessCooldownUntil(null, now), null);
  assert.equal(getStoredCommunityAccessCooldownUntil("not-a-timestamp", now), null);
  assert.equal(getStoredCommunityAccessCooldownUntil(String(now), now), null);
  assert.equal(
    getStoredCommunityAccessCooldownUntil(String(now + COMMUNITY_ACCESS_COOLDOWN_MS + 1), now),
    null,
  );
});
