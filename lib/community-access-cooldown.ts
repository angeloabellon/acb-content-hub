export const COMMUNITY_ACCESS_COOLDOWN_MS = 60_000;
export const COMMUNITY_ACCESS_COOLDOWN_STORAGE_KEY = "ctc-community-access-cooldown-until";

export function createCommunityAccessCooldownUntil(
  now: number = Date.now(),
): number {
  return now + COMMUNITY_ACCESS_COOLDOWN_MS;
}

export function getCommunityAccessCooldownRemainingSeconds(
  cooldownUntil: number | null | undefined,
  now: number = Date.now(),
): number {
  if (!Number.isFinite(cooldownUntil) || cooldownUntil === undefined || cooldownUntil === null) {
    return 0;
  }

  const remainingMilliseconds = cooldownUntil - now;
  return remainingMilliseconds > 0 ? Math.ceil(remainingMilliseconds / 1_000) : 0;
}

/**
 * Restores only cooldowns created by this version of the client. A stale or
 * manually altered sessionStorage value must never leave someone locked out.
 */
export function getStoredCommunityAccessCooldownUntil(
  storedValue: string | null,
  now: number = Date.now(),
): number | null {
  const cooldownUntil = Number(storedValue);

  if (
    !Number.isSafeInteger(cooldownUntil)
    || getCommunityAccessCooldownRemainingSeconds(cooldownUntil, now) === 0
    || cooldownUntil - now > COMMUNITY_ACCESS_COOLDOWN_MS
  ) {
    return null;
  }

  return cooldownUntil;
}
