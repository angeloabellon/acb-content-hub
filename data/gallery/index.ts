import type { GalleryCollection } from "./types";

import { cacokPhotos } from "./cacok";
import { grada17May26Photos } from "./grada17may26";
import { ucamUnicajaPhotos } from "./ucamUnicaja";

export const galleryCollections: GalleryCollection[] = [
  {
  title: "UCAM Murcia - Unicaja Málaga",
  slug: "ucam-murcia-unicaja-accion",
  description:
    "Galería fotográfica del partido UCAM Murcia - Unicaja Málaga, con imágenes de acción, ambiente y protagonistas sobre la pista.",
  cover: ucamUnicajaPhotos[51].src,
  photos: ucamUnicajaPhotos,
},
  {
    title: "UCAM Murcia - Unicaja: ambiente en la grada",
    slug: "g-grada17may26",
    description:
      "Galería fotográfica del ambiente vivido en la grada durante el UCAM Murcia - Unicaja.",
    cover: grada17May26Photos[0].src,
    photos: grada17May26Photos,
  },

  {
    title: "Devontae Cacok",
    slug: "devontae-cacok",
    description:
      "Galería fotográfica dedicada a Devontae Cacok.",
    cover: cacokPhotos[0].src,
    photos: cacokPhotos,
  },
];