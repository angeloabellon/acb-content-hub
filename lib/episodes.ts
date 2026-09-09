import { episodes } from "@/data/episodes";
import {
  getImportedEpisodeById as findImportedEpisodeById,
  loadImportedEpisodeManifests,
  type ImportedEpisodeManifestResult,
} from "@/lib/episode-manifest-importer";
import type { Episode } from "@/types/episode";

export function getEpisodes(): readonly Episode[] {
  return episodes;
}

export function getEpisodeBySlug(slug: string): Episode | undefined {
  return episodes.find((episode) => episode.slug === slug);
}

export function getEpisodeById(id: string): Episode | undefined {
  return episodes.find((episode) => episode.id === id);
}

/**
 * Separate opt-in access to the future imported source. Pages still use the
 * manual helpers above until a real export has been validated.
 */
export async function getImportedEpisodes(): Promise<ImportedEpisodeManifestResult[]> {
  return loadImportedEpisodeManifests();
}

export async function getImportedEpisodeById(id: string): Promise<Episode | undefined> {
  return findImportedEpisodeById(await loadImportedEpisodeManifests(), id);
}
