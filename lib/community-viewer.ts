export type CommunityViewerIdentity = {
  initials: string;
  label: string;
};

type CommunityViewerLabelSource = {
  username?: string;
  displayName?: string;
  email?: string;
};

/**
 * Produces a compact, non-sensitive label for the site header. We deliberately
 * use only the local part of the email, never the complete address.
 */
export function getCommunityViewerIdentity(
  viewer: CommunityViewerLabelSource,
): CommunityViewerIdentity {
  const preferredLabel = viewer.displayName?.trim() || viewer.username?.trim();
  const localPart = preferredLabel || viewer.email?.split("@", 1)[0]?.trim();
  if (!localPart) return { initials: "C", label: "Mi cuenta" };

  const characters = Array.from(localPart);
  const label = characters.length > 14
    ? `${characters.slice(0, 14).join("")}…`
    : localPart;

  return {
    initials: characters[0]?.toLocaleUpperCase("es-ES") ?? "C",
    label,
  };
}
