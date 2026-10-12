import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  COMMUNITY_LOGIN_FAILURE,
  normalizeCommunityUsername,
  validateCommunityPassword,
  validateCommunityUsername,
} from "../lib/community-auth.ts";
import {
  communityAuthCallbackPaths,
  getCommunityAuthCallbackUrl,
  getCommunityAuthFailurePath,
  getCommunityAuthSuccessPath,
  getLegacyCommunityAuthFlow,
} from "../lib/community-auth-callback.ts";
import { extractCommunityMentionHandles } from "../lib/community-mentions.ts";

test("usernames are lowercased and accept only stable public handle syntax", () => {
  assert.equal(normalizeCommunityUsername("  Ángel.CTC  "), "ángel.ctc");
  assert.equal(validateCommunityUsername("Angel.CTC"), undefined);
  assert.equal(validateCommunityUsername("ctc_24"), undefined);
  assert.ok(validateCommunityUsername("ab"));
  assert.ok(validateCommunityUsername("ana."));
  assert.ok(validateCommunityUsername("-ana"));
  assert.ok(validateCommunityUsername("ana ctc"));
  assert.ok(validateCommunityUsername("admin"));
  assert.ok(validateCommunityUsername("a".repeat(25)));
});

test("password validation requires at least eight characters", () => {
  assert.ok(validateCommunityPassword("seis123"));
  assert.equal(validateCommunityPassword("ocho1234"), undefined);
});

test("confirmation and recovery use separate callbacks and destinations", () => {
  assert.deepEqual(communityAuthCallbackPaths, {
    confirmation: "/comunidad/auth/confirmar",
    "password-recovery": "/comunidad/auth/restablecer",
  });
  assert.equal(
    getCommunityAuthCallbackUrl("https://casttocast.es", "confirmation"),
    "https://casttocast.es/comunidad/auth/confirmar",
  );
  assert.equal(getCommunityAuthSuccessPath("confirmation"), "/comunidad/confirmado");
  assert.equal(getCommunityAuthFailurePath("confirmation"), "/comunidad/confirmado?error=enlace");
  assert.equal(getCommunityAuthSuccessPath("password-recovery"), "/comunidad/nueva-contrasena");
  assert.equal(getCommunityAuthFailurePath("password-recovery"), "/comunidad/recuperar?error=enlace");
});

test("legacy callbacks preserve password recovery while confirmation stays isolated", () => {
  assert.equal(getLegacyCommunityAuthFlow("/comunidad/nueva-contrasena"), "password-recovery");
  assert.equal(getLegacyCommunityAuthFlow("/comunidad"), "confirmation");
  assert.equal(getLegacyCommunityAuthFlow("https://example.com"), "confirmation");
});

test("real usernames with dots are valid mentions without swallowing punctuation", () => {
  assert.deepEqual(
    extractCommunityMentionHandles("Hola @angel.otalora, mira esto. @cast2cast.sports! @ana."),
    ["angel.otalora", "cast2cast.sports"],
  );
});

test("password auth keeps email resolution server-only and returns generic login failures", async () => {
  const [actions, adminClient, migration] = await Promise.all([
    readFile(new URL("../app/comunidad/actions.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/supabase/admin.ts", import.meta.url), "utf8"),
    readFile(new URL("../supabase/migrations/202610120002_community_password_auth.sql", import.meta.url), "utf8"),
  ]);

  assert.match(actions, /auth\.signInWithPassword/);
  assert.doesNotMatch(actions, /signInWithOtp/);
  assert.equal(COMMUNITY_LOGIN_FAILURE, "Usuario o contraseña incorrectos.");
  assert.match(actions, /message: COMMUNITY_LOGIN_FAILURE/);
  assert.match(actions, /unknown-community-login@invalid\.example/);
  assert.match(adminClient, /import "server-only"/);
  assert.match(adminClient, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(migration, /revoke all on function public\.resolve_community_login_email\(text\) from public/i);
  assert.match(migration, /grant execute on function public\.resolve_community_login_email\(text\) to service_role/i);
  assert.doesNotMatch(migration, /grant execute on function public\.resolve_community_login_email\(text\) to (anon|authenticated)/i);
});

test("confirmation, recovery, aliases, and password login redirects are present", async () => {
  const [actions, registration, recovery, replacement, migration, access, callback, confirmationCallback, recoveryCallback, confirmed] = await Promise.all([
    readFile(new URL("../app/comunidad/actions.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/community/CommunityRegistrationForm.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/community/CommunityPasswordRecoveryForm.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/community/CommunityNewPasswordForm.tsx", import.meta.url), "utf8"),
    readFile(new URL("../supabase/migrations/202610120002_community_password_auth.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/comunidad/acceso/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/comunidad/auth/callback/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/comunidad/auth/confirmar/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/comunidad/auth/restablecer/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/comunidad/confirmado/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(actions, /auth\.signUp/);
  assert.match(actions, /data: \{ username, display_name: username \}/);
  assert.match(actions, /auth\.resetPasswordForEmail/);
  assert.match(actions, /auth\.updateUser\(\{ password \}\)/);
  assert.match(actions, /getCommunityAuthCallbackUrl\([\s\S]*"confirmation"/);
  assert.match(actions, /getCommunityAuthCallbackUrl\([\s\S]*"password-recovery"/);
  assert.match(actions, /auth\.signOut\(\{ scope: "local" \}\)/);
  assert.match(actions, /redirect\("\/comunidad\/acceso\?actualizada=1"\)/);
  assert.match(registration, /passwordConfirmation/);
  assert.match(recovery, /name="email"/);
  assert.match(replacement, /name="passwordConfirmation"/);
  assert.match(migration, /community_username_aliases/);
  assert.match(migration, /angel\.otalora/);
  assert.match(migration, /cast2cast\.sports/);
  assert.match(migration, /raw_user_meta_data ->> 'username'/);
  assert.match(access, /if \(viewer\)\s*\{\s*redirect\("\/comunidad"\)/);
  assert.match(access, /Contraseña actualizada\. Accede con tu usuario y tu nueva contraseña\./);
  assert.match(callback, /getLegacyCommunityAuthFlow/);
  assert.match(confirmationCallback, /completeCommunityAuthCallback\(request, "confirmation"\)/);
  assert.match(recoveryCallback, /completeCommunityAuthCallback\(request, "password-recovery"\)/);
  assert.match(confirmed, /Correo confirmado correctamente\. Ya puedes acceder a Comunidad CTC con tu usuario y contraseña\./);
  assert.match(confirmed, /href="\/comunidad\/acceso"/);
});
