import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import CommunitySpaceCard from "@/components/community/CommunitySpaceCard";
import CommunitySpaceNav from "@/components/community/CommunitySpaceNav";
import CommunityTopicList from "@/components/community/CommunityTopicList";
import { communitySpaces } from "@/data/community";
import { isCommunityBackendConfigured, listCommunityTopics } from "@/lib/community";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Comunidad",
  description:
    "La comunidad de Cast To Cast para seguir y comentar al UCAM Murcia en ACB y Basketball Champions League.",
  path: "/comunidad",
});

type ComunidadPageProps = {
  searchParams: Promise<{ view?: string }>;
};

export default async function ComunidadPage({
  searchParams,
}: ComunidadPageProps) {
  const { view } = await searchParams;
  const showingAllTopics = view === "all";
  const backendConfigured = isCommunityBackendConfigured();
  const allTopics = await listCommunityTopics();
  const topics = showingAllTopics ? allTopics : allTopics.slice(0, 3);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <section className="relative mb-16 overflow-hidden rounded-3xl border border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] px-5 py-12 shadow-[0_10px_40px_rgba(122,12,12,0.22)] sm:px-8 sm:py-16 md:px-14 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-[#7a0c0c]/35 via-transparent to-[#e01310]/15 pointer-events-none" />
        <div className="absolute -right-24 -top-16 h-80 w-80 rounded-full bg-red-600/10 blur-3xl" />

        <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <Image
                src="/logoCTC.jpg"
                alt="Cast To Cast"
                width={48}
                height={48}
                className="h-12 w-12 rounded-xl object-cover"
              />
              <Image
                src="/ctc_transparente.png"
                alt="Cast To Cast Baloncesto"
                width={130}
                height={48}
                className="h-10 w-auto object-contain"
              />
            </div>

            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-red-300/70">
              Comunidad Cast To Cast
            </p>
            <h1 className="max-w-3xl text-3xl font-extrabold leading-tight sm:text-4xl md:text-6xl">
              El UCAM Murcia
              <span className="block text-red-500">se habla aquí</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
              Comparte tu opinión sobre el equipo en Liga Endesa y Basketball
              Champions League. Dos espacios, una misma grada.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/comunidad/nuevo"
                className="inline-flex items-center justify-center rounded-xl border border-red-900/40 bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:text-orange-300"
              >
                Nuevo tema
              </Link>
              <span className="text-sm text-white/45">
                {backendConfigured
                  ? "La conversación acaba de empezar."
                  : "Un espacio en construcción, con conversación de ejemplo."}
              </span>
            </div>
          </div>

          <div className="hidden justify-center lg:flex">
            <div className="relative flex h-48 w-48 items-center justify-center rounded-full border border-red-900/30 bg-black/30 shadow-[0_0_80px_rgba(224,19,16,0.18)]">
              <Image
                src="/logoUCAM.png"
                alt="UCAM Murcia"
                width={132}
                height={132}
                className="h-32 w-32 object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mb-20">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-red-300/70">
              Dos espacios
            </p>
            <h2 className="text-2xl font-bold sm:text-3xl">Sigue al UCAM Murcia</h2>
          </div>
          <CommunitySpaceNav />
        </div>

        <div className="grid gap-7 lg:grid-cols-2">
          {communitySpaces.map((space) => (
            <CommunitySpaceCard
              key={space.slug}
              space={space}
              topicCount={allTopics.filter((topic) => topic.space === space.slug).length}
            />
          ))}
        </div>
      </section>

      <section id="conversaciones">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-red-300/70">
              Comunidad Cast To Cast
            </p>
            <h2 className="text-2xl font-bold sm:text-3xl">
              {showingAllTopics ? "Todas las conversaciones" : "Conversaciones recientes"}
            </h2>
          </div>
          <Link
            href={showingAllTopics ? "/comunidad#conversaciones" : "/comunidad?view=all#conversaciones"}
            className="text-sm font-semibold text-white/70 transition-colors hover:text-orange-300"
          >
            {showingAllTopics ? "Ver conversaciones recientes" : "Ver todas las conversaciones"}{" "}
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <CommunityTopicList topics={topics} showSpace />
      </section>
    </main>
  );
}
