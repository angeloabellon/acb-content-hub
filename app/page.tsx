import Link from "next/link";
import ContentCard from "./components/ContentCard";
import { getLatestYouTubeVideos } from "@/lib/youtube";

export default async function Home() {
  const [latestVideo] = await getLatestYouTubeVideos(1);

  return (
    <>
      <section className="max-w-6xl mx-auto px-6 mt-28 text-center">
        <p className="uppercase tracking-[0.18em] text-red-300/80 text-sm font-semibold mb-5">
          Cast To Cast Baloncesto
        </p>

        <h2 className="text-5xl md:text-7xl font-extrabold leading-[1.05] mb-8">
          El baloncesto en la Región de Murcia y en Málaga,
          <span className="block text-red-500">
            desde la perspectiva de sus aficionados
          </span>
        </h2>
      </section>

      <main>
        <section className="max-w-7xl mx-auto px-6 mt-20 flex flex-col gap-8">
          <Link
            href="/videos/la-copa-del-96-IE6ztcN8mJ4"
            className="group block bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 rounded-3xl p-6 md:p-8 border border-red-900/40 shadow-2xl overflow-hidden hover:border-orange-400/40 transition-all duration-300"
          >
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <p className="uppercase text-sm font-bold tracking-widest text-red-200 mb-4">
                  Contenido destacado
                </p>

                <h2 className="text-2xl md:text-4xl font-bold mb-6 group-hover:text-orange-300 transition-colors">
                  La Copa del 96
                </h2>

                <p className="text-base md:text-lg text-red-100/90 leading-relaxed">
                  Episodio especial dedicado a la Copa del Rey de 1996 celebrada
                  en Murcia, con aficionados, periodistas y jugadores que
                  vivieron de cerca aquel histórico torneo.
                </p>
              </div>

              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src="https://i.ytimg.com/vi/IE6ztcN8mJ4/maxresdefault.jpg"
                  alt="La Copa del 96"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                    <span className="text-3xl text-white ml-1">
                      ▶
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          <div className="grid lg:grid-cols-2 gap-8">
            <ContentCard title="Último episodio">
              {latestVideo && (
                <Link
                  href={`/videos/${latestVideo.slug}`}
                  className="block group text-center"
                >
                  <div className="relative overflow-hidden rounded-xl mb-4">
                    <img
                      src={latestVideo.thumbnail}
                      alt={latestVideo.title}
                      className="w-2/3 mx-auto transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  <p className="text-white font-semibold group-hover:text-orange-400 transition-colors">
                    {latestVideo.title}
                  </p>
                </Link>
              )}
            </ContentCard>

            <ContentCard title="Último podcast">
              <iframe
                src="https://www.ivoox.com/player_es_podcast_1580626_zp_1.html?c1=bc1515"
                width="100%"
                height="200"
                allowFullScreen
                loading="lazy"
                className="rounded-xl"
              ></iframe>
            </ContentCard>
          </div>
        </section>
      </main>
    </>
  );
}