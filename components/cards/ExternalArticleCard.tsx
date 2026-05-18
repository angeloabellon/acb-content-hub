import Link from "next/link";

type ExternalArticleCardProps = {
  authorName: string;
  source: string;
  description: string;
  authorUrl: string;
  latestArticle?: {
    title: string;
    url: string;
  } | null;
};

export default function ExternalArticleCard({
  authorName,
  source,
  description,
  authorUrl,
  latestArticle,
}: ExternalArticleCardProps) {
  const href = latestArticle?.url ?? authorUrl;

return (
  <Link
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="group block relative overflow-hidden rounded-3xl border border-red-900/40 bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 p-6 md:p-8 shadow-2xl hover:border-orange-400/40 transition-all duration-300"
  >
    {/* OVERLAY */}
    <div className="absolute inset-0 bg-black/10" />

    {/* CONTENIDO */}
    <div className="relative z-10">
      {/* ETIQUETA */}
      <p className="uppercase tracking-[0.18em] text-red-100/80 text-xs font-semibold mb-4">
        Firma invitada · {source}
      </p>

      {/* TÍTULO */}
      <h3 className="text-2xl md:text-3xl font-extrabold leading-tight mb-4 group-hover:text-orange-300 transition-colors">
        {latestArticle?.title ?? authorName}
      </h3>

      {/* DESCRIPCIÓN */}
      <p className="text-white/75 leading-relaxed mb-8 max-w-3xl">
        {latestArticle
          ? `Último artículo publicado por ${authorName}.`
          : description}
      </p>

      {/* CTA */}
      <span className="inline-flex items-center text-sm font-semibold text-white/90 group-hover:text-orange-300 transition-colors">
        {latestArticle ? "Leer último artículo →" : "Ver artículos del autor →"}
      </span>
    </div>
  </Link>
);
}