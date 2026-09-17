import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

import type { ApprovedPublicEpisodeArtifact } from "../types/public-episode-candidate.ts";
import type { Episode } from "../types/episode.ts";

export const PROMOTED_EPISODE_FIELDS = ["slug", "title", "description", "date", "thumbnail", "participants", "platforms", "kind", "season", "episodeNumber"] as const;
export type PromotedEpisodeField = (typeof PROMOTED_EPISODE_FIELDS)[number];
export const DEFAULT_EPISODES_FILE = path.join(/* turbopackIgnore: true */ process.cwd(), "data", "episodes.ts");
export const DEFAULT_APPROVED_PROMOTIONS_DIRECTORY = path.join(/* turbopackIgnore: true */ process.cwd(), "data", "promotions", "approved");

export type PromotionPatch = {
  episodeId: string;
  operation: "insert" | "update";
  fields: ReadonlyArray<{ field: PromotedEpisodeField; before?: unknown; after: unknown; changed: boolean }>;
  episodes: readonly Episode[];
};

export type PromotionPreview = { artifactFile: string; artifactVersion: number; episodeId: string; episodesHash: string; token: string; patch: PromotionPatch };
export type PromotionPatchStatus = "ready" | "stale_base" | "stale_artifact" | "invalid";
export type PromotionFileOptions = { episodesFile?: string; approvedDirectory?: string; environment?: NodeJS.ProcessEnv; now?: Date };

function sha256(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function same(left: unknown, right: unknown): boolean { return JSON.stringify(left) === JSON.stringify(right); }
function validEpisodeId(value: string): boolean { return /^[A-Za-z0-9_-]+$/.test(value); }
function artifactName(value: string): boolean { return /^[a-z0-9]+(?:-[a-z0-9]+)*--[A-Za-z0-9_-]+_v\d{2,}\.json$/.test(value); }
function artifactVersion(value: string): number { return Number(/_v(\d+)\.json$/.exec(value)?.[1] ?? 0); }

function safeChild(directory: string, fileName: string): string | undefined {
  if (!artifactName(fileName)) return undefined;
  const root = path.resolve(directory);
  const target = path.resolve(root, fileName);
  return target.startsWith(`${root}${path.sep}`) ? target : undefined;
}

/** Loads only an approved, versioned JSON artifact from the known approved directory. */
export async function loadApprovedPromotionArtifact(fileName: string, options: Pick<PromotionFileOptions, "approvedDirectory"> = {}): Promise<ApprovedPublicEpisodeArtifact & { fileName: string }> {
  const target = safeChild(options.approvedDirectory ?? DEFAULT_APPROVED_PROMOTIONS_DIRECTORY, fileName);
  if (!target) throw new Error("El artefacto aprobado no tiene una ruta segura.");
  const parsed: unknown = JSON.parse(await readFile(target, "utf8"));
  if (!parsed || typeof parsed !== "object") throw new Error("El artefacto aprobado no es válido.");
  const artifact = parsed as ApprovedPublicEpisodeArtifact;
  if (artifact.schemaVersion !== 1 || !artifact.approval || !validEpisodeId(artifact.approval.episodeId) || artifact.approval.episodeId !== artifact.candidate?.id || !artifact.approval.approvedAt || !artifact.approval.createdAt || !Number.isInteger(artifact.approval.version) || artifact.approval.version !== artifactVersion(fileName) || !fileName.startsWith(`${artifact.candidate.slug}--${artifact.approval.episodeId}_v`)) throw new Error("El artefacto no es una promoción aprobada válida.");
  return { ...artifact, fileName };
}

/** Applies the public-field whitelist in memory. It neither reads nor writes files. */
export function buildEpisodesPatch(currentEpisodes: readonly Episode[], approvedArtifact: ApprovedPublicEpisodeArtifact): PromotionPatch {
  const candidate = approvedArtifact.candidate;
  if (!candidate || !validEpisodeId(approvedArtifact.approval.episodeId) || candidate.id !== approvedArtifact.approval.episodeId) throw new Error("La identidad técnica del artefacto no es válida.");
  const index = currentEpisodes.findIndex((episode) => episode.id === candidate.id);
  const existing = index === -1 ? undefined : currentEpisodes[index];
  const fields = PROMOTED_EPISODE_FIELDS.map((field) => ({ field, ...(existing ? { before: existing[field] } : {}), after: candidate[field], changed: !same(existing?.[field], candidate[field]) }));
  const promoted = existing ? { ...existing } : { id: candidate.id } as Episode;
  for (const field of PROMOTED_EPISODE_FIELDS) Object.assign(promoted, { [field]: structuredClone(candidate[field]) });
  const episodes = existing ? currentEpisodes.map((episode, position) => position === index ? promoted : episode) : [...currentEpisodes, promoted];
  return { episodeId: candidate.id, operation: existing ? "update" : "insert", fields, episodes };
}

export function validatePromotionPatch(patch: PromotionPatch, approvedArtifact: ApprovedPublicEpisodeArtifact): string[] {
  const errors: string[] = [];
  if (patch.episodeId !== approvedArtifact.approval.episodeId) errors.push("El patch no corresponde al episodio aprobado.");
  if (patch.episodes.filter((episode) => episode.id === patch.episodeId).length !== 1) errors.push("El patch debe contener exactamente un episodio con el ID técnico aprobado.");
  if (patch.fields.some((change) => !PROMOTED_EPISODE_FIELDS.includes(change.field))) errors.push("El patch incluye un campo fuera de la whitelist.");
  return errors;
}

/** Pure alias used by callers that have already reviewed and validated a patch. */
export function applyPromotionPatch(currentEpisodes: readonly Episode[], approvedArtifact: ApprovedPublicEpisodeArtifact): readonly Episode[] {
  const patch = buildEpisodesPatch(currentEpisodes, approvedArtifact);
  const errors = validatePromotionPatch(patch, approvedArtifact);
  if (errors.length) throw new Error(errors.join(" "));
  return patch.episodes;
}

export function promotionPatchStatus(preview: Pick<PromotionPreview, "episodesHash" | "artifactFile" | "artifactVersion" | "episodeId">, currentEpisodesSource: string, newestVersion: number): PromotionPatchStatus {
  if (!validEpisodeId(preview.episodeId) || !artifactName(preview.artifactFile)) return "invalid";
  if (sha256(currentEpisodesSource) !== preview.episodesHash) return "stale_base";
  if (newestVersion > preview.artifactVersion) return "stale_artifact";
  return "ready";
}

function decodeToken(token: string): Omit<PromotionPreview, "patch"> {
  try { return JSON.parse(Buffer.from(token, "base64url").toString("utf8")) as Omit<PromotionPreview, "patch">; } catch { throw new Error("El token de preview no es válido."); }
}

function encodeToken(preview: Omit<PromotionPreview, "token" | "patch">): string { return Buffer.from(JSON.stringify(preview)).toString("base64url"); }

function parseEpisodes(source: string): Episode[] {
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const cjsModule = { exports: {} as { episodes?: Episode[] } };
  // The source is the fixed local data/episodes.ts file, never client supplied.
  new Function("exports", "module", compiled)(cjsModule.exports, cjsModule);
  if (!Array.isArray(cjsModule.exports.episodes)) throw new Error("data/episodes.ts no exporta un array episodes válido.");
  return cjsModule.exports.episodes;
}

type EpisodesSourceLocation = {
  array: ts.ArrayLiteralExpression;
  sourceFile: ts.SourceFile;
  episode?: ts.ObjectLiteralExpression;
  eol: "\n" | "\r\n";
};

function dominantEol(source: string): "\n" | "\r\n" {
  const crlf = (source.match(/\r\n/g) ?? []).length;
  const lf = (source.match(/(?<!\r)\n/g) ?? []).length;
  return crlf > lf ? "\r\n" : "\n";
}

function propertyName(property: ts.ObjectLiteralElementLike): string | undefined {
  if (!ts.isPropertyAssignment(property) || !property.name) return undefined;
  return ts.isIdentifier(property.name) || ts.isStringLiteral(property.name) ? property.name.text : undefined;
}

function episodeIdFromObject(object: ts.ObjectLiteralExpression): string | undefined {
  const id = object.properties.find((property) => propertyName(property) === "id");
  return id && ts.isPropertyAssignment(id) && ts.isStringLiteral(id.initializer) ? id.initializer.text : undefined;
}

/** Finds the exported `episodes` array and, when present, its exact target object range. */
function locateEpisodesSource(source: string, episodeId: string): EpisodesSourceLocation {
  const sourceFile = ts.createSourceFile("episodes.ts", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const declarations: ts.VariableDeclaration[] = [];
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement) || !statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue;
    for (const declaration of statement.declarationList.declarations) if (ts.isIdentifier(declaration.name) && declaration.name.text === "episodes") declarations.push(declaration);
  }
  if (declarations.length !== 1 || !declarations[0].initializer || !ts.isArrayLiteralExpression(declarations[0].initializer)) throw new Error("No se pudo reconocer con seguridad el array exportado `episodes` en data/episodes.ts.");
  const array = declarations[0].initializer;
  if (array.elements.some((element) => !ts.isObjectLiteralExpression(element))) throw new Error("El array exportado `episodes` contiene una estructura no compatible con la promoción localizada.");
  const matches = array.elements.filter(ts.isObjectLiteralExpression).filter((element) => episodeIdFromObject(element) === episodeId);
  if (matches.length > 1) throw new Error("data/episodes.ts contiene más de un episodio con el mismo ID técnico.");
  return { array, sourceFile, episode: matches[0], eol: dominantEol(source) };
}

function lineIndent(source: string, position: number): string {
  const start = Math.max(source.lastIndexOf("\n", position - 1), source.lastIndexOf("\r", position - 1)) + 1;
  return /^[\t ]*/.exec(source.slice(start, position))?.[0] ?? "";
}

function serializeEpisodeObject(episode: Episode, indent: string, eol: "\n" | "\r\n"): string {
  // JSON is valid TypeScript expression syntax. It deliberately formats only the promoted object,
  // never the surrounding source file or neighbouring episodes.
  const serialized = JSON.stringify(episode, null, 2);
  if (!serialized) throw new Error("No se pudo serializar el episodio para la promoción localizada.");
  return serialized.split("\n").map((line) => `${indent}${line}`).join(eol);
}

function objectTextRange(object: ts.ObjectLiteralExpression, sourceFile: ts.SourceFile): { start: number; end: number } {
  const first = object.getFirstToken(sourceFile);
  if (!first || first.kind !== ts.SyntaxKind.OpenBraceToken) throw new Error("No se pudo localizar el bloque de texto del episodio con seguridad.");
  const start = first.getStart(sourceFile);
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.Standard, sourceFile.text);
  scanner.setTextPos(start);
  let depth = 0;
  for (;;) {
    const token = scanner.scan();
    if (token === ts.SyntaxKind.EndOfFileToken) break;
    if (token === ts.SyntaxKind.OpenBraceToken) depth += 1;
    if (token === ts.SyntaxKind.CloseBraceToken) {
      depth -= 1;
      if (depth === 0) return { start, end: scanner.getTokenPos() + scanner.getTokenText().length };
    }
  }
  throw new Error("No se pudo localizar el bloque de texto del episodio con seguridad.");
}

/** Replaces one object range or appends one object while preserving all unrelated source text. */
function patchEpisodesSource(source: string, patch: PromotionPatch): string {
  const location = locateEpisodesSource(source, patch.episodeId);
  const promoted = patch.episodes.find((episode) => episode.id === patch.episodeId);
  if (!promoted) throw new Error("El patch localizado no contiene el episodio aprobado.");

  if (patch.operation === "update") {
    if (!location.episode) throw new Error("El episodio a actualizar no se encontró en data/episodes.ts.");
    const { start, end } = objectTextRange(location.episode, location.sourceFile);
    return `${source.slice(0, start)}${serializeEpisodeObject(promoted, lineIndent(source, start), location.eol)}${source.slice(end)}`;
  }

  if (location.episode) throw new Error("El episodio ya existe; no se puede insertarlo dos veces.");
  const closeBracket = location.array.getEnd() - 1;
  const arrayIndent = lineIndent(source, location.array.getStart(location.sourceFile));
  const elements = location.array.elements;
  const objectIndent = elements.length ? lineIndent(source, elements[0].getStart(location.sourceFile)) : `${arrayIndent}  `;
  const lastRange = elements.length ? objectTextRange(elements[elements.length - 1] as ts.ObjectLiteralExpression, location.sourceFile) : undefined;
  const hasTrailingComma = !!lastRange && /^\s*,/.test(source.slice(lastRange.end, closeBracket));
  const closeIndent = lineIndent(source, closeBracket);
  const lastEnd = lastRange?.end ?? location.array.getStart(location.sourceFile) + 1;
  // Preserve comments/blank lines between the final existing element and `]` verbatim. The
  // only punctuation changed is the separator required to add the new array element.
  const beforeLastTail = source.slice(0, lastEnd);
  const tail = source.slice(lastEnd, closeBracket);
  const suffix = source.slice(closeBracket + 1);
  const existingSeparator = elements.length && !hasTrailingComma ? "," : "";
  const tailEndsWithLineBreak = /(?:\r\n|\n)$/.test(tail);
  const beforeObject = tailEndsWithLineBreak ? tail : `${tail}${location.eol}`;
  const trailingComma = hasTrailingComma ? "," : "";
  return `${beforeLastTail}${existingSeparator}${beforeObject}${serializeEpisodeObject(promoted, objectIndent, location.eol)}${trailingComma}${location.eol}${closeIndent}]${suffix}`;
}

async function newestApprovedVersion(directory: string, episodeId: string): Promise<number> {
  const { readdir } = await import("node:fs/promises");
  try { return (await readdir(directory)).filter((name) => artifactName(name) && name.includes(`--${episodeId}_v`)).reduce((latest, name) => Math.max(latest, artifactVersion(name)), 0); } catch { return 0; }
}

export async function findLatestApprovedPromotionArtifact(episodeId: string, options: Pick<PromotionFileOptions, "approvedDirectory"> = {}): Promise<string | undefined> {
  if (!validEpisodeId(episodeId)) return undefined;
  const directory = options.approvedDirectory ?? DEFAULT_APPROVED_PROMOTIONS_DIRECTORY;
  const { readdir } = await import("node:fs/promises");
  try {
    return (await readdir(directory)).filter((name) => artifactName(name) && name.includes(`--${episodeId}_v`)).sort((left, right) => artifactVersion(right) - artifactVersion(left))[0];
  } catch { return undefined; }
}

export async function createPromotionPreview(fileName: string, options: PromotionFileOptions = {}): Promise<PromotionPreview> {
  const artifact = await loadApprovedPromotionArtifact(fileName, options);
  const episodesFile = options.episodesFile ?? DEFAULT_EPISODES_FILE;
  const source = await readFile(episodesFile, "utf8");
  const patch = buildEpisodesPatch(parseEpisodes(source), artifact);
  const preview = { artifactFile: artifact.fileName, artifactVersion: artifact.approval.version, episodeId: artifact.approval.episodeId, episodesHash: sha256(source) };
  return { ...preview, token: encodeToken(preview), patch };
}

export function isPromotionWriteAvailable(environment: NodeJS.ProcessEnv = process.env): boolean {
  return environment.NODE_ENV !== "production" && environment.VERCEL !== "1" && environment.ENABLE_EDITOR === "true";
}

export async function persistPromotionPreview(token: string, options: PromotionFileOptions = {}): Promise<{ operation: "insert" | "update"; backupFile: string }> {
  const environment = options.environment ?? process.env;
  if (!isPromotionWriteAvailable(environment)) throw new Error("La promoción pública solo puede aplicarse en desarrollo local con el editor habilitado.");
  const preview = decodeToken(token);
  const episodesFile = options.episodesFile ?? DEFAULT_EPISODES_FILE;
  const approvedDirectory = options.approvedDirectory ?? DEFAULT_APPROVED_PROMOTIONS_DIRECTORY;
  const source = await readFile(episodesFile, "utf8");
  const status = promotionPatchStatus(preview, source, await newestApprovedVersion(approvedDirectory, preview.episodeId));
  if (status !== "ready") throw new Error(status === "stale_base" ? "data/episodes.ts cambió; regenera el preview." : "Existe un artefacto aprobado más reciente; regenera el preview.");
  const artifact = await loadApprovedPromotionArtifact(preview.artifactFile, { approvedDirectory });
  if (artifact.approval.version !== preview.artifactVersion || artifact.approval.episodeId !== preview.episodeId) throw new Error("El artefacto del preview ya no coincide.");
  const patch = buildEpisodesPatch(parseEpisodes(source), artifact);
  const errors = validatePromotionPatch(patch, artifact);
  if (errors.length) throw new Error(errors.join(" "));
  const timestamp = (options.now ?? new Date()).toISOString().replace(/[:.]/g, "-");
  const backupFile = `${episodesFile}.backup-${timestamp}`;
  await copyFile(episodesFile, backupFile);
  const temporary = `${episodesFile}.tmp-${process.pid}-${Date.now()}`;
  const localizedSource = patchEpisodesSource(source, patch);
  try { await mkdir(path.dirname(episodesFile), { recursive: true }); await writeFile(temporary, localizedSource, "utf8"); await rename(temporary, episodesFile); } catch (error) { await import("node:fs/promises").then(({ rm }) => rm(temporary, { force: true })); throw error; }
  return { operation: patch.operation, backupFile };
}

export const __test__ = { parseEpisodes, locateEpisodesSource, objectTextRange, patchEpisodesSource, serializeEpisodeObject, newestApprovedVersion };
