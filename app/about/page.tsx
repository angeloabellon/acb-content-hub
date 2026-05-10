export default function AboutPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-16">

      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Sobre Cast To Cast
        </h1>

        <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Cast To Cast Baloncesto es un espacio dedicado a la actualidad del
          baloncesto, con especial atención al UCAM Murcia CB, CB Jairis,
          Unicaja Málaga y otras historias relacionadas con el deporte de la canasta.
        </p>
      </section>

      <section className="grid md:grid-cols-3 gap-8">

        <div className="bg-[#e0131080] rounded-2xl p-8 hover:bg-white/5 transition-colors">
          <h2 className="text-2xl font-bold mb-4">
            Tertulias
          </h2>

          <p className="text-gray-300 leading-relaxed">
            Conversaciones distendidas sobre partidos, actualidad,
            protagonistas y análisis del panorama baloncestístico.
          </p>
        </div>

        <div className="bg-[#e0131080] rounded-2xl p-8 hover:bg-white/5 transition-colors">
          <h2 className="text-2xl font-bold mb-4">
            Especiales
          </h2>

          <p className="text-gray-300 leading-relaxed">
            Episodios dedicados a momentos históricos, historias del
            baloncesto y protagonistas que dejaron huella.
          </p>
        </div>

        <div className="bg-[#e0131080] rounded-2xl p-8 hover:bg-white/5 transition-colors">
          <h2 className="text-2xl font-bold mb-4">
            Comunidad
          </h2>

          <p className="text-gray-300 leading-relaxed">
            Un espacio para aficionados que disfrutan compartiendo
            opinión, debate y pasión por el baloncesto.
          </p>
        </div>

      </section>

    </main>
  );
}