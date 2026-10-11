import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  canonicalCommunityMentionValue,
  filterCommunityMentionSuggestions,
  getCommunityMentionQuery,
  insertCommunityMention,
  nextCommunityMentionSuggestionIndex,
  updateCommunityMentionComposer,
} from "../lib/community-mention-composer.ts";

const profiles = [
  { id: "one", username: "aficionado-5be79f", displayName: "Ángel.otalora" },
  { id: "two", username: "aficionado-a13d92", displayName: "Cast2Cast Sports" },
  { id: "three", username: "aficionado-c77e81", displayName: "Otro aficionado" },
];

test("mention suggestions search public names case-insensitively and stay compact", () => {
  assert.deepEqual(
    filterCommunityMentionSuggestions(profiles, "ÁNGEL").map((profile) => profile.displayName),
    ["Ángel.otalora"],
  );
  assert.deepEqual(
    filterCommunityMentionSuggestions(profiles, "", 2).map((profile) => profile.displayName),
    ["Ángel.otalora", "Cast2Cast Sports"],
  );
  assert.equal(getCommunityMentionQuery("Hola @cas", 9)?.value, "cas");
  assert.equal(getCommunityMentionQuery("correo@ctc.es", 13), undefined);
});

test("a selected mention is friendly in the composer and canonical only on submit", () => {
  const query = getCommunityMentionQuery("Hola @cas", 9);
  assert.ok(query);
  const selected = insertCommunityMention({ value: "Hola @cas", tokens: [] }, query, profiles[1]);

  assert.equal(selected.state.value, "Hola @Cast2Cast Sports ");
  assert.doesNotMatch(selected.state.value, /aficionado-a13d92/);
  assert.equal(canonicalCommunityMentionValue(selected.state), "Hola @aficionado-a13d92 ");

  const continued = updateCommunityMentionComposer(selected.state, `${selected.state.value}gracias`);
  assert.equal(canonicalCommunityMentionValue(continued), "Hola @aficionado-a13d92 gracias");
});

test("the composer does not duplicate an automatic reply mention and drops metadata when it is edited", () => {
  const first = insertCommunityMention(
    { value: "", tokens: [] },
    { start: 0, end: 0, value: "" },
    profiles[0],
  );
  const duplicate = insertCommunityMention(
    first.state,
    { start: first.state.value.length, end: first.state.value.length, value: "" },
    profiles[0],
  );
  assert.equal(duplicate.inserted, false);
  assert.equal(duplicate.state.value, first.state.value);

  const typedCanonical = insertCommunityMention(
    { value: "@aficionado-5be79f ", tokens: [] },
    { start: 19, end: 19, value: "" },
    profiles[0],
  );
  assert.equal(typedCanonical.inserted, false);

  const edited = updateCommunityMentionComposer(first.state, "Hola");
  assert.equal(canonicalCommunityMentionValue(edited), "Hola");
});

test("keyboard navigation wraps through suggestion options", () => {
  assert.equal(nextCommunityMentionSuggestionIndex(0, 3, 1), 1);
  assert.equal(nextCommunityMentionSuggestionIndex(0, 3, -1), 2);
  assert.equal(nextCommunityMentionSuggestionIndex(0, 0, 1), -1);
});

test("the UI exposes an accessible public-name autocomplete and reply action without self-mentions", async () => {
  const [field, conversation] = await Promise.all([
    readFile(new URL("../components/community/CommunityMentionField.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/community/CommunityTopicConversation.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(field, /role: "combobox"/);
  assert.match(field, /"aria-autocomplete": "list"/);
  assert.match(field, /event\.key === "ArrowDown"/);
  assert.match(field, /event\.key === "ArrowUp"/);
  assert.match(field, /event\.key === "Enter"/);
  assert.match(field, /event\.key === "Escape"/);
  assert.match(field, /role="listbox"/);
  assert.match(field, /@\{profile\.displayName\}/);
  assert.doesNotMatch(field, /@\{profile\.username\}/);
  assert.match(conversation, />\s*Responder\s*</);
  assert.match(conversation, /message\.authorId !== viewer\.id/);
  assert.match(conversation, /requestedMention/);
});
