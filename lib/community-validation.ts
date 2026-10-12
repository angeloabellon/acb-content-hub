export function isCommunityConversationKey(value: string): value is "acb" | "unicaja-malaga" | "hozono-global-jairis" {
  return value === "acb"
    || value === "unicaja-malaga"
    || value === "hozono-global-jairis";
}

/** Retired Community URLs remain safe entry points, never active conversations. */
export function getRetiredCommunityPath(value: string): string | undefined {
  return value === "ucam-murcia-en-bcl" ? "/comunidad" : undefined;
}

export function getSafeCommunityPath(value: string | null | undefined): string {
  return value?.startsWith("/comunidad") && !value.startsWith("//")
    ? value
    : "/comunidad";
}
