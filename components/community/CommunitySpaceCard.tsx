import Image from "next/image";
import Link from "next/link";

import type { CommunitySpace } from "@/data/community";

type CommunitySpaceCardProps = {
  space: CommunitySpace;
  topicCount: number;
};

export default function CommunitySpaceCard({
  space,
  topicCount,
}: CommunitySpaceCardProps) {
  const isAcb = space.slug === "acb";

  return (
    <Link
      href={`/comunidad/${space.slug}`}
      className="premium-hover group relative min-h-[330px] overflow-hidden rounded-3xl border border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] p-7 shadow-[0_10px_40px_rgba(122,12,12,0.18)] sm:p-9"
    >
      <div className="premium-overlay" />
      <div className="absolute -right-12 -top-8 h-52 w-52 rounded-full bg-red-800/15 blur-3xl" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between gap-5">
          <p className="uppercase tracking-[0.2em] text-xs font-semibold text-red-300/70">
            {space.eyebrow}
          </p>
          {isAcb ? (
            <Image
              src="/logoEndesa.png"
              alt="Liga Endesa"
              width={76}
              height={36}
              className="h-9 w-auto object-contain opacity-80"
            />
          ) : (
            <Image
              src="/logoBCL.png"
              alt="Basketball Champions League"
              width={118}
              height={38}
              className="h-8 w-auto max-w-[7.5rem] object-contain opacity-90"
            />
          )}
        </div>

        <div className="my-auto pt-10">
          <Image
            src="/logoUCAM.png"
            alt="UCAM Murcia"
            width={82}
            height={82}
            className="mb-7 h-16 w-16 object-contain drop-shadow-[0_12px_20px_rgba(224,19,16,0.3)]"
          />

          <h2 className="text-3xl font-extrabold leading-tight transition-colors duration-300 group-hover:text-orange-300">
            {space.title}
          </h2>

          <p className="mt-4 max-w-lg leading-relaxed text-white/65">
            {space.description}
          </p>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/10 pt-5 text-sm font-semibold">
          <span className="text-white/55">{topicCount} conversaciones</span>
          <span className="text-white transition-colors group-hover:text-orange-300">
            Entrar al espacio <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
