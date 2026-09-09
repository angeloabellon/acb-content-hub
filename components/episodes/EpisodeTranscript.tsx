import {
  formatTranscriptTimestamp,
  getTranscriptSegmentAnchor,
} from "@/lib/transcripts";
import type { Transcript } from "@/types/transcript";

type EpisodeTranscriptProps = {
  transcript: Transcript;
};

/** Server-rendered, accessible transcript module. No player seek is wired yet. */
export function EpisodeTranscript({ transcript }: EpisodeTranscriptProps) {
  return (
    <section aria-labelledby="transcripcion" className="mt-12">
      <details className="rounded-2xl border border-white/10 bg-white/5 p-6" open>
        <summary id="transcripcion" className="cursor-pointer text-2xl font-bold marker:text-orange-300">
          Transcripción
        </summary>
        <div className="mt-5 space-y-4">
          {transcript.isDemo ? (
            <p className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
              Demostración técnica: este texto no es una transcripción real del episodio.
            </p>
          ) : null}
          <p className="text-sm text-white/55">Idioma: {transcript.language}</p>
          <ol className="space-y-4 p-0">
            {transcript.segments.map((segment) => (
              <li
                id={getTranscriptSegmentAnchor(segment)}
                key={segment.id}
                className="scroll-mt-6 rounded-xl border border-white/10 bg-black/15 p-4 text-base leading-relaxed text-white/80"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
                  {segment.speaker ? <span className="font-bold text-orange-300">{segment.speaker}</span> : null}
                  {segment.startSeconds !== undefined ? (
                    <span className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-white/65" aria-label={`Marca de tiempo ${formatTranscriptTimestamp(segment.startSeconds)}`}>
                      {formatTranscriptTimestamp(segment.startSeconds)}
                    </span>
                  ) : null}
                  <a href={`#${getTranscriptSegmentAnchor(segment)}`} className="text-white/45 underline-offset-2 hover:text-white hover:underline">
                    Enlace a este fragmento
                  </a>
                </div>
                <p>{segment.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </details>
    </section>
  );
}
