import Link from "next/link";
import { liveConfig } from "@/config/live";

export default function LiveHomeNotice() {
  const hasLive = liveConfig.isLive && liveConfig.videoId.length > 0;

  if (!hasLive) {
    return null;
  }

  return (
    <section className="mx-auto mb-10 max-w-7xl px-6">
      <Link
        href="/directo"
        className="group block overflow-hidden rounded-3xl border border-red-500/50 bg-gradient-to-r from-[#7a0c0c]/90 to-[#e01310]/90 p-6 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-orange-300/70 md:p-8"
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-red-100/80">
              🔴 En directo ahora
            </p>

            <h2 className="text-2xl font-extrabold text-white md:text-3xl">
              {liveConfig.title}
            </h2>

            <p className="mt-3 max-w-2xl text-white/75">
              Entra para ver la emisión y participar en el chat oficial.
            </p>
          </div>

          <span className="inline-flex w-fit rounded-full bg-white px-5 py-3 text-sm font-bold text-black transition-colors group-hover:bg-orange-300">
            Ver directo →
          </span>
        </div>
      </Link>
    </section>
  );
}