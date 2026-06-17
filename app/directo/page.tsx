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
{/* HERO EDITORIAL */}
<section className="relative mb-20 overflow-hidden rounded-3xl border border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] px-5 py-12 shadow-[0_10px_40px_rgba(122,12,12,0.22)] sm:px-8 sm:py-16 md:px-14 md:py-24">
  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#7a0c0c]/35 via-transparent to-[#e01310]/15" />

  <div className="relative z-10 text-center">
    <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-red-300/70">
      Directos Cast To Cast
    </p>

    <h1 className="mb-6 text-3xl font-extrabold leading-tight sm:text-4xl md:text-6xl">
      Sigue nuestra emisión
      <span className="block text-red-500">
        en directo
      </span>
    </h1>

    <p className="mx-auto max-w-3xl text-lg leading-relaxed text-white/70">
      Vídeo en vivo, chat oficial de YouTube y toda la conversación de
      Cast To Cast Baloncesto reunida en una página propia.
    </p>
  </div>
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