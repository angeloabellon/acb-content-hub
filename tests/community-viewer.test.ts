import assert from "node:assert/strict";
import test from "node:test";

import { getCommunityViewerIdentity } from "../lib/community-viewer.ts";

test("header identity never exposes a complete email address", () => {
  assert.deepEqual(
    getCommunityViewerIdentity({ id: "viewer-1", email: "maria.garcia@example.com" }),
    { initials: "M", label: "maria.garcia" },
  );
});

test("header identity truncates long local parts and has a safe fallback", () => {
  assert.deepEqual(
    getCommunityViewerIdentity({ id: "viewer-2", email: "una-cuenta-muy-larga@example.com" }),
    { initials: "U", label: "una-cuenta-muy…" },
  );
  assert.deepEqual(
    getCommunityViewerIdentity({ id: "viewer-3" }),
    { initials: "C", label: "Mi cuenta" },
  );
});

test("header prefers the public Community identity over an email-derived label", () => {
  assert.deepEqual(
    getCommunityViewerIdentity({
      id: "viewer-4",
      username: "angel.otalora",
      displayName: "Ángel Otalora",
      email: "private@example.com",
    }),
    { initials: "Á", label: "Ángel Otalora" },
  );
});
