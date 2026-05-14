import { getPodcastEpisodes } from "@/lib/podcasts";

export default async function PodcastsPage() {
  const episodes = await getPodcastEpisodes();

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <section className="text-center mb-14">
        <p className="uppercase tracking-[0.18em] text-red-300/80 text-sm font-semibold mb-5">
          Cast To Cast Baloncesto
        </p>

        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
          Podcasts
        </h1>

        <p className="text-white/70 max-w-2xl mx-auto text-lg">
          Escucha los episodios de Cast To Cast directamente desde nuestra web.
        </p>
      </section>

      <section className="grid gap-6">
        {episodes.map((episode) => (
          <article
            key={episode.audioUrl}
            className="bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 rounded-3xl p-6 border border-red-900/40 shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-3">
              {episode.title}
            </h2>

            {episode.pubDate && (
              <p className="text-sm text-red-100/70 mb-4">
                {new Date(episode.pubDate).toLocaleDateString("es-ES")}
              </p>
            )}

            {episode.description && (
              <p className="text-red-100/90 mb-5 line-clamp-3">
                {episode.description}
              </p>
            )}

            <audio
              controls
              preload="none"
              className="w-full"
            >
              <source src={episode.audioUrl} />
              Tu navegador no soporta el reproductor de audio.
            </audio>
          </article>
        ))}
      </section>
    </main>
  );
}