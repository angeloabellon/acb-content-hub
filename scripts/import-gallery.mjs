import fs from "fs";
import path from "path";
const sourceFolder = path.join(process.cwd(), "local-gallery");
const destinationFolder = path.join(process.cwd(), "public", "galeria");
const outputFile = path.join(process.cwd(), "data", "gallery.ts");

const validExtensions = [".jpg", ".jpeg", ".png", ".webp"];

if (!fs.existsSync(sourceFolder)) {
  console.error("No existe la carpeta local-gallery.");
  console.error("Crea una carpeta llamada local-gallery en la raíz del proyecto.");
  process.exit(1);
}

if (!fs.existsSync(destinationFolder)) {
  fs.mkdirSync(destinationFolder, { recursive: true });
}

const files = fs
  .readdirSync(sourceFolder)
  .filter((file) =>
    validExtensions.includes(path.extname(file).toLowerCase())
  );

files.forEach((file) => {
  const sourcePath = path.join(sourceFolder, file);
  const destinationPath = path.join(destinationFolder, file);

  if (!fs.existsSync(destinationPath)) {
    fs.copyFileSync(sourcePath, destinationPath);
    console.log(`Copiada: ${file}`);
  }
});

const galleryItems = fs
  .readdirSync(destinationFolder)
  .filter((file) =>
    validExtensions.includes(path.extname(file).toLowerCase())
  )
  .sort()
  .map((file) => ({
    src: `/galeria/${file}`,
    alt: "Fotografía deportiva de Cast To Cast",
  }));

const fileContent = `export const galleryPhotos = ${JSON.stringify(
  galleryItems,
  null,
  2
)};\n`;

fs.writeFileSync(outputFile, fileContent);

console.log(`Galería actualizada con ${galleryItems.length} imágenes.`);