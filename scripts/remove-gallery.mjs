import fs from "fs";
import path from "path";
import readline from "readline";

const galleryRootFolder = path.join(process.cwd(), "public", "galeria");
const dataGalleryFolder = path.join(process.cwd(), "data", "gallery");
const galleryIndexFile = path.join(dataGalleryFolder, "index.ts");

const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;

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

function toVariableName(slug) {
  return slug
    .split("-")
    .map((part, index) =>
      index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join("");
}

async function main() {
  console.log("\n🧹 Eliminador de galerías Cast To Cast\n");

  const gallerySlug = await ask("Slug de la galería a eliminar: ");
  const imageFolder = await ask("Carpeta de imágenes a eliminar (ddmmaa): ");

  if (!gallerySlug || !imageFolder) {
    console.error(
      red("ERROR") +
        " Debes indicar el slug de la galería y la carpeta de imágenes."
    );
    process.exit(1);
  }

  const exportName = toVariableName(gallerySlug);
  const galleryDataFile = path.join(dataGalleryFolder, `${gallerySlug}.ts`);
  const galleryImageFolder = path.join(galleryRootFolder, imageFolder);

  console.log("\n" + yellow("PREVIEW DE ELIMINACIÓN"));
  console.log("----------------------------------------");
  console.log(`Archivo data: data/gallery/${gallerySlug}.ts`);
  console.log(`Carpeta imágenes: public/galeria/${imageFolder}`);
  console.log(`Import esperado: import { ${exportName} } from "./${gallerySlug}";`);
  console.log(`Referencia esperada: ${exportName},`);
  console.log("----------------------------------------");

  const confirmation = await ask(
    "\n¿Confirmas la eliminación de esta galería? (s/n): "
  );

  if (confirmation.toLowerCase() !== "s") {
    console.log("\nEliminación cancelada. No se ha modificado ningún archivo.");
    process.exit(0);
  }

  try {
    if (fs.existsSync(galleryDataFile)) {
      fs.unlinkSync(galleryDataFile);
      console.log(`data/gallery/${gallerySlug}.ts --> ${green("OK")}`);
    } else {
      console.log(
        yellow(`AVISO: data/gallery/${gallerySlug}.ts no existe.`)
      );
    }
  } catch (error) {
    console.error(
      `${red("ERROR")} al eliminar data/gallery/${gallerySlug}.ts\nCausa: ${error.message}`
    );
  }

  try {
    if (fs.existsSync(galleryImageFolder)) {
      fs.rmSync(galleryImageFolder, { recursive: true, force: true });
      console.log(`public/galeria/${imageFolder} --> ${green("OK")}`);
    } else {
      console.log(
        yellow(`AVISO: public/galeria/${imageFolder} no existe.`)
      );
    }
  } catch (error) {
    console.error(
      `${red("ERROR")} al eliminar public/galeria/${imageFolder}\nCausa: ${error.message}`
    );
  }

  try {
    if (!fs.existsSync(galleryIndexFile)) {
      throw new Error("No existe data/gallery/index.ts");
    }

    let indexContent = fs.readFileSync(galleryIndexFile, "utf-8");

    const importLineRegex = new RegExp(
      `import \\{ ${exportName} \\} from "\\./${gallerySlug}";\\n?`,
      "g"
    );

    const collectionReferenceRegex = new RegExp(
      `\\s*${exportName},\\n?`,
      "g"
    );

    indexContent = indexContent
      .replace(importLineRegex, "")
      .replace(collectionReferenceRegex, "");

    fs.writeFileSync(galleryIndexFile, indexContent);

    console.log("data/gallery/index.ts actualizado --> " + green("OK"));
  } catch (error) {
    console.error(
      `${red("ERROR")} al actualizar data/gallery/index.ts\nCausa: ${error.message}`
    );
  }

  console.log("\n" + green("Proceso de eliminación terminado."));
  console.log(yellow("Recomendado ahora: npm run build"));
}

main();