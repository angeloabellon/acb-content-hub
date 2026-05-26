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

export const coverages: CoverageItem[] = [
  {
    title: "Prueba cobertura",
    slug: "prueba-cobertura",
    description: "Galería temporal para prueba de sistema automático",
    date: "2026-05-26",

    gallerySlug: "prueba-cobertura",

    podcastSlug:
      "cast-to-cast-4x18-la-tertulia-ucam-murcia-vence-a-unicaja-y-se-mantiene-2-en-acb",

    videoSlug:
      "cast-to-cast-4x16-la-tertulia-victorias-de-ucam-murcia-y-unicaja-cae-cartagena-jairis-sera-4-MMSryc4wKl4",

    tags: ["Prueba"],

    featured: false,
  },
];