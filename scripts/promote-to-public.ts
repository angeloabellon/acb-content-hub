import { createPromotionPreview, persistPromotionPreview } from "../lib/promote-to-public.ts";

const [command, artifact, ...argumentsList] = process.argv.slice(2);
const tokenIndex = argumentsList.indexOf("--token");
const token = tokenIndex >= 0 ? argumentsList[tokenIndex + 1] : undefined;

if (!artifact || !["preview", "apply"].includes(command ?? "")) {
  throw new Error("Uso: npm run promote:preview -- <artefacto> | npm run promote:apply -- <artefacto> --token <token>");
}
if (command === "preview") {
  const preview = await createPromotionPreview(artifact);
  console.log(JSON.stringify({ operation: preview.patch.operation, episodeId: preview.episodeId, fields: preview.patch.fields.filter((field) => field.changed), token: preview.token }, null, 2));
} else {
  if (!token) throw new Error("Falta --token de un preview recién generado.");
  const result = await persistPromotionPreview(token);
  console.log(`Promoción ${result.operation} aplicada. Backup: ${result.backupFile}`);
}
