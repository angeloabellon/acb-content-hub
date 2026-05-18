import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { teams } from "@/data/teams";
import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

type TeamPageProps = {
  params: Promise<{
    team: string;
  }>;
};
export async function generateMetadata({
  params,
}: TeamPageProps): Promise<Metadata> {
  const { team: teamSlug } = await params;

  // BUSCAR EQUIPO POR SLUG PARA SEO
  const team = teams.find((item) => item.slug === teamSlug);

  if (!team) {
    return createMetadata({
      title: "Cobertura no encontrada",
      path: `/news/equipos/${teamSlug}`,
    });
  }

  return createMetadata({
    title: `${team.name} - Cobertura`,
    description: team.description,
    path: `/news/equipos/${team.slug}`,
    image: team.logo,
    type: "article",
  });
}

export default async function TeamNewsPage({ params }: TeamPageProps) {
  const { team: teamSlug } = await params;

  // BUSCAR EQUIPO POR SLUG
  const team = teams.find((item) => item.slug === teamSlug);

  if (!team) {
    notFound();
  }

  return (
    <main className="max-w-6xl mx-auto px-6 mt-28 mb-24">
      {/* CABECERA DE COBERTURA */}
      <section
        className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${team.accent} p-8 md:p-12 mb-12`}
      >
        {/* LOGO DE FONDO DEL CLUB */}
        <div className="absolute inset-0 opacity-[0.14]">
          <Image
            src={team.logo}
            alt={team.name}
            fill
            className="object-contain p-8 scale-110"
          />
        </div>

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-black/30" />

        {/* CONTENIDO CABECERA */}
        <div className="relative z-10">
          <div className="relative w-16 h-16 mb-8">
            <Image
              src={team.leagueLogo}
              alt={team.name}
              fill
              className="object-contain"
            />
          </div>

          <p className="uppercase tracking-[0.18em] text-red-100/80 text-sm font-semibold mb-4">
            Cobertura
          </p>

          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
            {team.name}
          </h1>

          <p className="text-white/75 max-w-2xl">
            {team.description}
          </p>
        </div>
      </section>

      {/* ACCESOS DE COBERTURA */}
      <section className="grid md:grid-cols-3 gap-5">
        <Link
          href="/news"
          className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-orange-400/50 hover:bg-white/10 transition-colors"
        >
          <h2 className="text-xl font-bold mb-3">
            Actualidad
          </h2>

          <p className="text-sm text-white/65">
            Consulta la actualidad y últimas publicaciones de baloncesto.
          </p>
        </Link>

        <Link
          href="/videos"
          className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-orange-400/50 hover:bg-white/10 transition-colors"
        >
          <h2 className="text-xl font-bold mb-3">
            Vídeos
          </h2>

          <p className="text-sm text-white/65">
            Entrevistas, análisis y contenido audiovisual relacionado.
          </p>
        </Link>

        <Link
          href="/galeria"
          className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-orange-400/50 hover:bg-white/10 transition-colors"
        >
          <h2 className="text-xl font-bold mb-3">
            Galería
          </h2>

          <p className="text-sm text-white/65">
            Fotografías de partidos, jugadores y eventos.
          </p>
        </Link>
      </section>
    </main>
  );
}