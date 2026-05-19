// config/featureFlags.ts

/**
 * Feature flags del proyecto.
 *
 * Permiten activar/desactivar bloques de contenido sin borrar código,
 * manteniendo la arquitectura preparada para futuras publicaciones.
 */
export const featureFlags = {
  /**
   * Muestra la integración pública de artículos / firma invitada
   * de Emilio Sánchez-Bolea.
   *
   * Actualmente queda desactivada hasta recibir confirmación.
   */
  showBoleaArticles: false,
} as const;