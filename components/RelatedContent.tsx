import Link from "next/link";

type RelatedItem = {
  title: string;
  href: string;
  type: "Vídeo" | "Podcast" | "Galería";
};

type RelatedContentProps = {
  title?: string;
  items: RelatedItem[];
};

export default function RelatedContent({
  title = "Contenido relacionado",
  items,
}: RelatedContentProps) {
  if (!items.length) return null;

  return (
    <section className="mt-20">
      <div className="mb-8">
        <p className="uppercase tracking-[0.18em] text-red-300/70 text-xs font-semibold mb-3">
          Ecosistema multimedia
        </p>

        <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
          {title}
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group premium-card premium-hover relative overflow-hidden p-6"
          >
            <div className="premium-overlay" />

            <div className="relative z-10">
              <p className="uppercase tracking-[0.18em] text-red-300/70 text-xs font-semibold mb-4">
                {item.type}
              </p>

              <h3 className="text-xl font-bold leading-snug mb-5 group-hover:text-orange-400 transition-colors">
                {item.title}
              </h3>

              <span className="inline-flex items-center gap-2 text-sm font-semibold text-red-300 group-hover:text-orange-300 transition-colors">
                Ver contenido →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}