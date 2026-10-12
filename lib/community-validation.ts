export function isCommunityConversationKey(value: string): value is "acb" | "bcl" | "unicaja-malaga" | "hozono-global-jairis" {
  return value === "acb"
    || value === "bcl"
    || value === "unicaja-malaga"
    || value === "hozono-global-jairis";
}

export function getSafeCommunityPath(value: string | null | undefined): string {
  return value?.startsWith("/comunidad") && !value.startsWith("//")
    ? value
    : "/comunidad";
}
