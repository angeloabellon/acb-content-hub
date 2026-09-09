import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import type { Transcript, TranscriptSegment } from "../types/transcript.ts";

/** The only directory read by the repository transcript importer; it is never recursive. */
export const IMPORTED_TRANSCRIPTS_DIRECTORY = path.join(process.cwd(), "data", "transcripts", "source");

export type TranscriptImportStatus = "valid" | "partial" | "invalid";
export type TranscriptImportFormat = "txt" | "srt";

export type TranscriptImportDiagnostic = {
  code: "empty_input" | "invalid_episode_id" | "filename_mismatch" | "unsupported_filename" | "invalid_srt_index" | "invalid_srt_timestamp" | "invalid_srt_range" | "non_monotonic_srt" | "empty_srt_cue" | "invalid_transcript" | "read_error";
  message: string;
  line?: number;
  cue?: number;
};

export type TranscriptImportMetadata = {
  /** Required unless the controlled file name supplies the exact technical ID. */
  episodeId?: string;
  language?: string;
  source?: string;
  version?: string;
  visibility?: Transcript["visibility"];
  isDemo?: boolean;
};

export type TranscriptImportSource = {
  /** File name relative to data/transcripts/source, never a caller-provided path. */
  filename: string;
  format: TranscriptImportFormat;
  sha256: string;
  version?: string;
};

export type TranscriptImportResult = {
  transcript?: Transcript;
  diagnostics: TranscriptImportDiagnostic[];
  source: TranscriptImportSource;
  status: TranscriptImportStatus;
};

export type TranscriptFileImportInput = {
  filename: string;
  contents: string;
  metadata?: TranscriptImportMetadata;
};

type ParsedTranscript = { transcript?: Transcript; diagnostics: TranscriptImportDiagnostic[] };

const CONTROLLED_FILENAME = /^(?:DEMO_)?(CTC_T\d+E\d+)_(?:TRANSCRIPCION\.txt|SUBTITULOS\.srt)$/;

export function hashTranscriptContents(contents: string): string {
  return createHash("sha256").update(contents, "utf8").digest("hex");
}

function stableSegmentId(prefix: string, order: number, text: string): string {
  return `${prefix}-${String(order).padStart(3, "0")}-${hashTranscriptContents(text).slice(0, 12)}`;
}

function makeTranscript(metadata: TranscriptImportMetadata, segments: TranscriptSegment[]): Transcript {
  return {
    episodeId: metadata.episodeId ?? "",
    language: metadata.language ?? "es",
    source: metadata.source,
    version: metadata.version,
    // Imported files remain deliberately non-public until an editorial resolver is added.
    visibility: metadata.visibility ?? "development-only",
    isDemo: metadata.isDemo,
    segments,
  };
}

export function validateTranscript(transcript: Transcript): TranscriptImportDiagnostic[] {
  const diagnostics: TranscriptImportDiagnostic[] = [];
  if (!/^CTC_T\d+E\d+$/.test(transcript.episodeId)) {
    diagnostics.push({ code: "invalid_episode_id", message: "episodeId must use the exact CTC_T#E# technical identifier." });
  }
  if (!transcript.language.trim()) {
    diagnostics.push({ code: "invalid_transcript", message: "A transcript language is required." });
  }
  if (transcript.segments.length === 0) {
    diagnostics.push({ code: "empty_input", message: "The transcript contains no non-empty segments." });
  }
  transcript.segments.forEach((segment, index) => {
    if (!segment.id || !segment.text.trim()) {
      diagnostics.push({ code: "invalid_transcript", cue: index + 1, message: "Every transcript segment needs an id and non-empty text." });
    }
  });
  return diagnostics;
}

/** Parses paragraphs only. TXT never receives invented timings. */
export function parseTranscriptTxt(input: string, metadata: TranscriptImportMetadata): ParsedTranscript {
  const paragraphs = input.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n")
    .split(/\n[\t ]*\n+/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const transcript = makeTranscript(metadata, paragraphs.map((text, index) => ({
    id: stableSegmentId("txt", index + 1, text),
    text,
  })));
  const diagnostics = validateTranscript(transcript);
  return diagnostics.length ? { diagnostics } : { transcript, diagnostics };
}

function srtSeconds(timestamp: string): number {
  const match = /^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/.exec(timestamp);
  if (!match) return Number.NaN;
  const [, hours, minutes, seconds, milliseconds] = match;
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds) + Number(milliseconds) / 1000;
}

/** Strict SRT parser: each cue is an index, one timestamp line, and non-empty text. */
export function parseTranscriptSrt(input: string, metadata: TranscriptImportMetadata): ParsedTranscript {
  const normalized = input.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const lines = normalized.split("\n");
  const diagnostics: TranscriptImportDiagnostic[] = [];
  const segments: TranscriptSegment[] = [];
  let cursor = 0;
  let expectedIndex = 1;
  let previousStart = -1;

  while (cursor < lines.length) {
    while (cursor < lines.length && !lines[cursor].trim()) cursor += 1;
    if (cursor >= lines.length) break;
    const cueLine = cursor + 1;
    const indexLine = lines[cursor++].trim();
    if (indexLine !== String(expectedIndex)) {
      diagnostics.push({ code: "invalid_srt_index", cue: expectedIndex, line: cueLine, message: `Expected cue index ${expectedIndex}, received ${indexLine || "an empty value"}.` });
    }

    const timestampLine = cursor + 1;
    const timing = lines[cursor++] ?? "";
    const timingMatch = /^(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})$/.exec(timing);
    let start = Number.NaN;
    let end = Number.NaN;
    if (!timingMatch) {
      diagnostics.push({ code: "invalid_srt_timestamp", cue: expectedIndex, line: timestampLine, message: "Timestamp must be exactly HH:MM:SS,mmm --> HH:MM:SS,mmm." });
    } else {
      start = srtSeconds(timingMatch[1]);
      end = srtSeconds(timingMatch[2]);
      const [, startMinutes, startSeconds] = /^\d{2}:(\d{2}):(\d{2}),/.exec(timingMatch[1]) ?? [];
      const [, endMinutes, endSeconds] = /^\d{2}:(\d{2}):(\d{2}),/.exec(timingMatch[2]) ?? [];
      if (Number(startMinutes) > 59 || Number(endMinutes) > 59 || Number(startSeconds) > 59 || Number(endSeconds) > 59) {
        diagnostics.push({ code: "invalid_srt_timestamp", cue: expectedIndex, line: timestampLine, message: "Timestamp minutes and seconds must be below 60." });
      } else if (start >= end) {
        diagnostics.push({ code: "invalid_srt_range", cue: expectedIndex, line: timestampLine, message: "Cue start must be earlier than cue end." });
      } else if (start < previousStart) {
        diagnostics.push({ code: "non_monotonic_srt", cue: expectedIndex, line: timestampLine, message: "Cue start cannot move backwards in time." });
      }
    }

    const textLine = cursor + 1;
    const textLines: string[] = [];
    while (cursor < lines.length && lines[cursor].trim()) textLines.push(lines[cursor++].trimEnd());
    const text = textLines.join("\n").trim();
    if (!text) diagnostics.push({ code: "empty_srt_cue", cue: expectedIndex, line: textLine, message: "Cue text cannot be empty." });
    if (!Number.isNaN(start) && !Number.isNaN(end) && text) {
      segments.push({ id: stableSegmentId("srt", expectedIndex, text), startSeconds: start, endSeconds: end, text });
      previousStart = start;
    }
    expectedIndex += 1;
  }

  const transcript = makeTranscript(metadata, segments);
  diagnostics.push(...validateTranscript(transcript));
  return diagnostics.length ? { diagnostics } : { transcript, diagnostics };
}

function controlledSource(filename: string, contents: string, version?: string): TranscriptImportSource | undefined {
  const match = CONTROLLED_FILENAME.exec(filename);
  if (!match) return undefined;
  return { filename, format: filename.endsWith(".srt") ? "srt" : "txt", sha256: hashTranscriptContents(contents), version };
}

/** Imports one already-read controlled source. It refuses paths and ambiguous episode associations. */
export function importTranscriptFile(input: TranscriptFileImportInput): TranscriptImportResult {
  const source = controlledSource(input.filename, input.contents, input.metadata?.version);
  if (!source) {
    return { source: { filename: input.filename, format: input.filename.endsWith(".srt") ? "srt" : "txt", sha256: hashTranscriptContents(input.contents), version: input.metadata?.version }, status: "invalid", diagnostics: [{ code: "unsupported_filename", message: "Source must be a direct controlled file named DEMO_CTC_T#E#_TRANSCRIPCION.txt or DEMO_CTC_T#E#_SUBTITULOS.srt." }] };
  }
  const filenameEpisodeId = CONTROLLED_FILENAME.exec(input.filename)?.[1];
  const explicitEpisodeId = input.metadata?.episodeId;
  if (explicitEpisodeId && explicitEpisodeId !== filenameEpisodeId) {
    return { source, status: "invalid", diagnostics: [{ code: "filename_mismatch", message: `Filename belongs to ${filenameEpisodeId}; metadata belongs to ${explicitEpisodeId}.` }] };
  }
  const metadata = { ...input.metadata, episodeId: explicitEpisodeId ?? filenameEpisodeId };
  const parsed = source.format === "txt" ? parseTranscriptTxt(input.contents, metadata) : parseTranscriptSrt(input.contents, metadata);
  return { source, diagnostics: parsed.diagnostics, transcript: parsed.transcript, status: parsed.transcript ? "valid" : "invalid" };
}

/** Future resolver helper. It intentionally has no connection to page data or the published transcript registry. */
export function getImportedTranscriptByEpisodeId(results: readonly TranscriptImportResult[], episodeId: string): Transcript | undefined {
  return results.find((result) => result.status === "valid" && result.transcript?.episodeId === episodeId)?.transcript;
}

/** Loads only direct .txt/.srt files from data/transcripts/source. */
export async function loadImportedTranscripts(): Promise<TranscriptImportResult[]> {
  let entries: string[];
  try {
    entries = (await readdir(IMPORTED_TRANSCRIPTS_DIRECTORY, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && (entry.name.endsWith(".txt") || entry.name.endsWith(".srt")))
      .map((entry) => entry.name).sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    return [{ source: { filename: "data/transcripts/source", format: "txt", sha256: "" }, status: "invalid", diagnostics: [{ code: "read_error", message: error instanceof Error ? error.message : "Could not read transcript source directory." }] }];
  }
  return Promise.all(entries.map(async (filename) => {
    try {
      return importTranscriptFile({ filename, contents: await readFile(path.join(IMPORTED_TRANSCRIPTS_DIRECTORY, filename), "utf8") });
    } catch (error) {
      return { source: { filename, format: filename.endsWith(".srt") ? "srt" : "txt", sha256: "" }, status: "invalid" as const, diagnostics: [{ code: "read_error" as const, message: error instanceof Error ? error.message : "Could not read transcript source." }] };
    }
  }));
}
