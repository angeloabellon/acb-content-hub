import Image from "next/image";
import Link from "next/link";

type GalleryCollectionCardProps = {
  title: string;
  cover: string;
  href: string;
  count: number;

  competition?: string;
  location?: string;
  date?: string;
};

export default function GalleryCollectionCard({
  title,
  cover,
  href,
  count,
  competition,
  location,
  date,
}: GalleryCollectionCardProps) {
  const formattedDate = date
    ? new Intl.DateTimeFormat("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(date))
    : null;

  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-3xl border border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] shadow-[0_10px_40px_rgba(122,12,12,0.22)] transition-all duration-500 hover:-translate-y-2 hover:border-red-700/50 hover:shadow-[0_18px_60px_rgba(224,19,16,0.28)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={cover}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#7a0c0c]/30 via-transparent to-[#e01310]/10 opacity-80" />

        {competition && (
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex rounded-full border border-white/15 bg-black/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur">
              {competition}
            </span>
          </div>
        )}
      </div>

      <div className="relative p-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex rounded-full border border-white/10 bg-[#7a0c0c]/20 px-3 py-1 text-xs text-white/70">
            {count} fotos
          </span>

          {formattedDate && (
            <span className="inline-flex rounded-full border border-white/10 bg-[#7a0c0c]/20 px-3 py-1 text-xs text-white/70">
              {formattedDate}
            </span>
          )}
        </div>

        <h2 className="text-xl font-bold leading-tight text-white transition-colors duration-300 group-hover:text-orange-400">
          {title}
        </h2>

        {location && (
          <p className="mt-4 text-sm text-red-100/70 leading-relaxed">
            {location}
          </p>
        )}

        <div className="mt-6 flex items-center gap-2 text-sm font-medium text-red-300 transition-colors duration-300 group-hover:text-orange-400">
          Ver galería
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}