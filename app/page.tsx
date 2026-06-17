import Image from "next/image";
import Link from "next/link";

import { featuredContent } from "@/data/featuredContent";
import { homeFeed } from "@/data/homeFeed";

import { getLatestPodcastEpisode } from "@/lib/podcasts";
import { getLatestYouTubeVideos } from "@/lib/youtube";

import ContentCard from "@/components/cards/ContentCard";
import RecommendedReadingsSection from "@/components/sections/RecommendedReadingsSection";
import SectionHeader from "@/components/ui/SectionHeader";
import { galleryCollections } from "@/data/gallery";
import LiveHomeNotice from "@/components/LiveHomeNotice";

export default async function Home() {
  const [latestVideo] = await getLatestYouTubeVideos(1);
  const latestPodcast = await getLatestPodcastEpisode();
  const [latestGallery] = galleryCollections;

  return (
    <>
      {/* HERO INTRODUCTORIO */}
      <LiveHomeNotice />
      <section className="relative overflow-hidden max-w-7xl mx-auto px-6 mt-16 md:mt-24">
  <div className="premium-card px-6 py-14 sm:px-10 sm:py-16 md:px-16 md:py-24 text-center relative overflow-hidden">
    <div className="premium-overlay" />

    <div className="relative z-10">
      <p className="uppercase tracking-[0.18em] text-red-300/80 text-xs sm:text-sm font-semibold mb-5">
        Cast To Cast Baloncesto
      </p>

      <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold leading-[1.05] mb-8 break-words">
        El baloncesto en la Región de Murcia y en Málaga,
        <span className="block text-red-500">
          desde la perspectiva de sus aficionados
        </span>
      </h1>

      <p className="text-base sm:text-lg text-white/70 max-w-3xl mx-auto leading-relaxed">
        Vídeos, podcasts, fotografía y actualidad para seguir el baloncesto
        desde una mirada cercana, independiente y multimedia.
      </p>

      {/* CTA PRINCIPALES */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
        <Link
          href="/videos"
          className="inline-flex w-full sm:w-auto justify-center rounded-xl bg-white px-6 py-3 font-semibold text-black transition-all duration-300 hover:-translate-y-1 hover:bg-orange-400 hover:text-white"
        >
          Ver últimos vídeos
        </Link>

        <Link
          href="/podcasts"
          className="inline-flex w-full sm:w-auto justify-center rounded-xl border border-white/20 px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:border-orange-400 hover:text-orange-300"
        >
          Escuchar podcast
        </Link>
      </div>
    </div>
  </div>
</section>

      <main>
        {/* CONTENIDO DESTACADO PRINCIPAL */}
        <section className="max-w-7xl mx-auto px-6 mt-24 md:mt-32">
          <Link
            href={featuredContent.href}
            className="group block bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 rounded-3xl p-6 md:p-8 border border-red-900/40 shadow-2xl overflow-hidden hover:border-orange-400/40 transition-all duration-300"
          >
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <p className="uppercase text-sm font-bold tracking-widest text-red-200 mb-4">
                  Contenido destacado
                </p>

                <h2 className="text-2xl md:text-4xl font-bold mb-6 group-hover:text-orange-300 transition-colors">
                  {featuredContent.title}
                </h2>

                <p className="text-base md:text-lg text-red-100/90 leading-relaxed">
                  {featuredContent.description}
                </p>
              </div>

              <div className="relative aspect-video overflow-hidden rounded-2xl">
                <Image
                  src={featuredContent.image}
                  alt={featuredContent.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                    <span className="text-3xl text-white ml-1">▶</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </section>
        {/* ÚLTIMA COBERTURA */}
<section className="max-w-7xl mx-auto px-6 mt-24 md:mt-32">
  <SectionHeader
    eyebrow="Cobertura destacada"
    title="UCAM Murcia vs Unicaja Málaga"
  />

  <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] gap-8">
    {/* HERO PRINCIPAL */}

<div
  className="group relative overflow-hidden rounded-3xl border border-red-900/30 shadow-[0_10px_40px_rgba(122,12,12,0.18)] transition-all duration-500 hover:-translate-y-2 hover:border-red-700/50 min-h-[420px]"
>
  <Image
    src="/galeria/UCAMUnicaja_22.webp"
    alt="Cobertura UCAM Murcia vs Unicaja"
    fill
    sizes="(max-width: 1024px) 100vw, 40vw"
    className="object-cover transition-transform duration-700 group-hover:scale-105"
  />

  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />

  <div className="absolute inset-0 bg-gradient-to-br from-[#7a0c0c]/20 via-transparent to-[#e01310]/10" />

  <div className="relative z-10 flex h-full flex-col justify-end p-8">
    <p className="uppercase tracking-[0.18em] text-red-300/70 text-xs font-semibold mb-4">
      Cobertura multimedia
    </p>

    <h3 className="text-3xl md:text-4xl font-extrabold leading-tight mb-5">
      UCAM Murcia vs Unicaja Málaga
    </h3>

    <p className="text-white/75 leading-relaxed mb-8">
      Podcast, vídeo y galería fotográfica del encuentro.
    </p>

    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
      <Link
        href="/podcasts/cast-to-cast-4x18-la-tertulia-ucam-murcia-vence-a-unicaja-y-se-mantiene-2-en-acb"
        className="inline-flex items-center rounded-xl bg-white/10 backdrop-blur border border-white/10 px-4 py-3 text-sm font-semibold text-white transition-all hover:border-orange-400/40 hover:text-orange-300"
      >
        Podcast →
      </Link>

      <Link
        href="/videos/cast-to-cast-4x18-la-tertulia-ucam-murcia-vence-a-unicaja-y-se-mantiene-2-en-acb-F4rI4vrJTGM"
        className="inline-flex items-center rounded-xl bg-white/10 backdrop-blur border border-white/10 px-4 py-3 text-sm font-semibold text-white transition-all hover:border-orange-400/40 hover:text-orange-300"
      >
        Vídeo →
      </Link>

      <Link
        href="/galeria/ucam-murcia-unicaja-accion"
        className="inline-flex items-center rounded-xl bg-white/10 backdrop-blur border border-white/10 px-4 py-3 text-sm font-semibold text-white transition-all hover:border-orange-400/40 hover:text-orange-300"
      >
        Galería →
      </Link>
    </div>
  </div>
</div>
  </div>
</section>

        {/* ÚLTIMO CONTENIDO MULTIMEDIA */}
        <section className="max-w-7xl mx-auto px-6 mt-24 md:mt-32">
          <SectionHeader
            eyebrow="Últimas publicaciones"
            title="Contenido multimedia reciente"
          />

          {/* VÍDEO Y PODCAST */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* ÚLTIMO VÍDEO */}
            <ContentCard title="Último vídeo">
              {latestVideo && (
                <div className="text-center">
                  <Link
                    href={`/videos/${latestVideo.slug}`}
                    className="block group"
                  >
                    <div className="relative aspect-video overflow-hidden rounded-xl mb-4">
                      <Image
                        src={latestVideo.thumbnail}
                        alt={latestVideo.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    <p className="text-white font-semibold group-hover:text-orange-400 transition-colors mb-5">
                      {latestVideo.title}
                    </p>
                  </Link>

                  <Link
                    href="/videos"
                    className="inline-flex bg-white text-black px-5 py-3 rounded-xl font-semibold transition-all duration-300 hover:-translate-y-1 hover:bg-orange-400 hover:text-white"
                  >
                    Ver todos los vídeos
                  </Link>
                </div>
              )}
            </ContentCard>

            {/* ÚLTIMO PODCAST */}
            <ContentCard title="Último podcast">
              {latestPodcast && (
                <div className="text-left">
                  <Link
                    href={`/podcasts/${latestPodcast.slug}`}
                    className="block group"
                  >
                    <h3 className="text-lg font-bold mb-3 group-hover:text-orange-300 transition-colors">
                      {latestPodcast.title}
                    </h3>

                    {latestPodcast.pubDate && (
                      <p className="text-sm text-white/60 mb-4">
                        {new Date(latestPodcast.pubDate).toLocaleDateString(
                          "es-ES"
                        )}
                      </p>
                    )}
                  </Link>

                  <audio controls preload="none" className="w-full mb-5">
                    <source src={latestPodcast.audioUrl} />
                    Tu navegador no soporta el reproductor de audio.
                  </audio>

                  <Link
                    href="/podcasts"
                    className="inline-flex bg-white text-black px-5 py-3 rounded-xl font-semibold transition-all duration-300 hover:-translate-y-1 hover:bg-orange-400 hover:text-white"
                  >
                    Ver todos los podcasts
                  </Link>
                </div>
              )}
            </ContentCard>

          </div>
{/* ÚLTIMA GALERÍA DESTACADA */}
{latestGallery && (
  <div className="mt-8">
    <Link
      href={`/galeria/${latestGallery.slug}`}
      className="group block overflow-hidden rounded-3xl border border-white/10 bg-black/20 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-orange-400/40"
    >
      <div className="relative aspect-[16/9] md:aspect-[16/7] overflow-hidden">
        <Image
          src={latestGallery.cover}
          alt={latestGallery.title}
          fill
          sizes="100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
          <p className="uppercase tracking-[0.18em] text-orange-300 text-xs font-semibold mb-5">
            Última galería
          </p>

          <h3 className="text-3xl md:text-5xl font-extrabold leading-tight max-w-3xl">
            {latestGallery.title}
          </h3>

          <p className="mt-4 text-white/80 max-w-2xl text-sm md:text-base leading-relaxed">
            {latestGallery.description}
          </p>

          <span className="inline-flex items-center gap-2 mt-6 text-orange-300 font-semibold group-hover:text-orange-200 transition-colors">
            Ver galería →
          </span>
        </div>
      </div>
    </Link>
  </div>
)}
        </section>

        {/* LECTURAS RECOMENDADAS */}
        <RecommendedReadingsSection className="mt-24 md:mt-32" />
        {/* COMUNIDAD Y REDES */}
<section className="max-w-7xl mx-auto px-6 mt-24 md:mt-32">
  <SectionHeader
    eyebrow="Comunidad Cast To Cast"
    title="Síguenos también fuera de la web"
  />

  <div className="grid md:grid-cols-3 gap-6">
    {[
      {
        name: "YouTube",
        description:
          "Episodios completos, tertulias, especiales y contenido audiovisual de Cast To Cast.",
        href: "https://www.youtube.com/@casttocast_baloncesto",
        cta: "Ver vídeos",
      },
      {
        name: "Instagram",
        description:
          "Galerías, reels, fotografías de partido y momentos visuales del baloncesto.",
        href: "https://instagram.com/casttocast2",
        cta: "Ir a Instagram",
      },
      {
        name: "X / Twitter",
        description:
          "Debate, opinión, actualidad y conversación en directo con la comunidad.",
        href: "https://x.com/casttocast2",
        cta: "Ir a X",
      },
    ].map((item) => (
      <Link
        key={item.name}
        href={item.href}
        target={item.href.startsWith("http") ? "_blank" : undefined}
        rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
        className="group premium-card premium-hover p-8"
      >
        <p className="uppercase tracking-[0.18em] text-red-300/70 text-xs font-semibold mb-4">
          {item.name}
        </p>

        <h3 className="text-2xl font-bold mb-4 group-hover:text-orange-400 transition-colors">
          {item.cta}
        </h3>

        <p className="text-white/65 leading-relaxed">
          {item.description}
        </p>
      </Link>
    ))}
  </div>
</section>

        {/* ACCESOS RÁPIDOS A SECCIONES PRINCIPALES */}
        <section className="max-w-7xl mx-auto px-6 mt-24 md:mt-32 mb-24">
          <SectionHeader
            eyebrow="Explora Cast To Cast"
            title="Todo el contenido"
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {homeFeed.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-orange-400/50 hover:bg-white/10 transition-colors"
              >
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>

                <p className="text-sm text-white/60">{item.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}