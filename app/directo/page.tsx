import type { Metadata } from "next";
import { liveConfig } from "@/config/live";

export const metadata: Metadata = {
  title: "Directo | Cast To Cast Baloncesto",
  description:
    "Sigue los directos de Cast To Cast Baloncesto con vídeo y chat en vivo.",
};

export default function DirectoPage() {
  const hasLive = liveConfig.isLive && liveConfig.videoId.length > 0;

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <section className="mb-10">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-red-300/70">
          Cast To Cast Baloncesto
        </p>

        <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
          Directo
        </h1>

        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/70">
          Sigue nuestras emisiones en directo con vídeo y chat integrado, sin
          salir de Cast To Cast.
        </p>
      </section>

      {hasLive ? (
        <section className="rounded-3xl border border-red-900/40 bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 p-4 shadow-2xl md:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-100/80">
                🔴 En directo ahora
              </p>

              <h2 className="text-2xl font-extrabold text-white md:text-3xl">
                {liveConfig.title}
              </h2>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-xl">
              <div className="aspect-video">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${liveConfig.videoId}?autoplay=1`}
                  title={liveConfig.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-xl">
              <iframe
                className="h-[500px] w-full lg:h-full"
                src={`https://www.youtube.com/live_chat?v=${liveConfig.videoId}&embed_domain=casttocast.es`}
                title="Chat en directo"
              />
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-red-900/40 bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 p-8 shadow-2xl md:p-12">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-red-100/80">
            Próximamente
          </p>

          <h2 className="text-3xl font-extrabold text-white md:text-4xl">
            No hay ninguna emisión activa
          </h2>

          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
            Cuando Cast To Cast esté en directo, podrás seguir aquí la emisión
            completa junto al chat oficial de YouTube.
          </p>
        </section>
      )}
    </main>
  );
}