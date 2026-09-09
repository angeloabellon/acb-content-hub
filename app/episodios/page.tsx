import Image from "next/image";
import Link from "next/link";

import { getEpisodes } from "@/lib/episodes";
import { createMetadata } from "@/lib/seo";
import type { Episode } from "@/types/episode";

export const metadata = createMetadata({
  title: "Episodios | Cast To Cast Baloncesto",
  description: "Especiales, entrevistas y episodios editoriales de Cast To Cast Baloncesto.",
  path: "/episodios",
});

const episodeKindLabel: Record<Episode["kind"], string> = {
  episode: "Episodio",
  special: "Especial",
  interview: "Entrevista",
};

function formatEpisodeDate(date: string) {
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(
    new Date(`${date}T12:00:00`),
  );
}

export default function EpisodesPage() {
  const episodes = [...getEpisodes()].sort((left, right) => right.date.localeCompare(left.date));

  return (
    <main className="max-w-6xl mx-auto px-6 py-12 md:py-16">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-300">
          Cast To Cast Baloncesto
        </p>
        <h1 className="mt-4 text-4xl font-extrabold md:text-6xl">Episodios</h1>
        <p className="mt-5 text-lg leading-relaxed text-white/70">
          Especiales, entrevistas y programas que forman parte del archivo editorial de Cast To Cast.
        </p>
      </section>

      {episodes.length ? (
        <section className="mt-12 grid gap-6 md:grid-cols-2" aria-label="Listado de episodios">
          {episodes.map((episode) => (
            <article
              key={episode.id}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-black/40 transition-colors hover:border-orange-300/60"
            >
              <Link href={`/episodios/${episode.slug}`} className="block">
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={episode.thumbnail}
                    alt={`Miniatura de ${episode.title}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <p className="absolute bottom-4 left-5 text-xs font-bold uppercase tracking-[0.16em] text-orange-300">
                    {episodeKindLabel[episode.kind]} · {episode.id}
                  </p>
                </div>
                <div className="p-6">
                  <time dateTime={episode.date} className="text-sm text-white/55">
                    {formatEpisodeDate(episode.date)}
                  </time>
                  <h2 className="mt-3 text-2xl font-bold leading-tight group-hover:text-orange-300">
                    {episode.title}
                  </h2>
                  <p className="mt-4 line-clamp-3 text-base leading-relaxed text-white/70">
                    {episode.description}
                  </p>
                  <span className="mt-6 inline-block text-sm font-bold text-orange-300">
                    Ver ficha del episodio →
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </section>
      ) : (
        <p className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
          Próximamente habrá episodios disponibles.
        </p>
      )}
    </main>
  );
}
