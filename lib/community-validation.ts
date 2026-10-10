export function isCommunitySpace(value: string): value is "acb" | "bcl" {
  return value === "acb" || value === "bcl";
}

export function getSafeCommunityPath(value: string | null | undefined): string {
  return value?.startsWith("/comunidad") && !value.startsWith("//")
    ? value
    : "/comunidad";
}
