import type { GalleryCollection } from "./types";

const ucamMurciaBarcaPhotos = Array.from({ length: 133 }, (_, index) => {
  const photoNumber = String(index + 1).padStart(2, "0");

  return {
    src: `/galeria/081026/081026_${photoNumber}.webp`,
    alt: `Fotografía ${index + 1} del partido UCAM Murcia - Barça.`,
  };
});

export const ucamMurciaBarca: GalleryCollection = {
  title: "UCAM Murcia - Barça",
  slug: "ucam-murcia-barca",
  description:
    "Galería fotográfica del partido UCAM Murcia - Barça, con imágenes de acción, ambiente y protagonistas sobre la pista.",
  cover: ucamMurciaBarcaPhotos[0].src,
  photos: ucamMurciaBarcaPhotos,
  date: "2026-10-08",
  competition: "Liga Endesa",
  teams: ["UCAM Murcia CB", "Barça"],
  location: "Palacio de los Deportes de Murcia",
};
