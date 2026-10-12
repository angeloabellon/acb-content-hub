export const COMMUNITY_TIME_ZONE = "Europe/Madrid";

export function formatCommunityReplyCount(count: number): string {
  return `${count} ${count === 1 ? "respuesta" : "respuestas"}`;
}

/** Formats every absolute Community timestamp in Spain's canonical time zone. */
export function formatCommunityMessageDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "Recientemente";

  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: COMMUNITY_TIME_ZONE,
  }).format(date);
}

export function formatCommunityShortDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "Reciente";

  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    timeZone: COMMUNITY_TIME_ZONE,
  }).format(date);
}
