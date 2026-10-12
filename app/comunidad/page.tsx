import type { Metadata } from "next";
import Image from "next/image";

import CommunityConversationCard from "@/components/community/CommunityConversationCard";
import { communityConversations } from "@/data/community";
import { isCommunityBackendConfigured, listCommunityRootTopics } from "@/lib/community";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Comunidad",
  description:
    "La comunidad de Cast To Cast para seguir y comentar al UCAM Murcia, Unicaja Málaga, Hozono Global Jairis y Albacete Basket.",
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
        <div className="pointer-events-none absolute -right-24 -top-16 h-80 w-80 rounded-full bg-red-600/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-[15%] h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute right-[34%] top-1/3 h-52 w-52 rounded-full bg-amber-300/10 blur-3xl" />

        <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center lg:gap-14">
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
              El baloncesto {" "}
              <span className="bg-gradient-to-r from-red-400 via-red-500 to-orange-400 bg-clip-text text-transparent">
                se habla aquí
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
              UCAM Murcia, Unicaja Málaga, Hozono Global Jairis y Albacete Basket: toda la actualidad,
              los partidos y las noches de competición nacional y europea. Entra, lee
              y responde en la conversación que quieras seguir.
            </p>
            <p className="mt-8 text-sm text-white/45">
              {backendConfigured
                ? "Elige una conversación para participar."
                : "Un espacio en construcción, con conversación de ejemplo."}
            </p>
          </div>

          <div className="mx-auto grid w-full max-w-sm grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:max-w-none">
            <div className="group flex items-center justify-center">
              <div className="relative flex h-20 w-full items-center justify-center overflow-hidden rounded-2xl border border-red-400/40 bg-gradient-to-br from-red-500/35 via-[#300407] to-black shadow-[0_12px_32px_rgba(224,19,16,0.22)] sm:h-24">
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                <Image
                  src="/logoUCAM.png"
                  alt="Escudo del UCAM Murcia"
                  width={96}
                  height={96}
                  className="relative h-16 w-16 object-contain drop-shadow-[0_8px_12px_rgba(224,19,16,0.45)] sm:h-20 sm:w-20"
                />
              </div>
            </div>

            <div className="group flex items-center justify-center">
              <div className="relative flex h-20 w-full items-center justify-center overflow-hidden rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-emerald-500/30 via-[#03170d] to-black shadow-[0_12px_32px_rgba(16,185,129,0.18)] sm:h-24">
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                <Image
                  src="/logoUnicaja.png"
                  alt="Escudo del Unicaja Málaga"
                  width={96}
                  height={96}
                  className="relative h-16 w-16 object-contain drop-shadow-[0_8px_12px_rgba(16,185,129,0.4)] sm:h-20 sm:w-20"
                />
              </div>
            </div>

            <div className="group flex items-center justify-center">
              <div className="relative flex h-20 w-full items-center justify-center overflow-hidden rounded-2xl border border-amber-300/45 bg-gradient-to-br from-amber-300/30 via-[#211603] to-black shadow-[0_12px_32px_rgba(251,191,36,0.17)] sm:h-24">
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                <Image
                  src="/logoJairis.png"
                  alt="Escudo del Hozono Global Jairis"
                  width={96}
                  height={96}
                  className="relative h-16 w-16 object-contain drop-shadow-[0_8px_12px_rgba(251,191,36,0.4)] sm:h-20 sm:w-20"
                />
              </div>
            </div>

            <div className="group flex items-center justify-center">
              <div className="relative flex h-20 w-full items-center justify-center overflow-hidden rounded-2xl border border-green-300/45 bg-gradient-to-br from-green-400/30 via-[#0a2f1b] to-black shadow-[0_12px_32px_rgba(74,222,128,0.2)] sm:h-24">
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                <Image
                  src="/logoAlbaceteBasket.png"
                  alt="Escudo del Albacete Basket"
                  width={250}
                  height={167}
                  className="relative h-14 w-20 object-contain drop-shadow-[0_8px_12px_rgba(74,222,128,0.45)] sm:h-16 sm:w-24"
                />
              </div>
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
