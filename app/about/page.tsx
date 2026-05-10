
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
export default function AboutPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-16">

      <section className="text-center mb-20">

        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Sobre Cast To Cast
        </h1>

        <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Un espacio creado por aficionados al baloncesto para compartir actualidad,
          análisis, debate y pasión por este deporte.
        </p>

      </section>
      <section className="mb-16">

        <h2 className="text-2xl font-bold mb-8">
          Nuestras RRSS
        </h2>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">

          {teamMembers.map((member) => (
            <a
              key={member.name}
              href={member.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-[#e0131080] rounded-2xl p-8 hover:bg-white/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >

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

              <h2 className="text-2xl font-bold text-center group-hover:text-orange-400 transition-colors">
                {member.name}
              </h2>

            </a>
          ))}

        </div>

      </section>

      
    </main>
  );
}