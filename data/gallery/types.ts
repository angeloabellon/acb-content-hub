export type GalleryPhoto = {
  src: string;
  alt: string;
};

export type GalleryCollection = {
  title: string;
  slug: string;
  description: string;
  cover: string;
  photos: GalleryPhoto[];

  date?: string;
  competition?: string;
  teams?: string[];
  location?: string;
  relatedPodcast?: string;
relatedVideo?: string;
};