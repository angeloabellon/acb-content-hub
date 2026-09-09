import assert from "node:assert/strict";
import test from "node:test";

import { getEditorAuthConfig, getSafeEditorCallbackUrl, hasEditorRole, isEditorAuthConfigured } from "../lib/editor-auth.ts";

const validHash = "$2b$12$1pYe4IGvftwVcJaCgWVFfOAFva3yzEprAcFemcIC7IcUiO6LcwxEq";
const validEnvironment = { AUTH_SECRET: "test-secret", EDITOR_AUTH_EMAIL: "editor@example.com", EDITOR_AUTH_PASSWORD_HASH: validHash } as NodeJS.ProcessEnv;

test("editor access rejects an unauthenticated session and an incorrect role", () => {
  assert.equal(hasEditorRole(null), false);
  assert.equal(hasEditorRole({ user: { role: "viewer" } }), false);
});

test("editor access accepts the editor role only", () => {
  assert.equal(hasEditorRole({ user: { role: "editor" } }), true);
});

test("editor login configuration requires email, bcrypt hash, and Auth.js secret", () => {
  assert.equal(getEditorAuthConfig({}), undefined);
  assert.equal(getEditorAuthConfig({ EDITOR_AUTH_EMAIL: "editor@example.com", EDITOR_AUTH_PASSWORD_HASH: "plain-text" }), undefined);
  assert.equal(isEditorAuthConfigured({ ...validEnvironment, AUTH_SECRET: "" }), false);
  assert.deepEqual(getEditorAuthConfig(validEnvironment), { email: "editor@example.com", passwordHash: validHash });
  assert.equal(isEditorAuthConfigured(validEnvironment), true);
});

test("post-login redirects remain within the editor", () => {
  assert.equal(getSafeEditorCallbackUrl("/editor/episodios/demo"), "/editor/episodios/demo");
  assert.equal(getSafeEditorCallbackUrl("https://example.com"), "/editor/episodios");
  assert.equal(getSafeEditorCallbackUrl("/editor/login"), "/editor/episodios");
});
