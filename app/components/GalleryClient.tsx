"use client";

import { useState } from "react";

type Photo = {
  src: string;
  alt: string;
};

type GalleryClientProps = {
  photos: Photo[];
};

export default function GalleryClient({ photos }: GalleryClientProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {photos.map((photo) => (
          <button
            key={photo.src}
            onClick={() => setSelectedImage(photo.src)}
            className="group relative overflow-hidden bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 rounded-2xl p-3 border border-red-900/40 shadow-2xl transition-all duration-300 hover:-translate-y-2"
          >
            <img
              src={photo.src}
              alt={photo.alt}
              className="w-full aspect-[4/3] object-cover rounded-xl"
            />
          </button>
        ))}
      </section>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-6 right-6 text-white text-4xl font-bold hover:text-orange-400 transition-colors">
            ✕
          </button>

          <img
            src={selectedImage}
            alt="Imagen ampliada"
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </>
  );
}