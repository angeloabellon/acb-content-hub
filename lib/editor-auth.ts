export type EditorialRole = "editor";

type SessionLike = { user?: { role?: unknown } } | null | undefined;

export type EditorAuthConfig = {
  email: string;
  passwordHash: string;
};

const bcryptHashPattern = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

/** Pure, deliberately small authorization boundary used by pages and actions. */
export function hasEditorRole(session: SessionLike): boolean {
  return session?.user?.role === "editor";
}

/** Returns undefined rather than exposing a partially configured login. */
export function getEditorAuthConfig(environment: NodeJS.ProcessEnv = process.env): EditorAuthConfig | undefined {
  const email = environment.EDITOR_AUTH_EMAIL?.trim().toLowerCase();
  const passwordHash = environment.EDITOR_AUTH_PASSWORD_HASH?.trim();
  if (!email || !passwordHash || !bcryptHashPattern.test(passwordHash)) return undefined;
  return { email, passwordHash };
}

export function isEditorAuthConfigured(environment: NodeJS.ProcessEnv = process.env): boolean {
  return getEditorAuthConfig(environment) !== undefined && Boolean(environment.AUTH_SECRET?.trim());
}

/** Only accepts local editorial paths, preventing an open redirect after login. */
export function getSafeEditorCallbackUrl(value: string | undefined): string {
  if (value?.startsWith("/editor/") && !value.startsWith("/editor/login")) return value;
  return "/editor/episodios";
}
