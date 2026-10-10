import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import CommunitySpaceNav from "@/components/community/CommunitySpaceNav";
import CommunityTopicList from "@/components/community/CommunityTopicList";
import { getCommunitySpace } from "@/data/community";
import { listCommunityTopics } from "@/lib/community";
import { createMetadata } from "@/lib/seo";

const space = getCommunitySpace("bcl");

export const metadata: Metadata = createMetadata({
  title: "UCAM Murcia en BCL | Comunidad",
  description:
    "Conversaciones de la Comunidad CTC sobre el UCAM Murcia en Basketball Champions League.",
  path: "/comunidad/bcl",
});

export const dynamic = "force-dynamic";

export default async function ComunidadBclPage() {
  if (!space) return null;

  const topics = (await listCommunityTopics()).filter((topic) => topic.space === "bcl");

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <Link href="/comunidad" className="mb-8 inline-flex text-sm text-white/65 transition-colors hover:text-orange-300">
        ← Volver a Comunidad
      </Link>

      <section className="relative mb-12 overflow-hidden rounded-3xl border border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] px-6 py-10 shadow-[0_10px_40px_rgba(122,12,12,0.22)] sm:px-10 sm:py-14">
        <div className="premium-overlay" />
        <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <div className="mb-5 flex items-center gap-4">
              <Image src="/logoUCAM.png" alt="UCAM Murcia" width={58} height={58} className="h-14 w-14 object-contain" />
              <Image
                src="/logoBCL.png"
                alt="Basketball Champions League"
                width={132}
                height={43}
                className="h-9 w-auto object-contain opacity-90"
              />
            </div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-red-300/70">{space.eyebrow}</p>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">{space.title}</h1>
            <p className="mt-5 text-lg leading-relaxed text-white/70">{space.detail}</p>
          </div>
          <Link href="/comunidad/nuevo" className="inline-flex justify-center rounded-xl border border-red-900/40 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-1 hover:border-orange-400/40 hover:text-orange-300">
            Nuevo tema
          </Link>
        </div>
      </section>

      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <CommunitySpaceNav current="bcl" />
        <p className="text-sm text-white/50">{topics.length} conversaciones</p>
      </div>

      <CommunityTopicList topics={topics} />
    </main>
  );
}
