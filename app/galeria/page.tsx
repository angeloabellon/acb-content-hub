import GalleryCollectionCard from "../components/GalleryCollectionCard";
import { galleryCollections } from "@/data/gallery";

export default function GaleriaPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <section className="text-center mb-14">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
          Galería
        </h1>

        <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
          Fotografía deportiva, gentileza de nuestro amigo y colaborador Antonio Martínez.
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
  {galleryCollections.map((collection) => (
    <GalleryCollectionCard
      key={collection.slug}
      title={collection.title}
      cover={collection.cover}
      href={`/galeria/${collection.slug}`}
      count={collection.photos.length}
    />
  ))}
</section>
    </main>
  );
}