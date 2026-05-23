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
    cover: ucamUnicajaPhotos[51]?.src ?? ucamUnicajaPhotos[0].src,
    photos: ucamUnicajaPhotos,
    date: "2026-05-17",
    competition: "Liga Endesa",
    teams: ["UCAM Murcia CB", "Unicaja Málaga"],
    location: "Palacio de los Deportes de Murcia",
  },
  {
    title: "UCAM Murcia - Unicaja: ambiente en la grada",
    slug: "ucam-murcia-unicaja-grada",
    description:
      "Galería fotográfica del ambiente vivido en la grada durante el UCAM Murcia - Unicaja.",
    cover: grada17May26Photos[0].src,
    photos: grada17May26Photos,
    date: "2026-05-17",
    competition: "Liga Endesa",
    teams: ["UCAM Murcia CB", "Unicaja Málaga"],
    location: "Palacio de los Deportes de Murcia",
  },
  {
    title: "Devontae Cacok",
    slug: "devontae-cacok",
    description: "Galería fotográfica dedicada a Devontae Cacok.",
    cover: cacokPhotos[0].src,
    photos: cacokPhotos,
    teams: ["UCAM Murcia CB"],
  },
];