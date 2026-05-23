"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Photo = {
  src: string;
  alt: string;
};

type GalleryClientProps = {
  photos: Photo[];
};

export default function GalleryClient({ photos }: GalleryClientProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selectedPhoto =
    selectedIndex !== null ? photos[selectedIndex] : null;

  const closeLightbox = () => setSelectedIndex(null);

  const showPrevious = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
  };

  const showNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % photos.length);
  };

  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedIndex]);

  return (
    <>
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {photos.map((photo, index) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className="group relative overflow-hidden bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 rounded-2xl p-3 border border-red-900/40 shadow-2xl transition-all duration-300 hover:-translate-y-2"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-black">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/25" />
            </div>
          </button>
        ))}
      </section>

      {selectedPhoto && selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-5 right-5 z-50 h-11 w-11 rounded-full bg-white/10 border border-white/20 text-white text-2xl font-bold hover:text-orange-400 hover:bg-white/15 transition-colors"
            aria-label="Cerrar imagen"
          >
            ✕
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showPrevious();
            }}
            className="absolute left-4 md:left-8 z-50 h-12 w-12 rounded-full bg-white/10 border border-white/20 text-white text-3xl hover:text-orange-400 hover:bg-white/15 transition-colors"
            aria-label="Imagen anterior"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showNext();
            }}
            className="absolute right-4 md:right-8 z-50 h-12 w-12 rounded-full bg-white/10 border border-white/20 text-white text-3xl hover:text-orange-400 hover:bg-white/15 transition-colors"
            aria-label="Imagen siguiente"
          >
            ›
          </button>

          <div
            className="relative w-full h-full max-w-6xl max-h-[85vh]"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={selectedPhoto.src}
              alt={selectedPhoto.alt}
              fill
              sizes="100vw"
              className="object-contain rounded-2xl shadow-2xl"
              priority
            />
          </div>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/60 border border-white/15 px-5 py-2 text-sm text-white/80 backdrop-blur">
            {selectedIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  );
}