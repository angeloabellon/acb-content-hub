import Image from "next/image";
type ArticleCardProps = {
  image: string;
  category: string;
  url: string;
};

export default function ArticleCard({ image, category, url }: ArticleCardProps) {
  return (
    <a
      href={url}
      className="group relative block overflow-hidden bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 rounded-2xl p-3 border border-red-900/40 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
    >

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors duration-300"></div>

      <div className="relative z-10">

        <div className="relative aspect-video mb-4 overflow-hidden rounded-xl">
  <Image
    src={image}
    alt={category}
    fill
    sizes="(max-width: 768px) 100vw, 50vw"
    className="object-cover group-hover:opacity-80 transition-opacity"
  />
</div>

        <span className="uppercase text-xs font-bold tracking-widest text-white block group-hover:text-orange-400 transition-colors">
          {category}
        </span>

      </div>

    </a>
  );
}