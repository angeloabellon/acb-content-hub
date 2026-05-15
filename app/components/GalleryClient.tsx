"use client";
import Image from "next/image";
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
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
  <Image
    src={photo.src}
    alt={photo.alt}
    fill
    sizes="(max-width: 768px) 100vw, 33vw"
    className="object-cover"
  />
</div>
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

          <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
  <Image
    src={selectedImage}
    alt="Imagen ampliada"
    fill
    sizes="100vw"
    className="object-contain rounded-2xl shadow-2xl"
  />
</div>
        </div>
      )}
    </>
  );
}