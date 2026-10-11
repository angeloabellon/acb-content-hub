export type CommunityMentionToken =
  | { type: "text"; value: string }
  | { type: "mention"; value: string; username: string };

export type ResolvedCommunityMention = {
  username: string;
  displayName: string;
};

// Usernames are deliberately restricted to the same public format enforced by
// the database. Requiring a boundary before @ prevents matching email fragments.
const mentionPattern = /(^|[^a-z0-9_@])@([a-z0-9][a-z0-9_-]{2,23})(?![a-z0-9_-])/gi;

/** Extracts unique, normalized @handles without treating email addresses as mentions. */
export function extractCommunityMentionHandles(value: string): string[] {
  const handles = new Set<string>();

  for (const match of value.matchAll(mentionPattern)) {
    const handle = match[2]?.toLowerCase();
    if (handle) handles.add(handle);
  }

  return [...handles];
}

/**
 * Splits plain text into safe render tokens. It never returns HTML: callers can
 * style only handles that have been resolved to a real public profile.
 */
export function tokenizeCommunityMentions(value: string): CommunityMentionToken[] {
  const tokens: CommunityMentionToken[] = [];
  let cursor = 0;

  for (const match of value.matchAll(mentionPattern)) {
    const prefix = match[1] ?? "";
    const handle = match[2];
    if (!handle || match.index === undefined) continue;

    const start = match.index + prefix.length;
    const end = start + handle.length + 1;
    if (start > cursor) tokens.push({ type: "text", value: value.slice(cursor, start) });
    tokens.push({ type: "mention", value: value.slice(start, end), username: handle.toLowerCase() });
    cursor = end;
  }

  if (cursor < value.length) tokens.push({ type: "text", value: value.slice(cursor) });
  return tokens.length ? tokens : [{ type: "text", value }];
}

/**
 * Replaces only resolved canonical handles with friendly profile names. The
 * source text is never mutated or interpreted as HTML.
 */
export function formatCommunityMentionText(
  value: string,
  mentions: ResolvedCommunityMention[] = [],
): string {
  const mentionNames = new Map(
    mentions.map((mention) => [
      mention.username.toLowerCase(),
      mention.displayName.trim() || "Miembro de la Comunidad",
    ]),
  );

  return tokenizeCommunityMentions(value)
    .map((token) => (
      token.type === "mention"
        ? `@${mentionNames.get(token.username) ?? token.value.slice(1)}`
        : token.value
    ))
    .join("");
}
