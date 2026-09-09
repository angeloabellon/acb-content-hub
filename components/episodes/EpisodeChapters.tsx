import {
  formatChapterTimestamp,
  getChapterAnchor,
  getYouTubeTimestampUrl,
} from "@/lib/chapters";
import type { Chapter } from "@/types/chapter";

type EpisodeChaptersProps = {
  chapters: readonly Chapter[];
  youtubeUrl?: string;
};

/** Server-rendered chapter navigation. Player seeking can be added independently later. */
export function EpisodeChapters({ chapters, youtubeUrl }: EpisodeChaptersProps) {
  if (chapters.length === 0) return null;

  return (
    <section aria-labelledby="capitulos" className="mt-12">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 id="capitulos" className="text-2xl font-bold">Capítulos</h2>
        {chapters.some((chapter) => chapter.isDemo) ? (
          <p className="mt-4 rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            Demostración técnica: estos capítulos no corresponden al contenido editorial del episodio.
          </p>
        ) : null}
        <ol className="mt-5 space-y-3 p-0">
          {chapters.map((chapter) => {
            const timestampUrl = getYouTubeTimestampUrl(youtubeUrl, chapter.startSeconds);
            const timestamp = formatChapterTimestamp(chapter.startSeconds);
            return (
              <li id={getChapterAnchor(chapter)} key={chapter.id} className="scroll-mt-6 rounded-xl border border-white/10 bg-black/15 p-4">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  {timestampUrl ? (
                    <a href={timestampUrl} className="font-mono font-semibold text-orange-300 underline-offset-2 hover:underline" aria-label={`Abrir YouTube en ${timestamp}`}>
                      {timestamp}
                    </a>
                  ) : (
                    <span className="font-mono font-semibold text-orange-300">{timestamp}</span>
                  )}
                  <h3 className="font-bold text-white">{chapter.title}</h3>
                  <a href={`#${getChapterAnchor(chapter)}`} className="text-sm text-white/45 underline-offset-2 hover:text-white hover:underline">
                    Enlace a este capítulo
                  </a>
                </div>
                {chapter.description ? <p className="mt-2 text-sm leading-relaxed text-white/70">{chapter.description}</p> : null}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
