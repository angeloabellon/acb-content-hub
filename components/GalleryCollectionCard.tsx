import Image from "next/image";
import Link from "next/link";

type GalleryCollectionCardProps = {
  title: string;
  cover: string;
  href: string;
  count: number;
};

export default function GalleryCollectionCard({
  title,
  cover,
  href,
  count,
}: GalleryCollectionCardProps) {
  return (
    <Link
      href={href}
      className="group relative block bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 rounded-2xl p-3 border border-red-900/40 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl mb-4">
        <Image
          src={cover}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="px-2 pb-4 min-h-[88px]">
  <h2 className="text-base md:text-lg font-bold leading-snug whitespace-normal group-hover:text-orange-400 transition-colors">
    {title}
  </h2>

  <p className="text-white/70 text-sm mt-2">
    {count} fotografías
  </p>
</div>
    </Link>
  );
}