import type { CommunityMentionableProfile } from "@/lib/community";
import { extractCommunityMentionHandles } from "./community-mentions.ts";

export type CommunityMentionToken = {
  start: number;
  end: number;
  username: string;
  displayName: string;
};

export type CommunityMentionComposerState = {
  value: string;
  tokens: CommunityMentionToken[];
};

export type CommunityMentionQuery = {
  start: number;
  end: number;
  value: string;
};

export const emptyCommunityMentionComposer = (): CommunityMentionComposerState => ({
  value: "",
  tokens: [],
});

function tokenMatchesValue(token: CommunityMentionToken, value: string): boolean {
  return value.slice(token.start, token.end) === `@${token.displayName}`;
}

function replaceRange(
  state: CommunityMentionComposerState,
  start: number,
  end: number,
  replacement: string,
): CommunityMentionComposerState {
  const value = `${state.value.slice(0, start)}${replacement}${state.value.slice(end)}`;
  const difference = replacement.length - (end - start);
  const tokens = state.tokens.flatMap((token) => {
    if (!tokenMatchesValue(token, state.value) || (token.start < end && token.end > start)) {
      return [];
    }
    if (token.start >= end) {
      return [{ ...token, start: token.start + difference, end: token.end + difference }];
    }
    return [token];
  });

  return { value, tokens };
}

/** Keeps mention tokens only when an edit did not touch their friendly text. */
export function updateCommunityMentionComposer(
  state: CommunityMentionComposerState,
  nextValue: string,
): CommunityMentionComposerState {
  if (state.value === nextValue) return state;

  let start = 0;
  const sharedLength = Math.min(state.value.length, nextValue.length);
  while (start < sharedLength && state.value[start] === nextValue[start]) start += 1;

  let previousEnd = state.value.length;
  let nextEnd = nextValue.length;
  while (
    previousEnd > start
    && nextEnd > start
    && state.value[previousEnd - 1] === nextValue[nextEnd - 1]
  ) {
    previousEnd -= 1;
    nextEnd -= 1;
  }

  return replaceRange(state, start, previousEnd, nextValue.slice(start, nextEnd));
}

/** Finds the unfinished @query immediately before a text cursor. */
export function getCommunityMentionQuery(
  value: string,
  cursor: number,
): CommunityMentionQuery | undefined {
  const beforeCursor = value.slice(0, cursor);
  const at = beforeCursor.lastIndexOf("@");
  if (at < 0) return undefined;

  const beforeAt = value[at - 1];
  const query = beforeCursor.slice(at + 1);
  if (
    (beforeAt && /[a-z0-9_@]/i.test(beforeAt))
    || /\s|@/.test(query)
  ) {
    return undefined;
  }

  return { start: at, end: cursor, value: query };
}

/** Returns a compact, public-name-only list for the mention popover. */
export function filterCommunityMentionSuggestions(
  profiles: CommunityMentionableProfile[],
  query: string,
  limit = 5,
): CommunityMentionableProfile[] {
  const normalized = query.trim().toLocaleLowerCase("es-ES");
  return profiles
    .filter((profile) => profile.displayName.toLocaleLowerCase("es-ES").includes(normalized))
    .sort((left, right) => {
      const leftName = left.displayName.toLocaleLowerCase("es-ES");
      const rightName = right.displayName.toLocaleLowerCase("es-ES");
      const startsLeft = leftName.startsWith(normalized);
      const startsRight = rightName.startsWith(normalized);
      if (startsLeft !== startsRight) return startsLeft ? -1 : 1;
      return leftName.localeCompare(rightName, "es-ES");
    })
    .slice(0, limit);
}

export function nextCommunityMentionSuggestionIndex(
  currentIndex: number,
  count: number,
  direction: 1 | -1,
): number {
  if (!count) return -1;
  return (currentIndex + direction + count) % count;
}

/** Inserts the public label visually and retains the canonical handle as token metadata. */
export function insertCommunityMention(
  state: CommunityMentionComposerState,
  query: CommunityMentionQuery,
  profile: CommunityMentionableProfile,
): { state: CommunityMentionComposerState; cursor: number; inserted: boolean } {
  const canonicalHandle = profile.username.toLowerCase();
  if (
    state.tokens.some((token) => token.username.toLowerCase() === canonicalHandle)
    || extractCommunityMentionHandles(canonicalCommunityMentionValue(state)).includes(canonicalHandle)
  ) {
    return { state, cursor: query.end, inserted: false };
  }

  const mention = `@${profile.displayName}`;
  const next = replaceRange(state, query.start, query.end, `${mention} `);
  const token: CommunityMentionToken = {
    start: query.start,
    end: query.start + mention.length,
    username: profile.username,
    displayName: profile.displayName,
  };

  return {
    state: { ...next, tokens: [...next.tokens, token].sort((left, right) => left.start - right.start) },
    cursor: query.start + mention.length + 1,
    inserted: true,
  };
}

/** Builds the value saved to the backend without ever showing canonical handles to the author. */
export function canonicalCommunityMentionValue(state: CommunityMentionComposerState): string {
  let cursor = 0;
  let canonical = "";

  for (const token of state.tokens) {
    if (token.start < cursor || !tokenMatchesValue(token, state.value)) continue;
    canonical += state.value.slice(cursor, token.start);
    canonical += `@${token.username}`;
    cursor = token.end;
  }

  return `${canonical}${state.value.slice(cursor)}`;
}
