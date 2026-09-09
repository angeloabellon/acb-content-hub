import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { validateChapters, type ChapterValidationDiagnostic } from "./chapters.ts";
import type { Chapter } from "../types/chapter.ts";
import type { Transcript } from "../types/transcript.ts";

export type ChapterEditorStorageResult =
  | { ok: true; filePath: string }
  | { ok: false; reason: "not_writable_environment" | "invalid_identifier" | "invalid_chapters" | "conflict" | "write_failed"; diagnostics?: readonly ChapterValidationDiagnostic[] };

export type PersistApprovedChaptersOptions = {
  /** Tests may use an isolated directory; runtime always uses the repository path. */
  baseDirectory?: string;
  environment?: NodeJS.ProcessEnv;
  allowVersionedFile?: boolean;
};

export function isChapterEditorStorageAvailable(environment: NodeJS.ProcessEnv = process.env): boolean {
  return environment.NODE_ENV !== "production" && environment.ENABLE_EDITOR === "true";
}

export function getSafeChapterFileName(episodeId: string, slug: string): string | undefined {
  if (!/^[A-Za-z0-9_-]+$/.test(episodeId) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return undefined;
  return `${slug}--${episodeId}.json`;
}

function getStorageDirectory(baseDirectory?: string): string {
  return baseDirectory ?? path.resolve("data/chapters/generated");
}

async function resolveAvailableTarget(directory: string, fileName: string, allowVersionedFile: boolean): Promise<string | undefined> {
  const parsed = path.parse(fileName);
  for (let version = 1; version < 1000; version += 1) {
    const candidate = version === 1 ? fileName : `${parsed.name}-v${version}${parsed.ext}`;
    const target = path.resolve(directory, candidate);
    if (!target.startsWith(`${path.resolve(directory)}${path.sep}`)) return undefined;
    try {
      await access(target);
      if (!allowVersionedFile) return undefined;
    } catch {
      return target;
    }
  }
  return undefined;
}

export async function persistApprovedChapters(
  { episodeId, slug, chapters, transcript }: { episodeId: string; slug: string; chapters: readonly Chapter[]; transcript: Transcript },
  options: PersistApprovedChaptersOptions = {},
): Promise<ChapterEditorStorageResult> {
  const environment = options.environment ?? process.env;
  if (!isChapterEditorStorageAvailable(environment)) return { ok: false, reason: "not_writable_environment" };
  const fileName = getSafeChapterFileName(episodeId, slug);
  if (!fileName) return { ok: false, reason: "invalid_identifier" };

  const diagnostics = validateChapters(chapters, { episodeId, transcript });
  if (!chapters.length || diagnostics.length) return { ok: false, reason: "invalid_chapters", diagnostics };

  const directory = getStorageDirectory(options.baseDirectory);
  const target = await resolveAvailableTarget(directory, fileName, options.allowVersionedFile ?? false);
  if (!target) return { ok: false, reason: options.allowVersionedFile ? "write_failed" : "conflict" };

  const document = {
    episodeId,
    generatedAt: new Date().toISOString(),
    source: "chapter-editor-ui",
    reviewed: true,
    version: 1,
    chapters,
  };
  try {
    await mkdir(directory, { recursive: true });
    // wx prevents a second editor request from silently replacing an output.
    await writeFile(target, `${JSON.stringify(document, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
    return { ok: true, filePath: target };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") return { ok: false, reason: "conflict" };
    return { ok: false, reason: "write_failed" };
  }
}
