import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import {
  EpisodeManifestValidationError,
  episodeFromManifest,
  parseEpisodeManifest,
  type EpisodeManifestDiagnostic,
} from "./episode-manifest-adapter.ts";
import type { Episode } from "../types/episode.ts";

/** The only directory this importer reads. It is deliberately non-recursive. */
export const IMPORTED_EPISODE_MANIFESTS_DIRECTORY = path.join(process.cwd(), "data", "manifests");

export type EpisodeManifestImportStatus = "imported" | "partial" | "error" | "duplicate";

export type EpisodeManifestImportDiagnostic = EpisodeManifestDiagnostic | {
  code: "invalid_json" | "invalid_manifest" | "duplicate_id" | "manual_conflict";
  field: string;
  message: string;
};

export type ImportedEpisodeManifestResult = {
  episode?: Episode;
  diagnostics: EpisodeManifestImportDiagnostic[];
  /** File name relative to data/manifests, never an external or arbitrary path. */
  source: string;
  status: EpisodeManifestImportStatus;
};

export type EpisodeManifestImportSource = {
  source: string;
  contents: string;
};

export type EpisodeMergePolicy = "manual-wins" | "imported-wins";

export type EpisodeMergeConflict = {
  id: string;
  message: string;
  importedSource: string;
};

export type MergedEpisodesResult = {
  episodes: Episode[];
  conflicts: EpisodeMergeConflict[];
};

function validationDiagnostic(error: unknown): EpisodeManifestImportDiagnostic {
  const message = error instanceof Error ? error.message : "The manifest could not be validated.";
  return {
    code: error instanceof EpisodeManifestValidationError ? "invalid_manifest" : "invalid_manifest",
    field: "manifest",
    message,
  };
}

/**
 * Converts already-read, repository-controlled manifest contents one by one.
 * It deliberately does not accept filesystem paths: disk access belongs solely
 * to loadImportedEpisodeManifests().
 */
export function importEpisodeManifestSources(
  sources: readonly EpisodeManifestImportSource[],
): ImportedEpisodeManifestResult[] {
  const results: ImportedEpisodeManifestResult[] = [];
  const importedIds = new Set<string>();

  for (const source of sources) {
    let raw: unknown;
    try {
      raw = JSON.parse(source.contents);
    } catch {
      results.push({
        source: source.source,
        status: "error",
        diagnostics: [{ code: "invalid_json", field: "manifest", message: "The file is not valid JSON." }],
      });
      continue;
    }

    try {
      const converted = episodeFromManifest(parseEpisodeManifest(raw));
      if (importedIds.has(converted.partial.id)) {
        results.push({
          source: source.source,
          status: "duplicate",
          diagnostics: [{
            code: "duplicate_id",
            field: "episodio.id",
            message: `Duplicate imported episode id ${converted.partial.id}. The first file remains the candidate.`,
          }],
        });
        continue;
      }

      importedIds.add(converted.partial.id);
      results.push({
        source: source.source,
        status: converted.episode ? "imported" : "partial",
        episode: converted.episode,
        diagnostics: converted.diagnostics,
      });
    } catch (error) {
      results.push({ source: source.source, status: "error", diagnostics: [validationDiagnostic(error)] });
    }
  }

  return results;
}

/**
 * Loads only direct .json files in data/manifests. A broken or unreadable file
 * is returned as an error result and cannot prevent other files from loading.
 */
export async function loadImportedEpisodeManifests(): Promise<ImportedEpisodeManifestResult[]> {
  let entries: string[];
  try {
    entries = (await readdir(IMPORTED_EPISODE_MANIFESTS_DIRECTORY, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => entry.name)
      .sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    return [{ source: "data/manifests", status: "error", diagnostics: [validationDiagnostic(error)] }];
  }

  const sources = await Promise.all(entries.map(async (entry) => {
    try {
      return { source: `data/manifests/${entry}`, contents: await readFile(path.join(IMPORTED_EPISODE_MANIFESTS_DIRECTORY, entry), "utf8") };
    } catch (error) {
      return { source: `data/manifests/${entry}`, contents: "", readError: error };
    }
  }));

  const readable = sources.filter((source): source is EpisodeManifestImportSource => !("readError" in source));
  const results = importEpisodeManifestSources(readable);
  for (const source of sources) {
    if ("readError" in source) {
      results.push({ source: source.source, status: "error", diagnostics: [validationDiagnostic(source.readError)] });
    }
  }
  return results.sort((left, right) => left.source.localeCompare(right.source));
}

export function getImportedEpisodeById(
  imports: readonly ImportedEpisodeManifestResult[],
  id: string,
): Episode | undefined {
  return imports.find((item) => item.status === "imported" && item.episode?.id === id)?.episode;
}

/**
 * Future-only resolution helper. It never merges fields across sources.
 * The default preserves today's manual data; callers must opt in to imported
 * precedence once a real Automation export has been verified.
 */
export function resolveEpisodesWithImportedManifests(
  manualEpisodes: readonly Episode[],
  imports: readonly ImportedEpisodeManifestResult[],
  policy: EpisodeMergePolicy = "manual-wins",
): MergedEpisodesResult {
  const resolved = new Map(manualEpisodes.map((episode) => [episode.id, episode]));
  const conflicts: EpisodeMergeConflict[] = [];

  for (const item of imports) {
    if (item.status !== "imported" || !item.episode) continue;
    const manual = resolved.get(item.episode.id);
    if (!manual) {
      resolved.set(item.episode.id, item.episode);
      continue;
    }
    conflicts.push({
      id: item.episode.id,
      importedSource: item.source,
      message: `Imported episode ${item.episode.id} conflicts with manual data; ${policy} was applied without field-level merging.`,
    });
    if (policy === "imported-wins") resolved.set(item.episode.id, item.episode);
  }

  return { episodes: [...resolved.values()], conflicts };
}
