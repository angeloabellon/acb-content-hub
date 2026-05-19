import type { GalleryCollection } from "./types";

import { cacokPhotos } from "./cacok";
import { grada17May26Photos } from "./grada17may26";

export const galleryCollections: GalleryCollection[] = [
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