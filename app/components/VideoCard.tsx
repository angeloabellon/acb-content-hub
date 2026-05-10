type VideoCardProps = {
  title: string;
  thumbnail: string;
  url: string;
};

export default function VideoCard({ title, thumbnail, url }: VideoCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-[#e0131080] block rounded-2xl p-3 transition-all duration-300 hover:-translate-y-2 hover:bg-white/5 hover:shadow-2xl"
    >
      <div className="relative overflow-hidden rounded-xl mb-4">
        <img
          src={thumbnail}
          alt={title}
          loading="lazy"
          className="w-full aspect-video object-cover group-hover:opacity-80 transition-opacity"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute bottom-3 left-3 md:hidden bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-white">
          Ver vídeo
        </div>
      </div>

      <p className="font-semibold text-sm md:text-base group-hover:text-orange-400 transition-colors">
        {title}
      </p>
    </a>
  );
}