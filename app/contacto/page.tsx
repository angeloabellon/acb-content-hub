export default function ContactoPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-16">

      <section className="text-center mb-20">

        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Contacto y Patrocinios
        </h1>

        <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Cast To Cast Baloncesto es un espacio dedicado a la actualidad
          del baloncesto nacional, con especial atención a los equipos
          de la Región de Murcia y de Málaga.
        </p>

      </section>

      <section className="mb-16">

        <div className="grid md:grid-cols-2 gap-8">

          <div className="group relative overflow-hidden bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 rounded-2xl p-8 border border-red-900/40 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300"></div>

            <div className="relative z-10">

              <h2 className="text-3xl font-bold mb-4 group-hover:text-orange-400 transition-colors">
                Colaboraciones
              </h2>

              <p className="text-gray-200 leading-relaxed">
                ¿Quieres participar en el programa, colaborar o proponer
                contenido? Estamos abiertos a nuevas ideas, invitados y
                proyectos relacionados con el baloncesto y la comunicación
                deportiva.
              </p>

            </div>

          </div>

          <div className="group relative overflow-hidden bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 rounded-2xl p-8 border border-red-900/40 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300"></div>

            <div className="relative z-10">

              <h2 className="text-3xl font-bold mb-4 group-hover:text-orange-400 transition-colors">
                Patrocinios
              </h2>

              <p className="text-gray-200 leading-relaxed">
                Si representas a una marca, empresa o entidad y quieres
                asociarte con Cast To Cast Baloncesto, estaremos encantados
                de estudiar propuestas de patrocinio, colaboraciones y
                visibilidad.
              </p>

            </div>

          </div>

        </div>

      </section>

      <section>

        <div className="bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 rounded-2xl p-8 border border-red-900/40 shadow-2xl">

          <h2 className="text-3xl font-bold mb-6">
            Contacto
          </h2>

          <div className="space-y-4 text-lg text-gray-100">

            <p>
                📩{" "}
                <a
                href="mailto:cast2cast.sports@gmail.com"
                className="hover:text-orange-400 transition-colors duration-300"
                >
                cast2cast.sports@gmail.com
                </a>
            </p>

            <p>
                🐦 X / Twitter:{" "}
                <a
                href="https://x.com/casttocast2"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-orange-400 transition-colors duration-300"
                >
                @casttocast2
                </a>
            </p>

            <p>
                📸 Instagram:{" "}
                <a
                href="https://instagram.com/casttocast2"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-orange-400 transition-colors duration-300"
                >
                @casttocast2
                </a>
            </p>

            </div>

        </div>

      </section>

    </main>
  );
}