import fs from "fs";
import path from "path";
import sharp from "sharp";
import readline from "readline";

const sourceFolder = path.join(process.cwd(), "local-gallery");
const galleryRootFolder = path.join(process.cwd(), "public", "galeria");
const dataGalleryFolder = path.join(process.cwd(), "data", "gallery");
const galleryIndexFile = path.join(dataGalleryFolder, "index.ts");

const validExtensions = [".jpg", ".jpeg", ".png"];

const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;
const coveragesFolder = path.join(process.cwd(), "data", "coverages");
const coveragesIndexFile = path.join(coveragesFolder, "index.ts");

function todayDDMMYY() {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  return `${dd}${mm}${yy}`;
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toVariableName(slug) {
  return slug
    .split("-")
    .map((part, index) =>
      index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join("");
}

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function explainError(error) {
  const message = error?.message ?? String(error);

  if (message.includes("ENOENT")) {
    return "Comprueba que la ruta existe y que el archivo no ha sido movido.";
  }

  if (message.includes("Input file is missing")) {
    return "La imagen de origen no existe. Revisa la carpeta local-gallery.";
  }

  if (message.includes("unsupported image format")) {
    return "El archivo no parece ser una imagen válida. Usa JPG, JPEG o PNG.";
  }

  if (message.toLowerCase().includes("permission")) {
    return "Problema de permisos. Cierra programas que estén usando la imagen o revisa permisos de la carpeta.";
  }

  return "Revisa que sharp esté instalado con npm install sharp y que la imagen no esté dañada.";
}

async function main() {
  console.log("\n📸 Importador de galerías Cast To Cast\n");

  if (!fs.existsSync(sourceFolder)) {
    console.error(red("ERROR") + " No existe la carpeta local-gallery.");
    console.error(
      "Solución: crea una carpeta llamada local-gallery en la raíz del proyecto."
    );
    process.exit(1);
  }

  if (!fs.existsSync(dataGalleryFolder)) {
    console.error(red("ERROR") + " No existe data/gallery.");
    console.error(
      "Solución: comprueba que estás ejecutando el script desde la raíz del proyecto."
    );
    process.exit(1);
  }

  const galleryTitle = await ask("Nombre de la nueva sección de galería: ");
  const galleryDescription = await ask("Descripción de la galería: ");
  const competition = await ask("Competición (opcional): ");
  const location = await ask("Ubicación / pabellón (opcional): ");
  const relatedPodcast = await ask("Slug podcast relacionado (opcional): ");
  const relatedVideo = await ask("Slug vídeo relacionado (opcional): ");

  if (!galleryTitle) {
    console.error(red("ERROR") + " El nombre de la galería es obligatorio.");
    process.exit(1);
  }

  const datePrefix = todayDDMMYY();
  const gallerySlug = slugify(galleryTitle);
  const exportName = toVariableName(gallerySlug);

  const destinationFolder = path.join(galleryRootFolder, datePrefix);
  const webFolder = `/galeria/${datePrefix}`;
  const collectionFile = path.join(dataGalleryFolder, `${gallerySlug}.ts`);

  const files = fs
    .readdirSync(sourceFolder)
    .filter((file) => validExtensions.includes(path.extname(file).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, "es", { numeric: true }));

  if (files.length === 0) {
    console.error(
      red("ERROR") + " No hay imágenes JPG, JPEG o PNG en local-gallery."
    );
    console.error(
      "Solución: copia las fotos en local-gallery y vuelve a ejecutar el script."
    );
    process.exit(1);
  }

  const plannedFiles = files.map((file, index) => {
    const sequence = String(index + 1).padStart(2, "0");
    return {
      original: file,
      output: `${datePrefix}_${sequence}.webp`,
    };
  });

  console.log("\n" + yellow("PREVIEW DE IMPORTACIÓN"));
  console.log("----------------------------------------");
  console.log(`Título: ${galleryTitle}`);
  console.log(`Slug web: /galeria/${gallerySlug}`);
  console.log(`Carpeta destino: public/galeria/${datePrefix}`);
  console.log(`Archivo data: data/gallery/${gallerySlug}.ts`);
  console.log(`Número de imágenes: ${files.length}`);
  console.log("----------------------------------------\n");

  plannedFiles.forEach((file) => {
    console.log(`${file.original} → ${file.output}`);
  });

  console.log("");

  if (fs.existsSync(destinationFolder)) {
    console.log(
      yellow(
        `AVISO: La carpeta public/galeria/${datePrefix} ya existe. Se añadirán archivos dentro de esa carpeta.`
      )
    );
  }

  if (fs.existsSync(collectionFile)) {
    console.log(
      yellow(
        `AVISO: Ya existe data/gallery/${gallerySlug}.ts. Si continúas, será sobrescrito.`
      )
    );
  }

  const confirmation = await ask(
    "\n¿Confirmas la importación y actualización de la web? (s/n): "
  );

  if (confirmation.toLowerCase() !== "s") {
    console.log("\nImportación cancelada. No se ha modificado ningún archivo.");
    process.exit(0);
  }

  fs.mkdirSync(destinationFolder, { recursive: true });

  console.log("\n" + yellow("IMPORTANDO IMÁGENES"));
  console.log("----------------------------------------\n");

  const photos = [];

  for (let index = 0; index < plannedFiles.length; index++) {
    const { original, output } = plannedFiles[index];

    const sourcePath = path.join(sourceFolder, original);
    const destinationPath = path.join(destinationFolder, output);

    try {
      await sharp(sourcePath)
        .rotate()
        .resize({
          width: 1800,
          withoutEnlargement: true,
        })
        .webp({
          quality: 82,
        })
        .toFile(destinationPath);

      console.log(
        `${original} → ${output} --> ${green("OK")}, almacenado en public/galeria/${datePrefix} --> ${green("OK")}`
      );

      photos.push({
        src: `${webFolder}/${output}`,
        alt: `${galleryTitle} ${index + 1}`,
      });
    } catch (error) {
      console.error(
        `${red("ERROR")} al convertir ${original}\n` +
          `${red("ERROR")} al almacenar ${output} en public/galeria/${datePrefix}\n` +
          `Causa: ${error.message}\n` +
          `Solución: ${explainError(error)}\n`
      );
    }
  }

  if (photos.length === 0) {
    console.error(red("ERROR") + " No se ha convertido ninguna imagen.");
    process.exit(1);
  }

  const collectionContent = `import type { GalleryCollection } from "./types";

export const ${exportName}: GalleryCollection = {
  title: "${galleryTitle}",
  slug: "${gallerySlug}",
  description:
    "${galleryDescription || `Galería fotográfica de ${galleryTitle} en Cast To Cast Baloncesto.`}",
  cover: "${photos[0].src}",
  photos: ${JSON.stringify(photos, null, 2)},
  date: "${new Date().toISOString().slice(0, 10)}",
  competition: "${competition}",
  location: "${location}",
  relatedPodcast: "${relatedPodcast}",
  relatedVideo: "${relatedVideo}",
};
`;

  try {
    fs.writeFileSync(collectionFile, collectionContent);
    console.log(`\ndata/gallery/${gallerySlug}.ts --> ${green("OK")}`);
  } catch (error) {
    console.error(
      `${red("ERROR")} al crear data/gallery/${gallerySlug}.ts\n` +
        `Causa: ${error.message}\n` +
        `Solución: ${explainError(error)}`
    );
    process.exit(1);
  }

  try {
    let indexContent = fs.readFileSync(galleryIndexFile, "utf-8");

    const importLine = `import { ${exportName} } from "./${gallerySlug}";`;

    if (!indexContent.includes(importLine)) {
      indexContent = `${importLine}\n${indexContent}`;
    }

    if (!indexContent.includes(`${exportName},`)) {
      indexContent = indexContent.replace(
        "export const galleryCollections: GalleryCollection[] = [",
        `export const galleryCollections: GalleryCollection[] = [\n  ${exportName},`
      );
    }

    fs.writeFileSync(galleryIndexFile, indexContent);
    console.log("data/gallery/index.ts --> " + green("OK"));
  } catch (error) {
    try {
  if (!fs.existsSync(coveragesFolder)) {
    fs.mkdirSync(coveragesFolder, { recursive: true });
  }

  if (!fs.existsSync(coveragesIndexFile)) {
    const initialCoveragesFile = `export type CoverageItem = {
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
`;

    fs.writeFileSync(coveragesIndexFile, initialCoveragesFile);
  }

  let coveragesContent = fs.readFileSync(coveragesIndexFile, "utf-8");

  const coverageEntry = `{
    title: "${galleryTitle}",
    slug: "${gallerySlug}",
    description: "${galleryDescription || `Cobertura multimedia de ${galleryTitle}.`}",
    date: "${new Date().toISOString().slice(0, 10)}",
    gallerySlug: "${gallerySlug}",
    podcastSlug: "${relatedPodcast}",
    videoSlug: "${relatedVideo}",
    tags: ["${competition || "Baloncesto"}"],
    featured: false,
  },`;

  if (!coveragesContent.includes(`slug: "${gallerySlug}"`)) {
    coveragesContent = coveragesContent.replace(
      "export const coverages: CoverageItem[] = [",
      `export const coverages: CoverageItem[] = [\n  ${coverageEntry}`
    );

    fs.writeFileSync(coveragesIndexFile, coveragesContent);
    console.log("data/coverages/index.ts --> " + green("OK"));
  } else {
    console.log(yellow("AVISO: la cobertura ya existía en data/coverages/index.ts"));
  }
} catch (error) {
  console.error(
    `${red("ERROR")} al actualizar data/coverages/index.ts\n` +
      `Causa: ${error.message}\n` +
      "Solución: comprueba que existe la carpeta data/coverages o vuelve a ejecutar el script."
  );
}
    console.error(
      `${red("ERROR")} al actualizar data/gallery/index.ts\n` +
        `Causa: ${error.message}\n` +
        "Solución: comprueba que data/gallery/index.ts existe y contiene export const galleryCollections: GalleryCollection[] = ["
    );
    process.exit(1);
  }

  const cleanLocalGallery = await ask(
    "\n¿Quieres vaciar local-gallery al terminar? (s/n): "
  );

  if (cleanLocalGallery.toLowerCase() === "s") {
    try {
      for (const file of files) {
        fs.unlinkSync(path.join(sourceFolder, file));
      }

      console.log("local-gallery vaciada --> " + green("OK"));
    } catch (error) {
      console.error(
        `${red("ERROR")} al vaciar local-gallery\n` +
          `Causa: ${error.message}\n` +
          "Solución: borra manualmente los archivos de local-gallery."
      );
    }
  }

  console.log("\n" + green("Galería creada correctamente."));
  console.log(`Nueva sección: /galeria/${gallerySlug}`);
  console.log(`Imágenes: public/galeria/${datePrefix}`);
  console.log(yellow("\nRecomendado ahora: npm run build"));
}

main();