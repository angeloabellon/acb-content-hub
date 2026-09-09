import type {
  Episode,
  EpisodeKind,
  EpisodeParticipant,
  EpisodePlatform,
  EpisodePlatformLinks,
} from "@/types/episode";

/**
 * Boundary contract for the read-only web projection of CTC Automation's
 * <ID>_EPISODIO.json manifests.
 *
 * This repository does not yet contain a real Automation manifest. These are
 * therefore the only fields this adapter reads; unknown fields are deliberately
 * ignored. The contract must be reconciled with a real exported manifest before
 * enabling an importer.
 */
export const SUPPORTED_EPISODE_MANIFEST_SCHEMAS = ["1.0", "1.1"] as const;

export type SupportedEpisodeManifestSchema =
  (typeof SUPPORTED_EPISODE_MANIFEST_SCHEMAS)[number];

export type EpisodeManifestDiagnosticCode =
  | "missing_field"
  | "invalid_field"
  | "conflict";

export type EpisodeManifestDiagnostic = {
  code: EpisodeManifestDiagnosticCode;
  field: string;
  message: string;
};

export type ParsedEpisodeManifest = {
  schemaVersion: SupportedEpisodeManifestSchema;
  id: string;
  kind?: EpisodeKind;
  season?: number;
  episodeNumber?: number;
  title?: string;
  description?: string;
  date?: string;
  participants?: EpisodeParticipant[];
  thumbnail?: string;
  platforms?: EpisodePlatformLinks;
  diagnostics: EpisodeManifestDiagnostic[];
};

export type EpisodeEditorialOverrides = Partial<
  Pick<
    Episode,
    | "slug"
    | "title"
    | "description"
    | "date"
    | "thumbnail"
    | "participants"
    | "transcript"
    | "subtitles"
    | "derivedPieces"
    | "relatedContent"
  >
>;

export type EpisodeFromManifestResult = {
  /** Present only when all public Episode fields can be supplied. */
  episode?: Episode;
  /** Non-invented values available even when a public Episode cannot be built. */
  partial: Omit<Partial<Episode>, "id"> & Pick<Episode, "id">;
  diagnostics: EpisodeManifestDiagnostic[];
};

export class EpisodeManifestValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EpisodeManifestValidationError";
  }
}

type JsonObject = Record<string, unknown>;

const PLATFORM_KEYS: Record<string, EpisodePlatform> = {
  youtube: "youtube",
  ivoox: "ivoox",
  apple_podcasts: "applePodcasts",
  spotify: "spotify",
};

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalText(value: unknown, field: string, diagnostics: EpisodeManifestDiagnostic[]) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") {
    diagnostics.push({ code: "invalid_field", field, message: `${field} must be text.` });
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed || undefined;
}

function optionalPositiveInteger(
  value: unknown,
  field: string,
  diagnostics: EpisodeManifestDiagnostic[],
) {
  if (value === undefined || value === null) return undefined;
  if (!Number.isInteger(value) || (value as number) < 1) {
    diagnostics.push({ code: "invalid_field", field, message: `${field} must be a positive integer.` });
    return undefined;
  }
  return value as number;
}

function optionalDate(value: unknown, diagnostics: EpisodeManifestDiagnostic[]) {
  const date = optionalText(value, "episodio.fecha", diagnostics);
  if (!date) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
    diagnostics.push({ code: "invalid_field", field: "episodio.fecha", message: "episodio.fecha must use YYYY-MM-DD." });
    return undefined;
  }
  return date;
}

function normalizeKind(value: unknown, diagnostics: EpisodeManifestDiagnostic[]): EpisodeKind | undefined {
  const type = optionalText(value, "episodio.tipo", diagnostics)?.toLowerCase();
  if (!type) return undefined;

  const kinds: Record<string, EpisodeKind> = {
    regular: "episode",
    episodio: "episode",
    episode: "episode",
    especial: "special",
    special: "special",
    entrevista: "interview",
    interview: "interview",
  };
  const kind = kinds[type];
  if (!kind) {
    diagnostics.push({
      code: "invalid_field",
      field: "episodio.tipo",
      message: "episodio.tipo must be regular, especial, or entrevista.",
    });
  }
  return kind;
}

function parseParticipants(value: unknown, diagnostics: EpisodeManifestDiagnostic[]) {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) {
    diagnostics.push({ code: "invalid_field", field: "episodio.participantes", message: "episodio.participantes must be an array." });
    return undefined;
  }

  return value.flatMap((participant, index) => {
    if (!isObject(participant)) {
      diagnostics.push({ code: "invalid_field", field: `episodio.participantes[${index}]`, message: "A participant must be an object." });
      return [];
    }
    const name = optionalText(participant.nombre, `episodio.participantes[${index}].nombre`, diagnostics);
    if (!name) {
      diagnostics.push({ code: "invalid_field", field: `episodio.participantes[${index}].nombre`, message: "A participant needs a name." });
      return [];
    }
    const role = optionalText(participant.rol, `episodio.participantes[${index}].rol`, diagnostics);
    return [{ name, ...(role ? { role } : {}) }];
  });
}

function isPublicUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function parsePlatforms(value: unknown, diagnostics: EpisodeManifestDiagnostic[]) {
  if (value === undefined || value === null) return undefined;
  if (!isObject(value)) {
    diagnostics.push({ code: "invalid_field", field: "publicacion.plataformas", message: "publicacion.plataformas must be an object." });
    return undefined;
  }
  const platforms: EpisodePlatformLinks = {};
  for (const [manifestKey, platform] of Object.entries(PLATFORM_KEYS)) {
    const url = optionalText(value[manifestKey], `publicacion.plataformas.${manifestKey}`, diagnostics);
    if (!url) continue;
    if (!isPublicUrl(url)) {
      diagnostics.push({ code: "invalid_field", field: `publicacion.plataformas.${manifestKey}`, message: "Platform URLs must be public http(s) URLs." });
      continue;
    }
    platforms[platform] = url;
  }
  return Object.keys(platforms).length ? platforms : undefined;
}

function stableSlug(id: string, title?: string) {
  const source = title || id;
  const normalized = source
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return normalized || id.toLowerCase();
}

/** Validates the supported, read-only projection without coercing schema versions. */
export function parseEpisodeManifest(input: unknown): ParsedEpisodeManifest {
  if (!isObject(input)) throw new EpisodeManifestValidationError("Episode manifest must be a JSON object.");

  const schemaVersion = input.schema_version;
  if (typeof schemaVersion !== "string" || !SUPPORTED_EPISODE_MANIFEST_SCHEMAS.includes(schemaVersion as SupportedEpisodeManifestSchema)) {
    throw new EpisodeManifestValidationError(
      `Unsupported schema_version ${JSON.stringify(schemaVersion)}. Supported versions: ${SUPPORTED_EPISODE_MANIFEST_SCHEMAS.join(", ")}.`,
    );
  }
  if (!isObject(input.episodio)) throw new EpisodeManifestValidationError("Episode manifest requires an episodio object.");

  const diagnostics: EpisodeManifestDiagnostic[] = [];
  const id = optionalText(input.episodio.id, "episodio.id", diagnostics);
  if (!id) throw new EpisodeManifestValidationError("Episode manifest requires episodio.id.");

  const publication = isObject(input.publicacion) ? input.publicacion : undefined;
  const thumbnail = publication ? optionalText(publication.thumbnail, "publicacion.thumbnail", diagnostics) : undefined;
  if (thumbnail && !isPublicUrl(thumbnail)) {
    diagnostics.push({ code: "invalid_field", field: "publicacion.thumbnail", message: "Thumbnail must be a public http(s) URL." });
  }

  return {
    schemaVersion: schemaVersion as SupportedEpisodeManifestSchema,
    id,
    kind: normalizeKind(input.episodio.tipo, diagnostics),
    season: optionalPositiveInteger(input.episodio.temporada, "episodio.temporada", diagnostics),
    episodeNumber: optionalPositiveInteger(input.episodio.numero, "episodio.numero", diagnostics),
    title: optionalText(input.episodio.titulo, "episodio.titulo", diagnostics),
    description: optionalText(input.episodio.descripcion, "episodio.descripcion", diagnostics),
    date: optionalDate(input.episodio.fecha, diagnostics),
    participants: parseParticipants(input.episodio.participantes, diagnostics),
    thumbnail: thumbnail && isPublicUrl(thumbnail) ? thumbnail : undefined,
    platforms: publication ? parsePlatforms(publication.plataformas, diagnostics) : undefined,
    diagnostics,
  };
}

/**
 * Manifest wins for identity, kind, season, episode number and public URLs.
 * Web overrides win for presentation: slug, copy, image and optional modules.
 * A missing manifest field remains missing unless an override supplies it.
 */
export function episodeFromManifest(
  manifest: ParsedEpisodeManifest,
  overrides: EpisodeEditorialOverrides = {},
): EpisodeFromManifestResult {
  const diagnostics = [...manifest.diagnostics];
  const partial: EpisodeFromManifestResult["partial"] = {
    id: manifest.id,
    kind: manifest.kind,
    season: manifest.season,
    episodeNumber: manifest.episodeNumber,
    slug: overrides.slug || stableSlug(manifest.id, overrides.title || manifest.title),
    title: overrides.title || manifest.title,
    description: overrides.description || manifest.description,
    date: manifest.date || overrides.date,
    thumbnail: overrides.thumbnail || manifest.thumbnail,
    participants: overrides.participants || manifest.participants,
    platforms: manifest.platforms || {},
    transcript: overrides.transcript,
    subtitles: overrides.subtitles,
    derivedPieces: overrides.derivedPieces,
    relatedContent: overrides.relatedContent,
  };

  for (const field of ["kind", "title", "description", "date", "thumbnail"] as const) {
    if (!partial[field]) {
      diagnostics.push({ code: "missing_field", field, message: `${field} is not available from the manifest or web overrides.` });
    }
  }

  const episode =
    partial.kind && partial.title && partial.description && partial.date && partial.thumbnail
      ? ({ ...partial, participants: partial.participants || [], platforms: partial.platforms || {} } as Episode)
      : undefined;

  return { episode, partial, diagnostics };
}
