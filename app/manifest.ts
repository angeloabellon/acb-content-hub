import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cast To Cast Baloncesto",
    short_name: "Cast To Cast",
    description:
      "Vídeos, podcasts, noticias y contenido multimedia sobre baloncesto.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#7a0c0c",
    icons: [
  {
    src: "/icons/web-app-manifest-192x192.png",
    sizes: "192x192",
    type: "image/png",
  },
  {
    src: "/icons/web-app-manifest-512x512.png",
    sizes: "512x512",
    type: "image/png",
  },
],
  };
}