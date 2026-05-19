export const cacokPhotos = Array.from({ length: 51 }, (_, index) => {
  const photoNumber = index + 1;

  return {
    src: `/galeria/Cacok (${photoNumber}).webp`,
    alt: `Fotografía ${photoNumber} de Devontae Cacok en Cast To Cast Baloncesto.`,
  };
});