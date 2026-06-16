"use client";

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
      className="group relative block overflow-hidden rounded-3xl border border-red-900/40 bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 p-6 shadow-2xl transition-all duration-300 hover:border-orange-400/40 md:p-8"
    >
      <div className="absolute inset-0 bg-black/10" />

      <div className="relative z-10">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-red-100/80">
          Firma invitada · {source}
        </p>

        <h3 className="mb-4 text-2xl font-extrabold leading-tight transition-colors group-hover:text-orange-300 md:text-3xl">
          {latestArticle?.title ?? authorName}
        </h3>

        <p className="mb-8 max-w-3xl leading-relaxed text-white/75">
          {latestArticle
            ? `Último artículo publicado por ${authorName} en ${source}.`
            : description}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center text-sm font-semibold text-white/90 transition-colors group-hover:text-orange-300">
            {latestArticle
              ? "Leer último artículo →"
              : "Ver artículos del autor →"}
          </span>

          {latestArticle && (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();

                if (navigator.share) {
                  navigator.share({
                    title: latestArticle.title,
                    url: latestArticle.url,
                  });
                } else {
                  navigator.clipboard.writeText(latestArticle.url);
                }
              }}
              className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/70 transition-colors hover:border-orange-300/60 hover:text-orange-300"
            >
              Compartir
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}