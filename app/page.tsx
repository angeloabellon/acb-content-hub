import Image from "next/image";
import Link from "next/link";

import ContentCard from "./components/cards/ContentCard";
import { featuredContent } from "@/data/featuredContent";
import { getLatestPodcastEpisode } from "@/lib/podcasts";
import { getLatestYouTubeVideos } from "@/lib/youtube";
import CoverageCard from "./components/cards/CoverageCard";
import { featuredCoverages } from "@/data/featuredCoverages";
import { homeFeed } from "@/data/homeFeed";


export default async function Home() {
  const [latestVideo] = await getLatestYouTubeVideos(1);
  const latestPodcast = await getLatestPodcastEpisode();

    // ENLACES PRINCIPALES DEL HOME
  const homeSections = [
    {
      title: "Vídeos",
      description: "Entrevistas, análisis y contenido audiovisual.",
      href: "/videos",
    },
    {
      title: "Podcasts",
      description: "Episodios, tertulias y conversaciones sobre baloncesto.",
      href: "/podcasts",
    },
    {
      title: "Noticias",
      description: "Actualidad de equipos, jugadores y competiciones.",
      href: "/news",
    },
    {
      title: "Galería",
      description: "Fotografías de partidos, jugadores y eventos.",
      href: "/galeria",
    },
  ];


  return (
    <>
      {/* HERO INTRODUCTORIO */}
      <section className="max-w-6xl mx-auto px-6 mt-28 text-center">
        <p className="uppercase tracking-[0.18em] text-red-300/80 text-sm font-semibold mb-5">
          Cast To Cast Baloncesto
        </p>

        <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] mb-8">
          El baloncesto en la Región de Murcia y en Málaga,
          <span className="block text-red-500">
            desde la perspectiva de sus aficionados
          </span>
        </h1>

        {/* CTA PRINCIPALES */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Link
            href="/videos"
            className="inline-flex w-full sm:w-auto justify-center rounded-xl bg-white px-6 py-3 font-semibold text-black hover:bg-orange-400 hover:text-white transition-colors"
          >
            Ver últimos vídeos
          </Link>

          <Link
            href="/podcasts"
            className="inline-flex w-full sm:w-auto justify-center rounded-xl border border-white/20 px-6 py-3 font-semibold text-white hover:border-orange-400 hover:text-orange-300 transition-colors"
          >
            Escuchar podcast
          </Link>
        </div>
      </section>

      <main>
        {/* CONTENIDO DESTACADO PRINCIPAL */}
        <section className="max-w-7xl mx-auto px-6 mt-20">
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
        {/* COBERTURAS DESTACADAS */}
        <section className="max-w-7xl mx-auto px-6 mt-16">
          <div className="mb-8">
            <p className="uppercase tracking-[0.18em] text-red-300/80 text-xs font-semibold mb-3">
              Coberturas
            </p>

            <h2 className="text-3xl md:text-4xl font-bold">
              Sigue a tus equipos
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {featuredCoverages.map((coverage) => (
              <CoverageCard
                key={coverage.href}
                title={coverage.title}
                description={coverage.description}
                href={coverage.href}
                accent={coverage.accent}
                teamLogo={coverage.teamLogo}
                leagueLogo={coverage.leagueLogo}
                leagueLogoSize={coverage.leagueLogoSize}
              />
                          ))}
          </div>
        </section>

        {/* ÚLTIMO CONTENIDO MULTIMEDIA */}
        <section className="max-w-7xl mx-auto px-6 mt-16">
          <div className="mb-8">
            <p className="uppercase tracking-[0.18em] text-red-300/80 text-xs font-semibold mb-3">
              Últimas publicaciones
            </p>

            <h2 className="text-3xl md:text-4xl font-bold">
              Contenido multimedia reciente
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* ÚLTIMO VÍDEO */}
            <ContentCard title="Último vídeo">
              {latestVideo && (
                <div className="text-center">
                  <Link href={`/videos/${latestVideo.slug}`} className="block group">
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
                    className="inline-flex bg-white text-black px-5 py-3 rounded-xl font-semibold hover:bg-orange-400 hover:text-white transition-colors"
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
                  <h3 className="text-lg font-bold mb-3">
                    {latestPodcast.title}
                  </h3>

                  {latestPodcast.pubDate && (
                    <p className="text-sm text-white/60 mb-4">
                      {new Date(latestPodcast.pubDate).toLocaleDateString("es-ES")}
                    </p>
                  )}

                  <audio controls preload="none" className="w-full mb-5">
                    <source src={latestPodcast.audioUrl} />
                    Tu navegador no soporta el reproductor de audio.
                  </audio>

                  <Link
                    href="/podcasts"
                    className="inline-flex bg-white text-black px-5 py-3 rounded-xl font-semibold hover:bg-orange-400 hover:text-white transition-colors"
                  >
                    Ver todos los podcasts
                  </Link>
                </div>
              )}
            </ContentCard>
          </div>
        </section>

        {/* ACCESOS RÁPIDOS A SECCIONES PRINCIPALES */}
        <section className="max-w-7xl mx-auto px-6 mt-16 mb-24">
          <div className="mb-8">
            <p className="uppercase tracking-[0.18em] text-red-300/80 text-xs font-semibold mb-3">
              Explora Cast To Cast
            </p>


            <h2 className="text-3xl md:text-4xl font-bold">
              Todo el contenido
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {homeFeed.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-orange-400/50 hover:bg-white/10 transition-colors"
              >
                {/* TIPO DE CONTENIDO */}
                <p className="uppercase tracking-[0.18em] text-red-300/70 text-xs font-semibold mb-4">
                  {item.type}
                </p>

                {/* TÍTULO */}
                <h3 className="text-xl font-bold mb-2">
                  {item.title}
                </h3>

                {/* DESCRIPCIÓN */}
                <p className="text-sm text-white/60">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}