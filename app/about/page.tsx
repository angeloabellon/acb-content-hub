import Image from "next/image";

const socialLinks = [
  {
    name: "X / Twitter",
    url: "https://x.com/casttocast2",
  },
  {
    name: "Instagram",
    url: "https://instagram.com/casttocast2",
  },
];

const collaborators = [
  {
    name: "MBDesign",
    role: "Diseño y merchandising",
    url: "https://instagram.com/mb.design86",
    logo: "/logombdesign.png",
  },
  {
    name: "Antonio Martínez",
    role: "Fotografía deportiva",
    url: "https://instagram.com/anmasa73sports",
    logo: "/fotoAntonio.jpg",
  },
  {
    name: "Emilio Sánchez-Bolea",
    role: "Firma invitada · La Verdad",
    url: "https://www.laverdad.es/autor/emilio-sanchez-bolea-4245.html",
    logo: "/fotoBolea.webp",
  },
];

export default function AboutPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <section className="relative overflow-hidden rounded-3xl border border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] px-5 py-12 sm:px-8 sm:py-16 md:px-14 md:py-24 mb-24 shadow-[0_10px_40px_rgba(122,12,12,0.22)]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#7a0c0c]/35 via-transparent to-[#e01310]/15 pointer-events-none" />

        <div className="relative z-10 text-center">
          <p className="uppercase tracking-[0.18em] text-red-300/80 text-sm font-semibold mb-5">
            Cast To Cast Baloncesto
          </p>

          <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold leading-[1.02] mb-8">
            Baloncesto desde la perspectiva
            <span className="block text-red-500">de sus aficionados</span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-4xl mx-auto leading-relaxed">
            Cast To Cast es una plataforma multimedia independiente dedicada al
            análisis, actualidad y debate sobre baloncesto, con especial
            atención al UCAM Murcia CB, Unicaja Málaga, Hozono Global Jairis y
            el baloncesto FEB.
          </p>
        </div>
      </section>

      <section className="mb-24">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div>
            <p className="uppercase tracking-[0.2em] text-red-300/70 text-xs font-semibold mb-4">
              Nuestra identidad
            </p>

            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-8">
              Mucho más que un podcast
            </h2>

            <div className="space-y-6 text-white/70 text-lg leading-relaxed">
              <p>
                Cast To Cast nace desde la pasión por el baloncesto y la
                necesidad de crear un espacio donde el aficionado pueda sentirse
                identificado.
              </p>

              <p>
                Nuestra propuesta combina tertulia, análisis, actualidad,
                fotografía, vídeo y contenido multimedia con una mirada cercana,
                independiente y centrada en la experiencia real del baloncesto.
              </p>

              <p>
                Seguimos especialmente la actualidad del UCAM Murcia CB, Hozono
                Global Jairis, Unicaja Málaga y las competiciones nacionales e
                internacionales más relevantes.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] p-8 shadow-[0_10px_40px_rgba(122,12,12,0.22)]">
            <div className="space-y-5">
              {[
                {
                  title: "Podcast",
                  text: "Tertulias y episodios especiales con colaboradores e invitados.",
                },
                {
                  title: "Multimedia",
                  text: "Vídeo, fotografía y contenido visual orientado al aficionado.",
                },
                {
                  title: "Actualidad",
                  text: "Noticias, artículos y cobertura diaria del entorno del baloncesto.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl bg-black/25 border border-white/10 p-5"
                >
                  <p className="text-sm uppercase tracking-[0.18em] text-red-300/70 font-semibold mb-2">
                    {item.title}
                  </p>

                  <p className="text-white/80">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-24">
        <div className="mb-12">
          <p className="uppercase tracking-[0.2em] text-red-300/70 text-xs font-semibold mb-4">
            Equipo y colaboradores
          </p>

          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Las personas que hacen crecer Cast To Cast
          </h2>

          <p className="text-white/65 max-w-3xl leading-relaxed text-lg">
            Cast To Cast también se construye gracias a colaboradores que
            aportan fotografía, diseño, mirada periodística y contenido
            especializado al proyecto.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collaborators.map((collaborator) => (
            <a
              key={collaborator.name}
              href={collaborator.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-3xl border border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] p-8 shadow-[0_10px_40px_rgba(122,12,12,0.22)] transition-all duration-500 hover:-translate-y-2 hover:border-red-700/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#7a0c0c]/20 via-transparent to-[#e01310]/10 opacity-80" />

              <div className="relative z-10">
                {collaborator.logo && (
                  <div className="w-28 h-28 mb-6 overflow-hidden rounded-2xl bg-black/20 border border-white/10">
                    <Image
                      src={collaborator.logo}
                      alt={collaborator.name}
                      width={112}
                      height={112}
                      className="h-full w-full object-cover rounded-2xl"
                    />
                  </div>
                )}

                <h3 className="text-2xl font-bold mb-3 group-hover:text-orange-400 transition-colors">
                  {collaborator.name}
                </h3>

                <p className="text-white/70 text-lg">{collaborator.role}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="mb-24">
        <div className="mb-10">
          <p className="uppercase tracking-[0.2em] text-red-300/70 text-xs font-semibold mb-4">
            Línea editorial
          </p>

          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Baloncesto con voz propia
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "UCAM Murcia CB",
              text: "Seguimiento cercano de la actualidad, partidos y protagonistas del equipo murciano.",
              accent: "from-red-500/35",
              border: "border-red-500/30",
            },
            {
              title: "Hozono Global Jairis",
              text: "Espacio para el crecimiento del baloncesto femenino y su impacto en la Región de Murcia.",
              accent: "from-yellow-400/35",
              border: "border-yellow-400/30",
            },
            {
              title: "Unicaja Málaga",
              text: "Mirada especial a uno de los grandes proyectos del baloncesto nacional.",
              accent: "from-green-500/35",
              border: "border-green-500/30",
            },
            {
              title: "Baloncesto FEB",
              text: "Atención al ecosistema FEB, CB Cartagena y competiciones nacionales.",
              accent: "from-orange-400/35",
              border: "border-orange-400/30",
            },
          ].map((item) => (
            <div
              key={item.title}
              className={`rounded-3xl border ${item.border} bg-gradient-to-br ${item.accent} via-black to-[#220505] p-6 shadow-[0_10px_40px_rgba(122,12,12,0.18)] transition-all duration-300 hover:-translate-y-2`}
            >
              <h3 className="text-xl font-bold mb-4 text-white">
                {item.title}
              </h3>

              <p className="text-white/65 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

<section className="mb-16">
  <div className="mb-10">
    <p className="uppercase tracking-[0.2em] text-red-300/70 text-xs font-semibold mb-4">
      Comunidad
    </p>

    <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
      Nuestras redes sociales
    </h2>

    <p className="text-white/65 max-w-3xl leading-relaxed text-lg">
      Sigue Cast To Cast también fuera de la web: debate, actualidad,
      fotografías, vídeos y conversación con la comunidad.
    </p>
  </div>

  <div className="grid sm:grid-cols-2 gap-6">
    {socialLinks.map((social) => (
      <a
        key={social.name}
        href={social.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group premium-card premium-hover relative overflow-hidden p-8"
      >
        <div className="premium-overlay" />

        <div className="relative z-10">
          <p className="uppercase tracking-[0.18em] text-red-300/70 text-xs font-semibold mb-4">
            Cast To Cast
          </p>

          <h3 className="text-2xl md:text-3xl font-extrabold mb-4 group-hover:text-orange-400 transition-colors">
            {social.name}
          </h3>

          <p className="text-white/65 leading-relaxed mb-6">
            Actualidad, opinión y contenido multimedia del baloncesto desde la
            mirada del aficionado.
          </p>

          <span className="inline-flex items-center gap-2 text-sm font-semibold text-red-300 group-hover:text-orange-300 transition-colors">
            Visitar perfil →
          </span>
        </div>
      </a>
    ))}
  </div>
</section>
    </main>
  );
}