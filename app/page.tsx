import Header from "./components/Header";
import ContentCard from "./components/ContentCard";
export default function Home() {
  const videos = [
  "Análisis NBA",
  "Historias legendarias",
  "Actualidad ACB",
  "Draft y jóvenes promesas",
  ];
  return (
    <>
      <Header />

      <section className="hero">
        <h2>Baloncesto, análisis y pasión por el juego</h2>

        <p>
          Podcast, vídeos y contenido para amantes de la NBA, la ACB y las historias que rodean el baloncesto.
        </p>

        <button>Escuchar último episodio</button>
      </section>

      

      <main>
        <p>
          Podcast y contenido sobre baloncesto, NBA y ACB.
        </p>

        <ContentCard
          title="Último episodio"
          description="Analizamos los playoffs y las claves tácticas de la serie."
        />

        <section className="card">
          <h2>Nuevos vídeos</h2>
          <ul>
            {videos.map((video) => (
            <li key={video}>
              <a href="https://www.google.com/?client=safari" className="video-link">{video}</a>
            </li>
            
            ))}
          </ul>
        </section>

      </main>
    </>
  );
}
