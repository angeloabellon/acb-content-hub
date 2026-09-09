import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { getChaptersByEpisodeId, validateChapters } from "./chapters.ts";
import { getSafeChapterFileName } from "./chapter-editor-storage.ts";
import type { ImportedEpisodeManifestResult } from "./episode-manifest-importer.ts";
import type { TranscriptImportResult } from "./transcript-importer.ts";
import { getTranscriptByEpisodeId } from "./transcripts.ts";
import type { Chapter } from "../types/chapter.ts";
import type { Episode, EpisodePlatform } from "../types/episode.ts";
import type { Transcript } from "../types/transcript.ts";

export type EditorialStatus = "no-disponible" | "demo" | "importada" | "valida" | "parcial" | "invalida";
export type EditorialBadgeTone = "neutral" | "warning" | "success" | "danger" | "development";

export type EditorialStatusDetail = {
  label: string;
  tone: EditorialBadgeTone;
  detail: string;
};

export type LocalChapterDocument = {
  episodeId: string;
  chapters: readonly Chapter[];
  source?: string;
  reviewed?: boolean;
  version?: number;
};

export type LocalChapterSource = {
  fileName: string;
  chapterCount: number;
  valid: boolean;
  diagnostics: readonly string[];
};

export type EpisodeEditorialSummary = {
  episode: Episode;
  transcript: {
    status: EditorialStatus;
    statusDetail: EditorialStatusDetail;
    segmentCount: number;
    language?: string;
    hasTimestamps: boolean;
    version?: string;
    hash?: string;
    source?: string;
    diagnostics: readonly string[];
  };
  chapters: {
    publishedCount: number;
    localCount: number;
    localSources: readonly LocalChapterSource[];
    hasProposals: boolean;
    statusDetail: EditorialStatusDetail;
  };
  publication: {
    available: ReadonlyArray<{ platform: EpisodePlatform; label: string; url: string }>;
    missing: readonly EpisodePlatform[];
  };
  diagnostics: {
    manifests: ReadonlyArray<{ source: string; status: string; messages: readonly string[] }>;
    transcripts: ReadonlyArray<{ source: string; status: string; messages: readonly string[] }>;
    warnings: readonly string[];
  };
};

export type EpisodeEditorialSummaryOptions = {
  transcript?: Transcript;
  importedTranscripts?: readonly TranscriptImportResult[];
  importedManifests?: readonly ImportedEpisodeManifestResult[];
  publishedChapters?: readonly Chapter[];
  localChapters?: readonly LocalChapterSource[];
};

const platformLabels: Record<EpisodePlatform, string> = {
  youtube: "YouTube",
  ivoox: "iVoox",
  applePodcasts: "Apple Podcasts",
  spotify: "Spotify",
};
const platforms = Object.keys(platformLabels) as EpisodePlatform[];

function statusDetail(status: EditorialStatus): EditorialStatusDetail {
  const details: Record<EditorialStatus, EditorialStatusDetail> = {
    "no-disponible": { label: "No disponible", tone: "neutral", detail: "No hay una transcripción conectada a este episodio." },
    demo: { label: "Demo técnica", tone: "development", detail: "Fixture de desarrollo; no debe tratarse como contenido editorial real." },
    importada: { label: "Importada", tone: "warning", detail: "Fuente importada pendiente de una resolución editorial." },
    valida: { label: "Válida", tone: "success", detail: "La importación pasó la validación técnica." },
    parcial: { label: "Parcial", tone: "warning", detail: "La fuente existe, pero contiene información incompleta." },
    invalida: { label: "Inválida", tone: "danger", detail: "La fuente tiene errores y no está disponible para publicación." },
  };
  return details[status];
}

function transcriptStatus(transcript: Transcript | undefined, imports: readonly TranscriptImportResult[]) {
  const imported = imports.filter((item) => item.transcript?.episodeId === transcript?.episodeId || item.source.filename.includes(transcript?.episodeId ?? "__none__"));
  const validImport = imported.find((item) => item.status === "valid");
  const invalidImport = imported.find((item) => item.status === "invalid");
  if (transcript?.isDemo || transcript?.visibility === "development-only" && transcript?.source === "local-fixture") return "demo" as const;
  if (transcript?.segments.some((segment) => Number.isFinite(segment.startSeconds) !== Number.isFinite(segment.endSeconds))) return "parcial" as const;
  if (transcript) return validImport ? "importada" as const : "valida" as const;
  if (validImport) return "importada" as const;
  if (invalidImport) return "invalida" as const;
  return "no-disponible" as const;
}

function sourceDiagnostics<T extends { source: { filename: string }; status: string; diagnostics: readonly { message: string }[] }>(items: readonly T[], episodeId: string) {
  return items.filter((item) => item.source.filename.includes(episodeId)).map((item) => ({ source: item.source.filename, status: item.status, messages: item.diagnostics.map((diagnostic) => diagnostic.message) }));
}

/** Builds the serializable editorial read model; it never changes public data. */
export function createEpisodeEditorialSummary(episode: Episode, options: EpisodeEditorialSummaryOptions = {}): EpisodeEditorialSummary {
  const transcript = options.transcript;
  const importedTranscripts = options.importedTranscripts ?? [];
  const transcriptDiagnostics = sourceDiagnostics(importedTranscripts, episode.id);
  const status = transcriptStatus(transcript, importedTranscripts);
  const localSources = options.localChapters ?? [];
  const publishedChapters = options.publishedChapters ?? [];
  const localCount = localSources.reduce((sum, source) => sum + source.chapterCount, 0);
  const warnings = [
    ...localSources.filter((source) => !source.valid).flatMap((source) => source.diagnostics.map((diagnostic) => `${source.fileName}: ${diagnostic}`)),
    ...transcriptDiagnostics.flatMap((item) => item.status === "invalid" ? item.messages : []),
  ];
  const manifestDiagnostics = (options.importedManifests ?? []).map((item) => ({ source: item.source, status: item.status, messages: item.diagnostics.map((diagnostic) => diagnostic.message) }));
  const hasProposals = Boolean(transcript?.segments.length);

  return {
    episode,
    transcript: {
      status,
      statusDetail: statusDetail(status),
      segmentCount: transcript?.segments.length ?? 0,
      language: transcript?.language,
      hasTimestamps: Boolean(transcript?.segments.length && transcript.segments.every((segment) => Number.isFinite(segment.startSeconds) && Number.isFinite(segment.endSeconds))),
      version: transcript?.version,
      hash: importedTranscripts.find((item) => item.transcript?.episodeId === episode.id)?.source.sha256,
      source: transcript?.source,
      diagnostics: transcriptDiagnostics.flatMap((item) => item.messages),
    },
    chapters: {
      publishedCount: publishedChapters.length,
      localCount,
      localSources,
      hasProposals,
      statusDetail: localSources.some((source) => !source.valid)
        ? { label: "Revisión necesaria", tone: "warning", detail: "Hay archivos locales con diagnósticos." }
        : localCount || publishedChapters.length
          ? { label: "Disponibles", tone: "success", detail: "Hay capítulos locales o publicados para este episodio." }
          : { label: "No disponibles", tone: "neutral", detail: "Aún no hay capítulos guardados." },
    },
    publication: {
      available: platforms.flatMap((platform) => episode.platforms[platform] ? [{ platform, label: platformLabels[platform], url: episode.platforms[platform] }] : []),
      missing: platforms.filter((platform) => !episode.platforms[platform]),
    },
    diagnostics: { manifests: manifestDiagnostics, transcripts: transcriptDiagnostics, warnings },
  };
}

/** Reads only versioned chapter-editor documents from the controlled local directory. */
export async function loadLocalChapterSources(episode: Episode, baseDirectory = path.resolve("data/chapters/generated")): Promise<LocalChapterSource[]> {
  const baseName = getSafeChapterFileName(episode.id, episode.slug);
  if (!baseName) return [];
  const expected = new RegExp(`^${baseName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace("\\.json", "(?:-v\\d+)?\\.json")}$`);
  try {
    const entries = await readdir(baseDirectory, { withFileTypes: true });
    return (await Promise.all(entries.filter((entry) => entry.isFile() && expected.test(entry.name)).map(async (entry) => {
      try {
        const document = JSON.parse(await readFile(path.join(baseDirectory, entry.name), "utf8")) as LocalChapterDocument;
        const chapterList = Array.isArray(document.chapters) ? document.chapters : [];
        const diagnostics = document.episodeId === episode.id ? validateChapters(chapterList, { episodeId: episode.id }) : [{ message: "El episodio del archivo no coincide." }];
        return { fileName: entry.name, chapterCount: chapterList.length, valid: diagnostics.length === 0, diagnostics: diagnostics.map((diagnostic) => diagnostic.message) };
      } catch {
        return { fileName: entry.name, chapterCount: 0, valid: false, diagnostics: ["No se pudo leer el JSON de capítulos."] };
      }
    }))).sort((left, right) => left.fileName.localeCompare(right.fileName));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    return [{ fileName: "data/chapters/generated", chapterCount: 0, valid: false, diagnostics: ["No se pudo leer el directorio local de capítulos."] }];
  }
}

export async function getEpisodeEditorialSummary(episode: Episode, dependencies: {
  loadImportedTranscripts: () => Promise<TranscriptImportResult[]>;
  loadImportedManifests: () => Promise<ImportedEpisodeManifestResult[]>;
  loadLocalChapters?: () => Promise<LocalChapterSource[]>;
}): Promise<EpisodeEditorialSummary> {
  const [importedTranscripts, importedManifests, localChapters] = await Promise.all([
    dependencies.loadImportedTranscripts(), dependencies.loadImportedManifests(), dependencies.loadLocalChapters?.() ?? loadLocalChapterSources(episode),
  ]);
  return createEpisodeEditorialSummary(episode, { transcript: getTranscriptByEpisodeId(episode.id), importedTranscripts, importedManifests, publishedChapters: getChaptersByEpisodeId(episode.id), localChapters });
}
