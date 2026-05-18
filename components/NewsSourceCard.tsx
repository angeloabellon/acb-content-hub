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

export default function NewsSourceCard({
  title,
  description,
  logo,
  news,
}: NewsSourceCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 rounded-2xl p-6 border border-red-900/40 shadow-2xl overflow-hidden">
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