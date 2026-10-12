import type { Metadata } from "next";
import Image from "next/image";

import CommunityConversationCard from "@/components/community/CommunityConversationCard";
import { communityConversations } from "@/data/community";
import { isCommunityBackendConfigured, listCommunityRootTopics } from "@/lib/community";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Comunidad",
  description:
    "La comunidad de Cast To Cast para seguir y comentar al UCAM Murcia en ACB y Basketball Champions League.",
  path: "/comunidad",
});

export const dynamic = "force-dynamic";

export default async function ComunidadPage() {
  const backendConfigured = isCommunityBackendConfigured();
  const topics = await listCommunityRootTopics();

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <section className="relative mb-16 overflow-hidden rounded-3xl border border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] px-5 py-12 shadow-[0_10px_40px_rgba(122,12,12,0.22)] sm:px-8 sm:py-16 md:px-14 md:py-20">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#7a0c0c]/35 via-transparent to-[#e01310]/15" />
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
              El baloncesto
              <span className="block text-red-500">se habla aquí</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
              Cuatro conversaciones permanentes para seguir al UCAM Murcia, Unicaja
              Málaga y Hozono Global Jairis. Entra, lee y responde en el hilo que
              quieras seguir.
            </p>
            <p className="mt-8 text-sm text-white/45">
              {backendConfigured
                ? "Elige una conversación para participar."
                : "Un espacio en construcción, con conversación de ejemplo."}
            </p>
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

      <section aria-labelledby="conversaciones-principales">
        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-red-300/70">
            Comunidad Cast To Cast
          </p>
          <h2 id="conversaciones-principales" className="text-2xl font-bold sm:text-3xl">
            Conversaciones principales
          </h2>
        </div>

        <div className="grid gap-7 lg:grid-cols-2">
          {communityConversations.map((conversation) => (
            <CommunityConversationCard
              key={conversation.key}
              conversation={conversation}
              topic={topics.find((topic) => topic.conversation === conversation.key)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
