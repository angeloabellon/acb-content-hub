"use client";

import Image from "next/image";
import { useState } from "react";
import type { NewsItem } from "@/lib/news";

type NewsSourceCardProps = {
  title: string;
  description: string;
  logo: string;
  news: NewsItem[];
};

// Estilos visuales por club / fuente.
// Usamos gradientes oscuros y elegantes para mantener la estética premium.
const sourceStyles = {
  ucam: "from-red-950/90 via-red-900/80 to-red-700/60 border-red-700/40",
  jairis: "from-yellow-900/80 via-amber-700/70 to-yellow-500/40 border-yellow-400/40",
  unicaja: "from-green-950/90 via-green-900/80 to-emerald-600/60 border-green-600/40",
  default: "from-gray-900/80 via-gray-800/70 to-gray-700/60 border-white/20",
};

function getSourceStyle(title: string) {
  const normalizedTitle = title.toLowerCase();

  if (normalizedTitle.includes("ucam")) {
    return sourceStyles.ucam;
  }

  if (normalizedTitle.includes("jairis")) {
    return sourceStyles.jairis;
  }

  if (normalizedTitle.includes("unicaja")) {
    return sourceStyles.unicaja;
  }

  return sourceStyles.default;
}

export default function NewsSourceCard({
  title,
  description,
  logo,
  news,
}: NewsSourceCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const sourceStyle = getSourceStyle(title);

  return (
    <div
      className={`bg-gradient-to-br ${sourceStyle} rounded-2xl p-6 border shadow-2xl overflow-hidden transition-all duration-300`}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white/10 flex-shrink-0">
              <Image
                src={logo}
                alt={title}
                fill
                sizes="64px"
                className="object-contain p-2"
              />
            </div>

            <div className="min-w-0">
              <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
                {title}
              </h3>

              <p className="text-white/70 mt-2 text-sm md:text-base leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          <span className="text-white/80 text-2xl flex-shrink-0">
            {isOpen ? "−" : "+"}
          </span>
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-[520px] mt-6" : "max-h-0"
        }`}
      >
        <div className="max-h-[520px] overflow-y-auto pr-2 space-y-4">
          {news.length > 0 ? (
            news.map((item, index) => (
              <a
                key={`${item.url}-${index}`}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-black/20 hover:bg-black/40 transition-colors rounded-xl p-4"
              >
                <p className="text-white font-semibold group-hover:text-orange-400 transition-colors line-clamp-2">
                  {item.title}
                </p>

                <p className="text-sm text-white/60 mt-2">
                  {item.source}
                </p>
              </a>
            ))
          ) : (
            <p className="text-white/70">
              No hay noticias disponibles en este momento.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}