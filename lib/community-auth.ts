export const COMMUNITY_LOGIN_FAILURE = "Usuario o contraseña incorrectos.";

const COMMUNITY_USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]{1,22}[a-z0-9]$/;

// These names either belong to the product or could be confused with a route,
// support channel, or an official CTC account.
export const COMMUNITY_RESERVED_USERNAMES = new Set([
  "admin",
  "administracion",
  "acceso",
  "api",
  "ayuda",
  "casttocast",
  "comunidad",
  "contacto",
  "editor",
  "equipo",
  "login",
  "moderacion",
  "registro",
  "root",
  "soporte",
  "staff",
  "support",
  "system",
]);

export function normalizeCommunityUsername(value: string): string {
  return value.trim().toLowerCase();
}

export function validateCommunityUsername(value: string): string | undefined {
  const username = normalizeCommunityUsername(value);
  if (!COMMUNITY_USERNAME_PATTERN.test(username)) {
    return "El usuario debe tener entre 3 y 24 caracteres: letras, números, punto, guion o guion bajo.";
  }
  if (COMMUNITY_RESERVED_USERNAMES.has(username)) {
    return "Ese nombre de usuario está reservado.";
  }
  return undefined;
}

export function validateCommunityPassword(password: string): string | undefined {
  if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  return undefined;
}

export function isValidCommunityEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
