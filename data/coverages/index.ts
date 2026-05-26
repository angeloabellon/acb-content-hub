export type CoverageItem = {
  title: string;
  slug: string;
  description: string;
  date: string;

  gallerySlug?: string;
  podcastSlug?: string;
  videoSlug?: string;

  tags?: string[];
  featured?: boolean;
};

export const coverages: CoverageItem[] = [];