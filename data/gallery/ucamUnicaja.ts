export const ucamUnicajaPhotos = Array.from({ length: 71 }, (_, index) => {
  const photoNumber = String(index + 1).padStart(2, "0");

  return {
    src: `/galeria/UCAMUnicaja_${photoNumber}.webp`,
    alt: `Fotografía ${index + 1} del partido UCAM Murcia - Unicaja Málaga.`,
  };
});