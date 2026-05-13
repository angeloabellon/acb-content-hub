import Link from "next/link";
const teamMembers = [
  {
    name: "Cast To Cast",
    url: "https://x.com/casttocast2",
  },
  {
    name: "Antonio",
    url: "https://x.com/aluquillas",
  },
  {
    name: "Ayala",
    url: "https://x.com/JM8Ayala",
  },
  {
    name: "David",
    url: "https://x.com/david_seron",
  },
  {
    name: "Fernando",
    url: "https://x.com/DonMarcusH",
  },
  {
    name: "Ángel",
    url: "https://x.com/aoa2384",
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
    logo: "",
  },
];
export default function AboutPage() {
  return (
    
    <main className="max-w-6xl mx-auto px-6 py-16">

      <section className="text-center mb-24">

        <p className="uppercase tracking-[0.18em] text-red-300/80 text-sm font-semibold mb-5">
          Cast To Cast Baloncesto
        </p>

        <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] mb-8">
          Baloncesto desde la perspectiva
          <span className="block text-red-500">
            de sus aficionados
          </span>
        </h1>

        <p className="text-lg md:text-xl text-white/70 max-w-4xl mx-auto leading-relaxed">
          Cast To Cast es un espacio independiente dedicado al análisis,
          actualidad y debate sobre baloncesto, con especial atención al
          UCAM Murcia CB, Unicaja Málaga, Hozono Global Jairis,
          y las principales competiciones nacionales
          e internacionales.
        </p>

      </section>

      <section className="grid lg:grid-cols-2 gap-8 mb-20">

        <div className="bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 rounded-3xl p-8 border border-red-900/40 shadow-2xl">

          <h2 className="text-3xl font-bold mb-6">
            Qué encontrarás aquí
          </h2>

          <ul className="space-y-4 text-white/80 leading-relaxed">
            <li>
              • Tertulias y análisis semanales
            </li>

            <li>
              • Cobertura de actualidad ACB, BCL y competiciones FEB
            </li>

            <li>
              • Episodios especiales y entrevistas
            </li>

            <li>
              • Noticias de clubes y seguimiento diario
            </li>

            <li>
              • Fotografía y contenido multimedia
            </li>
          </ul>

        </div>

        <div className="bg-black/30 rounded-3xl p-8 border border-white/10">

          <h2 className="text-3xl font-bold mb-6">
            Un proyecto hecho por aficionados
          </h2>

          <p className="text-white/70 text-lg leading-relaxed">
            Cast To Cast nace desde la pasión por el baloncesto y el deseo
            de crear un espacio cercano, independiente y centrado en la
            conversación entre aficionados.
          </p>

          <p className="text-white/70 text-lg leading-relaxed mt-6">
            Nuestro objetivo es construir una comunidad donde compartir
            experiencias, opiniones, análisis y contenido alrededor de los
            clubes y competiciones que seguimos cada semana.
          </p>

        </div>

      </section>

      <section className="mb-16">

        <div className="flex items-center justify-between mb-8">

          <h2 className="text-3xl font-bold">
            Equipo y RRSS
          </h2>

          <Link
            href="/contacto"
            className="hidden md:inline-flex bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 px-5 py-3 rounded-xl border border-red-900/40 text-sm font-semibold hover:text-orange-400 transition-colors"
          >
            Contacto y patrocinios
          </Link>

        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">

          {teamMembers.map((member) => (
            <a
              key={member.name}
              href={member.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block overflow-hidden bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 rounded-2xl p-8 border border-red-900/40 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors duration-300"></div>

              <div className="relative z-10">

                <div className="relative w-20 h-20 mx-auto mb-6">

                  <img
                    src="/logoCTC.jpg"
                    alt="Cast To Cast"
                    className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 group-hover:opacity-0"
                  />

                  <img
                    src="/logo2526.png"
                    alt="Cast To Cast"
                    className="absolute inset-0 w-full h-full object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />

                </div>

                <h3 className="text-2xl font-bold text-center group-hover:text-orange-400 transition-colors">
                  {member.name}
                </h3>

              </div>

            </a>
          ))}

        </div>

      </section>
      <section className="mt-24">

  <h2 className="text-3xl font-bold mb-8">
    Colaboradores
  </h2>

  <div className="grid md:grid-cols-2 gap-6">

    {collaborators.map((collaborator) => (
      <a
        key={collaborator.name}
        href={collaborator.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 rounded-3xl p-8 border border-red-900/40 shadow-2xl hover:border-orange-400/40 transition-all duration-300 hover:-translate-y-2"
      >
        {collaborator.logo && (
  <div className="w-24 h-24 mb-6 flex items-center justify-center">
    <img
      src={collaborator.logo}
      alt={collaborator.name}
      className="max-w-full max-h-full object-contain"
    />
  </div>
)}

        <h3 className="text-2xl font-bold mb-3 group-hover:text-orange-400 transition-colors">
          {collaborator.name}
        </h3>

        <p className="text-white/70 text-lg">
          {collaborator.role}
        </p>

      </a>
    ))}

  </div>

</section>
      

    </main>
  );
}