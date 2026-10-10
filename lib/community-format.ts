export function formatCommunityReplyCount(count: number): string {
  return `${count} ${count === 1 ? "respuesta" : "respuestas"}`;
}
