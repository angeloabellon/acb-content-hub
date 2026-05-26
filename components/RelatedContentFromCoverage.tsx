import RelatedContent from "@/components/RelatedContent";
import { coverages } from "@/data/coverages";

type RelatedItem = {
  title: string;
  href: string;
  type: "Vídeo" | "Podcast" | "Galería";
};

type RelatedContentFromCoverageProps = {
  currentType: "gallery" | "podcast" | "video";
  currentSlug: string;
};

export default function RelatedContentFromCoverage({
  currentType,
  currentSlug,
}: RelatedContentFromCoverageProps) {
  const coverage = coverages.find((item) => {
    if (currentType === "gallery") return item.gallerySlug === currentSlug;
    if (currentType === "podcast") return item.podcastSlug === currentSlug;
    if (currentType === "video") return item.videoSlug === currentSlug;

    return false;
  });

  if (!coverage) return null;

  const relatedItems: RelatedItem[] = [];

  if (coverage.videoSlug && currentType !== "video") {
    relatedItems.push({
      type: "Vídeo",
      title: coverage.title,
      href: `/videos/${coverage.videoSlug}`,
    });
  }

  if (coverage.podcastSlug && currentType !== "podcast") {
    relatedItems.push({
      type: "Podcast",
      title: coverage.title,
      href: `/podcasts/${coverage.podcastSlug}`,
    });
  }

  if (coverage.gallerySlug && currentType !== "gallery") {
    relatedItems.push({
      type: "Galería",
      title: coverage.title,
      href: `/galeria/${coverage.gallerySlug}`,
    });
  }

  return (
    <RelatedContent
      title="Más contenido de esta cobertura"
      items={relatedItems}
    />
  );
}