type ArticleCardProps = {
  image: string;
  category: string;
  url: string;
};

export default function ArticleCard({ image, category, url }: ArticleCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-[#e0131080] p-3 rounded-2xl hover:bg-white/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
    >
      <img
        src={image}
        alt={category}
        className="w-full aspect-video object-cover rounded-xl mb-4 group-hover:opacity-80 transition-opacity"
      />

      <span className="uppercase text-xs font-bold tracking-widest text-orange-400 block">
        {category}
      </span>
    </a>
  );
}