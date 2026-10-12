export type CommunityAuthFlow = "confirmation" | "password-recovery";

export const communityAuthCallbackPaths: Record<CommunityAuthFlow, string> = {
  confirmation: "/comunidad/auth/confirmar",
  "password-recovery": "/comunidad/auth/restablecer",
};

const communityAuthSuccessPaths: Record<CommunityAuthFlow, string> = {
  confirmation: "/comunidad/confirmado",
  "password-recovery": "/comunidad/nueva-contrasena",
};

const communityAuthFailurePaths: Record<CommunityAuthFlow, string> = {
  confirmation: "/comunidad/confirmado?error=enlace",
  "password-recovery": "/comunidad/recuperar?error=enlace",
};

/** Creates one of the two purpose-specific Supabase email return URLs. */
export function getCommunityAuthCallbackUrl(origin: string, flow: CommunityAuthFlow): string {
  return new URL(communityAuthCallbackPaths[flow], origin).toString();
}

export function getCommunityAuthSuccessPath(flow: CommunityAuthFlow): string {
  return communityAuthSuccessPaths[flow];
}

export function getCommunityAuthFailurePath(flow: CommunityAuthFlow): string {
  return communityAuthFailurePaths[flow];
}

/**
 * Supports links sent before the purpose-specific callbacks were deployed.
 * The old recovery URL was the only legacy callback that targeted this page.
 */
export function getLegacyCommunityAuthFlow(next: string | null): CommunityAuthFlow {
  return next === "/comunidad/nueva-contrasena" ? "password-recovery" : "confirmation";
}
