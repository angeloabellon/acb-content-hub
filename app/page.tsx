async function getLatestYouTubeVideo() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  console.log(apiKey);
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet&order=date&maxResults=1&type=video`,
    { next: { revalidate: 3600 } }
  );

  const data = await response.json();
  console.log(data);

  const video = data.items[0];

  return {
    title: video.snippet.title,
    url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
    thumbnail: video.snippet.thumbnails.high.url,
  };
}

import ContentCard from "./components/ContentCard";
export default async function Home() {
  const latestVideo = await getLatestYouTubeVideo();

  return (
    <>

      <section className="max-w-7xl mx-auto px-6 flex flex-col gap-14 items-center mt-24 text-center">
        <div className="text-center">
          <h2 className="text-5xl md:text-7xl font-bold leading-tight mb-6 drop-shadow-2xl">
            Podcast de baloncesto
          </h2>

          <p className="text-xl text-gray-300 mb-8">
            Tertulias, entrevistas y contenido especial para los amantes del baloncesto de la Región de Murcia.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://youtube.com/@casttocast_baloncesto"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#e0131080] hover:bg-orange-600 transition-all duration-300 px-6 py-4 rounded-xl text-lg font-semibold shadow-xl hover:scale-105"
            >
              CTC en YouTube
            </a>

            <a
              href="https://open.spotify.com/show/6SAcHJlJafO1P67INvke6e"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#e0131080] hover:bg-orange-600 transition-all duration-300 px-6 py-4 rounded-xl text-lg font-semibold shadow-xl hover:scale-105"
            >
              CTC en Spotify
            </a>
          </div>
        </div>

      </section>

      <main>
        <section className="max-w-7xl mx-auto px-6 mt-20 grid lg:grid-cols-2 gap-8 items-stretch">
          <div className="bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 rounded-3xl p-8 md:p-12 border border-red-900/40 shadow-2xl flex flex-col justify-between">
            <div>
              <p className="uppercase text-sm font-bold tracking-widest text-red-200 mb-4">
                Contenido destacado
              </p>

              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                La Copa del 96
              </h2>

              <p className="text-lg md:text-xl text-red-100 mb-8">
                Episodio especial dedicado a la Copa del Rey de 1996 celebrada en Murcia,
                con aficionados, periodistas y jugadores que vivieron de cerca aquel
                histórico torneo.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <a
                href="https://youtu.be/IE6ztcN8mJ4?si=PIcPaqWrHS6aIdLe"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-black px-6 py-4 rounded-xl font-semibold hover:bg-orange-400 hover:text-white transition-colors"
              >
                Ver en YouTube
              </a>
            </div>
          </div>

          <ContentCard title="Último episodio">
            <a
              href={latestVideo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group text-center"
            >
              <img
                src={latestVideo.thumbnail}
                alt={latestVideo.title}
                className="w-2/3 mx-auto rounded-xl mb-4 group-hover:opacity-80 transition-opacity"
              />

              <p className="text-white font-semibold group-hover:text-orange-400 transition-colors">
                {latestVideo.title}
              </p>
            </a>
          </ContentCard>
          
        </section>
      </main>
    </>
  );
}
