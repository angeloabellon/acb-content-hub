import Link from "next/link";

export default function UcamNewsPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 mt-28 mb-24">
      {/* CABECERA */}
      <section className="mb-12">
        <p className="uppercase tracking-[0.18em] text-red-300/80 text-sm font-semibold mb-4">
          Cobertura
        </p>

        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
          UCAM Murcia
        </h1>

        <p className="text-white/70 max-w-2xl">
          Noticias, vídeos y contenido multimedia sobre UCAM Murcia CB.
        </p>
      </section>

      {/* ESTADO TEMPORAL */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <h2 className="text-2xl font-bold mb-4">
          Contenido próximamente
        </h2>

        <p className="text-white/70 mb-6">
          Estamos preparando la página de cobertura específica de UCAM Murcia.
        </p>

        <Link
          href="/news"
          className="inline-flex bg-white text-black px-5 py-3 rounded-xl font-semibold hover:bg-orange-400 hover:text-white transition-colors"
        >
          Ver todas las noticias
        </Link>
      </section>
    </main>
  );
}