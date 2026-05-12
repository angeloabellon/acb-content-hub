"use client";

import fs from "fs";
import path from "path";
import { useState } from "react";

function getGalleryPhotos() {
  // Esta parte no puede ejecutarse en client components,
  // así que dejamos fotos manuales de momento.
  return [
    {
      src: "/galeria/anteto1.jpg",
      alt: "Fotografía deportiva de Cast To Cast",
    },
    {
      src: "/galeria/anteto2.jpg",
      alt: "Fotografía deportiva de Cast To Cast",
    },
  ];
}

export default function GaleriaPage() {
  const photos = getGalleryPhotos();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">

      <section className="text-center mb-14">

        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Galería
        </h1>

        <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
          Fotografía deportiva, gentileza de nuestro amigo Antonio Martínez. (Actualmente en fase de construcción y pruebas)
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">

          <a
            href="https://x.com/anmasa73"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 px-6 py-3 rounded-xl border border-red-900/40 shadow-xl text-white font-semibold transition-all duration-300 hover:-translate-y-1 hover:text-orange-400 hover:shadow-2xl"
          >
            🐦 Ver perfil en X / Twitter
          </a>

          <a
            href="https://instagram.com/anmasa73sports"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 px-6 py-3 rounded-xl border border-red-900/40 shadow-xl text-white font-semibold transition-all duration-300 hover:-translate-y-1 hover:text-orange-400 hover:shadow-2xl"
          >
            📸 Ver perfil en Instagram
          </a>

        </div>

      </section>

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

          <button
            className="absolute top-6 right-6 text-white text-4xl font-bold hover:text-orange-400 transition-colors"
          >
            ✕
          </button>

          <img
            src={selectedImage}
            alt="Imagen ampliada"
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl"
          />

        </div>
      )}

    </main>
  );
}