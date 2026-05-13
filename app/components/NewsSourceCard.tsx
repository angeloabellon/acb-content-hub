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
    <div className="bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 rounded-2xl p-6 border border-red-900/40 shadow-2xl">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left"
      >
        <div className="flex items-center justify-between gap-4">
  <div className="flex items-center gap-4">
    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white/10 flex-shrink-0">
      <Image
  src={logo}
  alt={title}
  fill
  sizes="64px"
  className="object-contain p-2"
/>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-white">
        {title}
      </h3>

      <p className="text-white/70 mt-2">
        {description}
      </p>
    </div>
  </div>

  <span className="text-white/80 text-2xl">
    {isOpen ? "−" : "+"}
  </span>
</div>
      </button>

      {isOpen && (
        <div className="mt-6 flex flex-col gap-4">
          {news.length > 0 ? (
            news.map((item, index) => (
              <a
                key={`${item.url}-${index}`}
                href={item.url}
                className="group block bg-black/20 hover:bg-black/40 transition-colors rounded-xl p-4"
              >
                <p className="text-white font-semibold group-hover:text-orange-400 transition-colors">
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
      )}
    </div>
  );
}