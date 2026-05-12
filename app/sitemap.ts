import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://casttocast.es";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/videos`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/galeria`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
    },
    
  ];
}