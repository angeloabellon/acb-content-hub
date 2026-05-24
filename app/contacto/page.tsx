export default function ContactoPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <section className="relative overflow-hidden rounded-3xl border border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] px-5 py-12 sm:px-8 sm:py-16 md:px-14 md:py-24 mb-20 shadow-[0_10px_40px_rgba(122,12,12,0.22)]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#7a0c0c]/35 via-transparent to-[#e01310]/15 pointer-events-none" />

        <div className="relative z-10 text-center">
          <p className="uppercase tracking-[0.2em] text-red-300/70 text-xs font-semibold mb-5">
            Contacto y patrocinios
          </p>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Hablemos de baloncesto,
            <span className="block text-red-500">
              contenido y comunidad
            </span>
          </h1>

          <p className="text-lg text-white/70 max-w-3xl mx-auto leading-relaxed">
            Cast To Cast Baloncesto está abierto a colaboraciones,
            patrocinios, propuestas editoriales, invitados, fotografía,
            comunicación deportiva y proyectos vinculados al baloncesto.
          </p>
        </div>
      </section>

      <section className="mb-20">
        <div className="mb-10">
          <p className="uppercase tracking-[0.2em] text-red-300/70 text-xs font-semibold mb-4">
            Trabajemos juntos
          </p>

          <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">
            Diferentes formas de colaborar
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: "Colaboraciones",
              text: "Participa en el programa, propón contenidos, aporta análisis, fotografía, opinión o nuevas ideas vinculadas al baloncesto.",
            },
            {
              title: "Patrocinios",
              text: "Si representas a una marca, empresa o entidad, podemos estudiar fórmulas de visibilidad, patrocinio y colaboración.",
            },
            {
              title: "Invitados",
              text: "Jugadores, entrenadores, periodistas, fotógrafos, aficionados o protagonistas del baloncesto tienen espacio en Cast To Cast.",
            },
            {
              title: "Cobertura multimedia",
              text: "Vídeo, podcast, fotografía, actualidad y redes sociales integrados en una misma plataforma deportiva.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="group premium-card premium-hover p-8"
            >
              <h3 className="text-2xl font-bold mb-4 group-hover:text-orange-400 transition-colors">
                {item.title}
              </h3>

              <p className="text-white/65 leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-stretch">
        <div className="rounded-3xl border border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] p-8 shadow-[0_10px_40px_rgba(122,12,12,0.22)]">
          <p className="uppercase tracking-[0.2em] text-red-300/70 text-xs font-semibold mb-4">
            Contacto directo
          </p>

          <h2 className="text-3xl font-bold mb-6">
            Escríbenos
          </h2>

          <div className="space-y-5 text-lg text-gray-100">
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

        <div className="rounded-3xl border border-red-900/40 bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 p-8 md:p-10 shadow-2xl">
          <p className="uppercase tracking-[0.2em] text-red-100/70 text-xs font-semibold mb-4">
            Cast To Cast sigue creciendo
          </p>

          <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-6">
            Una plataforma multimedia para marcas, clubes y aficionados
          </h2>

          <p className="text-red-50/85 leading-relaxed mb-8">
            Nuestro objetivo es seguir construyendo un espacio independiente,
            cercano y profesional para contar el baloncesto desde la mirada de
            quienes lo viven cada semana.
          </p>

          <a
            href="mailto:cast2cast.sports@gmail.com?subject=Propuesta%20para%20Cast%20To%20Cast"
            className="inline-flex rounded-xl bg-black/30 px-6 py-3 font-semibold text-white border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:text-orange-300"
          >
            Enviar propuesta →
          </a>
        </div>
      </section>
    </main>
  );
}