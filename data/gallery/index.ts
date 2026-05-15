import { cacokPhotos } from "./cacok";
import { antetokounmpoPhotos } from "./antetokounmpo";

export const galleryCollections = [
  {
    slug: "d-cacok",
    title: "D. Cacok",
    cover: cacokPhotos[0].src,
    photos: cacokPhotos,
  },
  {
    slug: "g-antetokounmpo",
    title: "G. Antetokounmpo",
    cover: antetokounmpoPhotos[0].src,
    photos: antetokounmpoPhotos,
  },
];