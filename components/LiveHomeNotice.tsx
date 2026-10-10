import { getActiveLiveStream } from "@/lib/youtube-live";

export default async function LiveHomeNotice() {
  const live = await getActiveLiveStream();
  const hasLive = live.isLive && live.videoId.length > 0;

  if (!hasLive) {
    return null;
  }

  return (
    <section className="mx-auto mb-10 max-w-7xl px-6">
      <a
        href={`https://www.youtube.com/watch?v=${live.videoId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group block overflow-hidden rounded-3xl border border-red-500/50 bg-gradient-to-r from-[#7a0c0c]/90 to-[#e01310]/90 p-6 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-orange-300/70 md:p-8"
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-red-100/80">
              🔴 En directo ahora
            </p>

            <h2 className="text-2xl font-extrabold text-white md:text-3xl">
              {live.title}
            </h2>

            <p className="mt-3 max-w-2xl text-white/75">
              Mírala y participa en el chat oficial de YouTube.
            </p>
          </div>

          <span className="inline-flex w-fit rounded-full bg-white px-5 py-3 text-sm font-bold text-black transition-colors group-hover:bg-orange-300">
            Ver en YouTube →
          </span>
        </div>
      </a>
    </section>
  );
}
