import Image from "next/image";
import Link from "next/link";

export default function FeaturedGallerySection() {
  return (
    <section className="max-w-7xl mx-auto px-6 mt-20 md:mt-28">
      <div className="mb-8">
        <p className="uppercase tracking-[0.18em] text-red-300/80 text-xs font-semibold mb-3">
          Galería destacada
        </p>

        <h2 className="text-3xl md:text-4xl font-bold">
          El ambiente del UCAM Murcia - Unicaja
        </h2>

      </div>

      <Link
        href="/galeria/g-grada17may26"
        className="group block overflow-hidden rounded-3xl border border-white/10 bg-black/20 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-orange-400/40"
      >
        <div className="relative aspect-[16/9] md:aspect-[16/7] overflow-hidden">
          <Image
            src="/galeria/grada17may2601.webp"
            alt="Ambiente en la grada durante el UCAM Murcia - Unicaja"
            fill
            priority
            sizes="100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
            <p className="uppercase tracking-[0.18em] text-orange-300 text-xs font-semibold mb-3">
              Nueva galería
            </p>

            <p className="mt-4 text-white/80 max-w-2xl text-sm md:text-base leading-relaxed">
              Fotografías del ambiente vivido en el Palacio durante el duelo
              entre UCAM Murcia y Unicaja Málaga.
            </p>

            <span className="inline-flex items-center gap-2 mt-6 text-orange-300 font-semibold group-hover:text-orange-200 transition-colors">
              Ver galería →
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}