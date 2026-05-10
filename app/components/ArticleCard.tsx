type ArticleCardProps = {
  title: string;
  image: string;
  category: string;
};

export default function ArticleCard({
  title,
  image,
  category,
}: ArticleCardProps) {
  return (
    <article className="group bg-[#e0131080] p-3 rounded-2xl hover:bg-white/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
        <img
            src={image}
            alt={category}
            className="w-full aspect-video object-cover rounded-xl mb-4 group-hover:opacity-80 transition-opacity"
        />
        <span className="inline-block bg-[#e01310] text-white text-sm font-semibold px-4 py-2 rounded-full">
        {category}
        </span>
      
    </article>
  );
}